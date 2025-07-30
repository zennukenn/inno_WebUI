<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { messages, isStreaming } from '$lib/stores';
	import { scrollToBottom, isAtBottom } from '$lib/utils';
	import MessageItem from './MessageItem.svelte';
	import TypingIndicator from './TypingIndicator.svelte';
	import type { Message } from '$lib/types';

	export let chatId: string | null = null;

	let messagesContainer: HTMLElement;
	let shouldAutoScroll = true;

	function handleScroll() {
		if (messagesContainer) {
			shouldAutoScroll = isAtBottom(messagesContainer);
		}
	}

	function scrollToBottomIfNeeded() {
		if (messagesContainer && shouldAutoScroll) {
			scrollToBottom(messagesContainer);
		}
	}

	afterUpdate(() => {
		scrollToBottomIfNeeded();
	});

	onMount(() => {
		if (messagesContainer) {
			messagesContainer.addEventListener('scroll', handleScroll);
			return () => {
				messagesContainer.removeEventListener('scroll', handleScroll);
			};
		}
	});
</script>

<div
	bind:this={messagesContainer}
	class="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900"
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
