<script lang="ts">
	import { renderMarkdown, formatTime, copyToClipboard } from '$lib/utils';
	import type { Message } from '$lib/types';
	import { toast } from 'svelte-sonner';

	export let message: Message;
	export let isStreaming = false;

	let showActions = false;

	async function handleCopy() {
		try {
			await copyToClipboard(message.content);
			toast.success('Message copied to clipboard');
		} catch (error) {
			toast.error('Failed to copy message');
		}
	}

	$: renderedContent = renderMarkdown(message.content);
	$: isUser = message.role === 'user';
</script>

<div 
	class="flex {isUser ? 'justify-end' : 'justify-start'}"
	on:mouseenter={() => showActions = true}
	on:mouseleave={() => showActions = false}
>
	<div class="max-w-3xl {isUser ? 'order-2' : ''}">
		<div class="flex items-start space-x-3 {isUser ? 'flex-row-reverse space-x-reverse' : ''}">
			<!-- Avatar -->
			<div class="w-8 h-8 {isUser ? 'bg-green-500' : 'bg-blue-600'} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
				{#if isUser}
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				{:else}
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				{/if}
			</div>

			<!-- Message Content -->
			<div class="flex-1 min-w-0">
				<div class="flex items-center space-x-2 mb-2 {isUser ? 'justify-end' : ''}">
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						{isUser ? 'You' : 'Assistant'}
					</span>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						{formatTime(message.timestamp)}
					</span>
				</div>

				<div class="relative group">
					<div class="{isUser
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'}
						rounded-2xl px-4 py-3 {isStreaming ? 'message-enter' : ''} shadow-sm">
						{#if isUser}
							<div class="whitespace-pre-wrap break-words">
								{message.content}
							</div>
						{:else}
							<div class="prose prose-gray dark:prose-invert max-w-none prose-sm">
								{@html renderedContent}
							</div>
							{#if isStreaming}
								<div class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></div>
							{/if}
						{/if}
					</div>

					<!-- Message Actions -->
					{#if showActions && !isStreaming}
						<div class="absolute {isUser ? 'left-0' : 'right-0'} top-0 -mt-2 {isUser ? '-ml-12' : '-mr-12'} opacity-0 group-hover:opacity-100 transition-opacity">
							<div class="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-600">
								<button
									on:click={handleCopy}
									class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									title="Copy message"
								>
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
