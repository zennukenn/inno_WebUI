<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { ContentBlock } from '$lib/utils/contentParser';
	import { renderMarkdown } from '$lib/utils';

	export let block: ContentBlock;
	export let isStreaming = false;

	let isThinkingExpanded = false;
	let renderedContent = '';

	$: {
		if (block.type === 'code') {
			// 代码块不需要markdown渲染
			renderedContent = block.content;
		} else if (block.type === 'thinking') {
			// 思考过程使用简单的文本处理
			renderedContent = block.content.replace(/\n/g, '<br>');
		} else {
			// 其他内容使用markdown渲染
			renderedContent = renderMarkdown(block.content);
		}
	}

	// 如果是流式响应的思考过程，自动展开
	$: if (isStreaming && block.type === 'thinking' && !isThinkingExpanded) {
		isThinkingExpanded = true;
	}

	function toggleThinking() {
		isThinkingExpanded = !isThinkingExpanded;
	}

	function copyContent() {
		navigator.clipboard.writeText(block.content);
	}
</script>

{#if block.type === 'thinking'}
	<!-- 思考过程块 - 可折叠 -->
	<div class="thinking-block mb-4 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-900/10">
		<button
			on:click={toggleThinking}
			class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
		>
			<div class="flex items-center space-x-2">
				<svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707" />
				</svg>
				<span class="text-sm font-medium text-amber-800 dark:text-amber-200">
					{isStreaming ? '正在思考...' : '思考过程'}
				</span>
				{#if !isStreaming}
					<span class="text-xs text-amber-600 dark:text-amber-400">({block.content.length} 字符)</span>
				{/if}
				{#if isStreaming}
					<div class="flex space-x-1">
						<div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
						<div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
						<div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
					</div>
				{/if}
			</div>
			<svg
				class="w-4 h-4 text-amber-600 dark:text-amber-400 transform transition-transform {isThinkingExpanded ? 'rotate-180' : ''}"
				fill="none" stroke="currentColor" viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if isThinkingExpanded}
			<div transition:slide={{ duration: 300 }} class="px-4 pb-4">
				<div class="prose prose-sm max-w-none text-amber-800 dark:text-amber-200 bg-white dark:bg-gray-800 rounded p-3 border border-amber-200 dark:border-amber-700">
					{@html renderedContent}
					{#if isStreaming}
						<span class="inline-block w-2 h-4 bg-amber-500 animate-pulse ml-1 rounded-sm"></span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

{:else if block.type === 'code'}
	<!-- 代码块 -->
	<div class="code-block mb-4 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-800 border border-gray-700">
		<div class="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-700">
			<div class="flex items-center space-x-2">
				<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
				</svg>
				<span class="text-sm font-medium text-gray-300">
					{block.language || 'Code'}
				</span>
			</div>
			<button
				on:click={copyContent}
				class="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
				title="Copy code"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			</button>
		</div>
		<pre class="p-4 text-sm text-gray-100 overflow-x-auto"><code class="language-{block.language || 'text'}">{block.content}</code></pre>
	</div>

{:else if block.type === 'heading'}
	<!-- 标题块 -->
	<div class="heading-block mb-4">
		{#if block.level === 1}
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{block.content}</h1>
		{:else if block.level === 2}
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{block.content}</h2>
		{:else if block.level === 3}
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{block.content}</h3>
		{:else if block.level === 4}
			<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">{block.content}</h4>
		{:else if block.level === 5}
			<h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{block.content}</h5>
		{:else}
			<h6 class="text-xs font-semibold text-gray-900 dark:text-white mb-2">{block.content}</h6>
		{/if}
	</div>

{:else if block.type === 'list'}
	<!-- 列表块 -->
	<div class="list-block mb-4 pl-4 border-l-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg p-3">
		<div class="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
			{@html renderMarkdown(block.content)}
		</div>
	</div>

{:else if block.type === 'quote'}
	<!-- 引用块 -->
	<div class="quote-block mb-4 pl-4 border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg p-3">
		<div class="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 italic">
			{@html renderMarkdown(block.content)}
		</div>
	</div>

{:else if block.type === 'math'}
	<!-- 数学公式块 -->
	<div class="math-block mb-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
		<div class="text-center">
			{@html renderMarkdown(block.content)}
		</div>
	</div>

{:else}
	<!-- 主要内容块 -->
	<div class="main-content mb-4">
		<div class="prose prose-gray dark:prose-invert max-w-none prose-sm">
			{@html renderedContent}
			{#if isStreaming}
				<span class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.thinking-block {
		animation: fadeIn 0.3s ease-in-out;
	}
	
	.code-block {
		animation: slideIn 0.3s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	/* 代码高亮样式 */
	pre code {
		font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
		line-height: 1.5;
	}
	
	/* 思考过程样式 */
	.thinking-block .prose {
		font-size: 0.875rem;
		line-height: 1.6;
	}
</style>
