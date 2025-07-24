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
	let streamingMessage = '';
	let streamingMessageId = '';

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

	export function addStreamingContent(content: string, messageId?: string) {
		if (messageId && messageId !== streamingMessageId) {
			streamingMessage = '';
			streamingMessageId = messageId;
		}
		streamingMessage += content;
		scrollToBottomIfNeeded();
	}

	export function finishStreaming(finalContent?: string) {
		if (finalContent !== undefined) {
			streamingMessage = finalContent;
		}
		
		// Add the final message to the messages store
		if (streamingMessage && chatId) {
			const newMessage: Message = {
				id: streamingMessageId || Date.now().toString(),
				chat_id: chatId,
				role: 'assistant',
				content: streamingMessage,
				timestamp: Math.floor(Date.now() / 1000)
			};
			
			messages.update(msgs => [...msgs, newMessage]);
		}
		
		streamingMessage = '';
		streamingMessageId = '';
		scrollToBottomIfNeeded();
	}

	export function clearStreaming() {
		streamingMessage = '';
		streamingMessageId = '';
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
		{#if $messages.length === 0 && !streamingMessage}
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
			{#each $messages as message (message.id)}
				<MessageItem {message} />
			{/each}
			
			{#if streamingMessage}
				<MessageItem 
					message={{
						id: streamingMessageId,
						chat_id: chatId || '',
						role: 'assistant',
						content: streamingMessage,
						timestamp: Math.floor(Date.now() / 1000)
					}}
					isStreaming={true}
				/>
			{:else if $isStreaming}
				<div class="flex justify-start">
					<div class="max-w-3xl">
						<div class="flex items-start space-x-3">
							<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div class="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm">
								<TypingIndicator />
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
