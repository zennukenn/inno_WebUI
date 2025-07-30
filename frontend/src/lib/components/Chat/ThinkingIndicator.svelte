<script lang="ts">
	import { onMount } from 'svelte';
	import { getThinkingProgress } from '$lib/utils/contentParser';

	export let stage: 'starting' | 'thinking' | 'responding' = 'thinking';
	export let content = '';
	export let isVisible = true;
	export let showProgress = false;
	
	let thinkingPhrases = [
		'正在分析问题...',
		'正在整理思路...',
		'正在深度思考...',
		'正在寻找最佳答案...',
		'正在组织语言...'
	];
	
	let currentPhrase = thinkingPhrases[0];
	let phraseIndex = 0;

	// 计算思考进度
	$: progress = stage === 'thinking' ? getThinkingProgress(content) : 0;

	onMount(() => {
		if (stage === 'thinking') {
			const interval = setInterval(() => {
				phraseIndex = (phraseIndex + 1) % thinkingPhrases.length;
				currentPhrase = thinkingPhrases[phraseIndex];
			}, 2000);

			return () => clearInterval(interval);
		}
	});
	
	$: stageConfig = {
		starting: {
			icon: 'M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707',
			text: '开始思考...',
			color: 'text-amber-500 dark:text-amber-400',
			bgColor: 'bg-amber-50 dark:bg-amber-900/20',
			borderColor: 'border-amber-200 dark:border-amber-800'
		},
		thinking: {
			icon: 'M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707',
			text: currentPhrase,
			color: 'text-amber-600 dark:text-amber-400',
			bgColor: 'bg-amber-50 dark:bg-amber-900/20',
			borderColor: 'border-amber-200 dark:border-amber-800'
		},
		responding: {
			icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
			text: '正在回答...',
			color: 'text-blue-600 dark:text-blue-400',
			bgColor: 'bg-blue-50 dark:bg-blue-900/20',
			borderColor: 'border-blue-200 dark:border-blue-800'
		}
	}[stage];
</script>

{#if isVisible}
	<div class="thinking-indicator flex items-center justify-center space-x-3 py-3 px-4 rounded-lg border {stageConfig.bgColor} {stageConfig.borderColor}">
		<!-- 图标 -->
		<div class="flex-shrink-0">
			<svg 
				class="w-5 h-5 {stageConfig.color} {stage === 'thinking' ? 'animate-spin' : 'animate-pulse'}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stageConfig.icon} />
			</svg>
		</div>
		
		<!-- 文本 -->
		<span class="text-sm font-medium {stageConfig.color}">
			{stageConfig.text}
		</span>
		
		<!-- 动画点 -->
		<div class="flex space-x-1">
			<div class="w-1.5 h-1.5 {stageConfig.color.replace('text-', 'bg-')} rounded-full animate-bounce" style="animation-delay: 0ms"></div>
			<div class="w-1.5 h-1.5 {stageConfig.color.replace('text-', 'bg-')} rounded-full animate-bounce" style="animation-delay: 150ms"></div>
			<div class="w-1.5 h-1.5 {stageConfig.color.replace('text-', 'bg-')} rounded-full animate-bounce" style="animation-delay: 300ms"></div>
		</div>
		
		<!-- 内容长度指示器 -->
		{#if content && stage === 'thinking'}
			<div class="text-xs {stageConfig.color} opacity-70">
				({content.length} 字符)
			</div>
		{/if}
	</div>

	<!-- 思考进度条 -->
	{#if showProgress && stage === 'thinking' && progress > 0}
		<div class="mt-2 px-4">
			<div class="flex items-center justify-between text-xs {stageConfig.color} mb-1">
				<span>思考进度</span>
				<span>{Math.round(progress)}%</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
				<div
					class="h-1.5 rounded-full transition-all duration-300 ease-out {stageConfig.color.replace('text-', 'bg-')}"
					style="width: {progress}%"
				></div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.thinking-indicator {
		animation: fadeInUp 0.3s ease-out;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 2s linear infinite;
	}
	
	@keyframes bounce {
		0%, 80%, 100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}
	
	.animate-bounce {
		animation: bounce 1.4s infinite ease-in-out both;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
