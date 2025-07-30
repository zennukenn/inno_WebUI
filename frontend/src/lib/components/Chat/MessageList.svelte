<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { messages, isStreaming } from '$lib/stores';
	import { scrollToBottom, isAtBottom } from '$lib/utils';
	import MessageItem from './MessageItem.svelte';
	import TypingIndicator from './TypingIndicator.svelte';
	import type { Message } from '$lib/types';

	export const chatId: string | null = null;

	let messagesContainer: HTMLElement;
	let shouldAutoScroll = true;
	let showScrollToBottom = false;
	let lastSeenMessageCount = 0;

	function handleScroll() {
		if (messagesContainer) {
			shouldAutoScroll = isAtBottom(messagesContainer);
			showScrollToBottom = !shouldAutoScroll && $messages.length > 0;

			console.log('📜 [DEBUG] Scroll event:', {
				scrollTop: messagesContainer.scrollTop,
				scrollHeight: messagesContainer.scrollHeight,
				clientHeight: messagesContainer.clientHeight,
				shouldAutoScroll,
				showScrollToBottom
			});

			// Update last seen message count when user scrolls to bottom
			if (shouldAutoScroll) {
				lastSeenMessageCount = $messages.length;
			}
		}
	}

	function scrollToBottomIfNeeded() {
		if (messagesContainer && shouldAutoScroll) {
			scrollToBottom(messagesContainer);
		}
	}

	function scrollToBottomManually() {
		if (messagesContainer) {
			scrollToBottom(messagesContainer, true);
			shouldAutoScroll = true;
			showScrollToBottom = false;
			lastSeenMessageCount = $messages.length;
		}
	}

	afterUpdate(() => {
		scrollToBottomIfNeeded();
	});

	function handleKeydown(event: KeyboardEvent) {
		// Ctrl/Cmd + End: Scroll to bottom
		if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
			event.preventDefault();
			scrollToBottomManually();
		}
		// Ctrl/Cmd + Home: Scroll to top
		if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
			event.preventDefault();
			if (messagesContainer) {
				messagesContainer.scrollTo({
					top: 0,
					behavior: 'smooth'
				});
			}
		}
	}

	onMount(() => {
		if (messagesContainer) {
			console.log('📏 [DEBUG] Messages container mounted:', {
				scrollHeight: messagesContainer.scrollHeight,
				clientHeight: messagesContainer.clientHeight,
				offsetHeight: messagesContainer.offsetHeight
			});
			messagesContainer.addEventListener('scroll', handleScroll);
			// Add keyboard event listener to window
			window.addEventListener('keydown', handleKeydown);
			return () => {
				messagesContainer.removeEventListener('scroll', handleScroll);
				window.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

<div class="relative h-full">
	<div
		bind:this={messagesContainer}
		class="absolute inset-0 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900 chat-messages-container"
		on:scroll={handleScroll}
	>
		<div class="max-w-4xl mx-auto space-y-6">
			{#if $messages.length === 0}
				<div class="text-center text-gray-500 dark:text-gray-400 mt-20">
					<div class="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
						<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
					</div>
					<h2 class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Start a conversation</h2>
					<p class="text-gray-500 dark:text-gray-400">Send a message to begin chatting with the AI assistant.</p>
				</div>
			{:else}
				{#each $messages as message, index (message.id)}
					<MessageItem
						{message}
						isStreaming={$isStreaming && index === $messages.length - 1 && message.role === 'assistant'}
					/>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Scroll to bottom button -->
	{#if showScrollToBottom}
		<div class="absolute bottom-4 right-4 flex items-center space-x-2 z-10">
			<!-- New messages indicator -->
			{#if $messages.length > lastSeenMessageCount}
				<div class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg scroll-to-bottom-btn">
					{$messages.length - lastSeenMessageCount} new
				</div>
			{/if}

			<!-- Scroll to bottom button -->
			<button
				on:click={scrollToBottomManually}
				class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 scroll-to-bottom-btn"
				title="Scroll to bottom{$messages.length > lastSeenMessageCount ? ` (${$messages.length - lastSeenMessageCount} new messages)` : ''}"
			>
				<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</button>
		</div>
	{/if}
</div>
