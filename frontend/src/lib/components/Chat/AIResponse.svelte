<script lang="ts">
	import { renderMarkdown } from '$lib/utils';
	import { slide } from 'svelte/transition';

	export let content: string;
	export let isStreaming = false;

	let showThinking = false;
	let thinkingContent = '';
	let responseContent = '';

	// 解析AI回答，分离思考部分和正式回答
	function parseAIResponse(text: string) {
		// 匹配思考标记：<thinking>...</thinking> 或 【思考】...【/思考】
		const thinkingRegex = /(?:<thinking>([\s\S]*?)<\/thinking>|【思考】([\s\S]*?)【\/思考】)/gi;
		const matches = [...text.matchAll(thinkingRegex)];
		
		if (matches.length > 0) {
			// 提取思考内容
			thinkingContent = matches.map(match => match[1] || match[2]).join('\n\n').trim();
			
			// 移除思考标记，获取正式回答
			responseContent = text.replace(thinkingRegex, '').trim();
		} else {
			thinkingContent = '';
			responseContent = text;
		}
	}

	$: parseAIResponse(content);
	$: hasThinking = thinkingContent.length > 0;
	$: renderedThinking = hasThinking ? renderMarkdown(thinkingContent) : '';
	$: renderedResponse = renderMarkdown(responseContent);
</script>

<div class="ai-response">
	<!-- 思考部分 -->
	{#if hasThinking}
		<div class="thinking-section mb-4">
			<!-- 思考标题栏 -->
			<button
				class="thinking-header w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				on:click={() => showThinking = !showThinking}
			>
				<div class="flex items-center space-x-2">
					<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
					<span class="text-sm font-medium text-gray-600 dark:text-gray-300">
						AI思考过程
					</span>
					<span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
						{showThinking ? '点击收起' : '点击展开'}
					</span>
				</div>
				<svg 
					class="w-4 h-4 text-gray-400 transition-transform duration-200 {showThinking ? 'rotate-180' : ''}"
					fill="none" 
					stroke="currentColor" 
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			<!-- 思考内容 -->
			{#if showThinking}
				<div 
					class="thinking-content border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-lg"
					transition:slide={{ duration: 300 }}
				>
					<div class="p-4 bg-gray-25 dark:bg-gray-800/30">
						<div class="prose prose-sm prose-gray dark:prose-invert max-w-none thinking-prose">
							{@html renderedThinking}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 正式回答部分 -->
	<div class="response-section">
		<div class="prose prose-gray dark:prose-invert max-w-none response-prose">
			{@html renderedResponse}
			{#if isStreaming}
				<span class="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1 rounded-sm"></span>
			{/if}
		</div>
	</div>
</div>

<style>
	/* 思考部分样式 */
	.thinking-section {
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.thinking-header {
		cursor: pointer;
		user-select: none;
	}

	.thinking-content {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	}

	:global(.dark) .thinking-content {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
	}

	/* 思考内容的特殊样式 */
	:global(.thinking-prose) {
		font-style: italic;
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	:global(.dark .thinking-prose) {
		color: #9ca3af;
	}

	:global(.thinking-prose h1),
	:global(.thinking-prose h2),
	:global(.thinking-prose h3),
	:global(.thinking-prose h4),
	:global(.thinking-prose h5),
	:global(.thinking-prose h6) {
		font-style: normal;
		font-weight: 600;
		color: #4b5563;
	}

	:global(.dark .thinking-prose h1),
	:global(.dark .thinking-prose h2),
	:global(.dark .thinking-prose h3),
	:global(.dark .thinking-prose h4),
	:global(.dark .thinking-prose h5),
	:global(.dark .thinking-prose h6) {
		color: #d1d5db;
	}

	:global(.thinking-prose code) {
		background-color: #e5e7eb;
		color: #374151;
		font-style: normal;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
	}

	:global(.dark .thinking-prose code) {
		background-color: #374151;
		color: #d1d5db;
	}

	:global(.thinking-prose pre) {
		background-color: #f3f4f6;
		border: 1px solid #e5e7eb;
		font-style: normal;
	}

	:global(.dark .thinking-prose pre) {
		background-color: #374151;
		border-color: #4b5563;
	}

	:global(.thinking-prose blockquote) {
		border-left: 4px solid #d1d5db;
		background-color: #f9fafb;
		font-style: normal;
		margin: 1rem 0;
		padding: 0.75rem 1rem;
	}

	:global(.dark .thinking-prose blockquote) {
		border-left-color: #6b7280;
		background-color: #1f2937;
	}

	/* 正式回答样式 */
	:global(.response-prose) {
		color: #374151;
		line-height: 1.7;
	}

	:global(.dark .response-prose) {
		color: #d1d5db;
	}

	:global(.response-prose h1),
	:global(.response-prose h2),
	:global(.response-prose h3),
	:global(.response-prose h4),
	:global(.response-prose h5),
	:global(.response-prose h6) {
		color: #111827;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.dark .response-prose h1),
	:global(.dark .response-prose h2),
	:global(.dark .response-prose h3),
	:global(.dark .response-prose h4),
	:global(.dark .response-prose h5),
	:global(.dark .response-prose h6) {
		color: #f9fafb;
	}

	:global(.response-prose code) {
		background-color: #f3f4f6;
		color: #dc2626;
		padding: 0.125rem 0.375rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global(.dark .response-prose code) {
		background-color: #374151;
		color: #fca5a5;
	}

	:global(.response-prose pre) {
		background-color: #1f2937;
		border: 1px solid #374151;
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.response-prose pre code) {
		background-color: transparent;
		color: #e5e7eb;
		padding: 0;
		border-radius: 0;
		font-size: 0.875rem;
		font-weight: 400;
	}

	:global(.response-prose blockquote) {
		border-left: 4px solid #3b82f6;
		background-color: #eff6ff;
		margin: 1.5rem 0;
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
	}

	:global(.dark .response-prose blockquote) {
		border-left-color: #60a5fa;
		background-color: #1e3a8a;
	}

	/* 动画效果 */
	.thinking-header:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .thinking-header:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	/* 响应式设计 */
	@media (max-width: 640px) {
		:global(.thinking-prose),
		:global(.response-prose) {
			font-size: 0.875rem;
		}
		
		.thinking-header {
			padding: 0.75rem;
		}
		
		.thinking-content .p-4 {
			padding: 0.75rem;
		}
	}
</style>
