<script lang="ts">
	import { renderMarkdown, formatTime, copyToClipboard } from '$lib/utils';
	import { parseContent, getContentSummary } from '$lib/utils/contentParser';
	import type { Message } from '$lib/types';
	import { toast } from 'svelte-sonner';
	import ContentBlock from './ContentBlock.svelte';

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
	$: isAssistant = message.role === 'assistant';
	$: parsedContent = isAssistant ? parseContent(message.content) : null;
	$: contentSummary = parsedContent ? getContentSummary(parsedContent) : '';
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

					<!-- 内容类型指示器 -->
					{#if isAssistant && parsedContent}
						<div class="flex items-center space-x-1">
							{#if parsedContent.hasThinking}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
									<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707" />
									</svg>
									思考
								</span>
							{/if}
							{#if parsedContent.hasCode}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
									<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
									</svg>
									代码
								</span>
							{/if}
							{#if parsedContent.blocks.some(b => b.type === 'list')}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
									<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
									</svg>
									列表
								</span>
							{/if}
						</div>
					{/if}

					<span class="text-xs text-gray-500 dark:text-gray-400">
						{formatTime(message.timestamp)}
					</span>
				</div>

				<div class="relative group">
					{#if isUser}
						<!-- 用户消息样式 -->
						<div class="bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-sm">
							<div class="whitespace-pre-wrap break-words">
								{message.content}
							</div>
						</div>
					{:else if isAssistant && parsedContent}
						<!-- AI助手消息 - 智能解析显示 -->
						<div class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 {isStreaming ? 'message-enter' : ''} shadow-sm">
							{#if parsedContent.blocks.length > 0}
								<!-- 显示解析后的内容块 -->
								{#each parsedContent.blocks as block, index}
									<ContentBlock {block} isStreaming={isStreaming && index === parsedContent.blocks.length - 1} />
								{/each}
							{:else}
								<!-- 回退到原始内容 -->
								<div class="prose prose-gray dark:prose-invert max-w-none prose-sm">
									{@html renderedContent}
									{#if isStreaming}
										<span class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></span>
									{/if}
								</div>
							{/if}
						</div>
					{:else}
						<!-- 其他角色消息的默认样式 -->
						<div class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm">
							<div class="prose prose-gray dark:prose-invert max-w-none prose-sm">
								{@html renderedContent}
							</div>
						</div>
					{/if}

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
