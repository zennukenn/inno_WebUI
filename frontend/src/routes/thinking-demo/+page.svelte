<script lang="ts">
	import ThinkingIndicator from '$lib/components/Chat/ThinkingIndicator.svelte';
	import MessageItem from '$lib/components/Chat/MessageItem.svelte';
	import type { Message } from '$lib/types';
	
	let currentStage: 'starting' | 'thinking' | 'responding' = 'starting';
	let simulatedContent = '';
	let isStreaming = false;
	
	// 模拟思考内容
	const thinkingContent = `<thinking>
用户询问如何优化AI思考时的UI体验。这是一个很好的问题，我需要考虑以下几个方面：

1. 视觉反馈 - 用户需要知道AI正在思考
2. 进度指示 - 让用户了解思考的进展
3. 内容预览 - 适当显示思考过程
4. 状态转换 - 从思考到回答的平滑过渡

让我详细分析每个方面...
</thinking>

基于您的需求，我建议以下几个优化方案：

## 1. 智能状态检测
- 自动识别思考阶段
- 区分思考和回答状态
- 提供相应的视觉反馈

## 2. 进度可视化
- 基于内容长度的进度条
- 动态的思考短语轮换
- 平滑的动画过渡

## 3. 用户体验优化
- 避免重复的回复框
- 统一的消息渲染逻辑
- 响应式的界面设计`;

	// 模拟流式响应
	function simulateStreaming() {
		isStreaming = true;
		simulatedContent = '';
		currentStage = 'starting';
		
		let index = 0;
		const interval = setInterval(() => {
			if (index < thinkingContent.length) {
				simulatedContent += thinkingContent[index];
				index++;
				
				// 更新阶段
				if (simulatedContent.includes('<thinking>')) {
					currentStage = 'thinking';
				} else if (simulatedContent.includes('</thinking>')) {
					currentStage = 'responding';
				}
			} else {
				isStreaming = false;
				clearInterval(interval);
			}
		}, 50);
	}
	
	// 创建模拟消息
	$: simulatedMessage: Message = {
		id: 'demo-message',
		chat_id: 'demo-chat',
		role: 'assistant',
		content: simulatedContent,
		timestamp: Date.now() / 1000,
		metadata: {}
	};
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
			AI思考UI优化演示
		</h1>
		
		<!-- 控制面板 -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
			<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">控制面板</h2>
			
			<div class="flex flex-wrap gap-4 mb-6">
				<button
					on:click={simulateStreaming}
					disabled={isStreaming}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isStreaming ? '正在模拟...' : '开始模拟流式响应'}
				</button>
				
				<button
					on:click={() => { simulatedContent = ''; isStreaming = false; currentStage = 'starting'; }}
					class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
				>
					重置
				</button>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
				<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
					<div class="font-medium text-gray-900 dark:text-white">当前阶段</div>
					<div class="text-gray-600 dark:text-gray-300">{currentStage}</div>
				</div>
				<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
					<div class="font-medium text-gray-900 dark:text-white">内容长度</div>
					<div class="text-gray-600 dark:text-gray-300">{simulatedContent.length} 字符</div>
				</div>
				<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
					<div class="font-medium text-gray-900 dark:text-white">流式状态</div>
					<div class="text-gray-600 dark:text-gray-300">{isStreaming ? '进行中' : '已停止'}</div>
				</div>
			</div>
		</div>
		
		<!-- 思考指示器演示 -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
			<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">思考指示器组件</h2>
			
			<div class="space-y-4">
				<div>
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">开始阶段</h3>
					<ThinkingIndicator stage="starting" content="" isVisible={true} />
				</div>
				
				<div>
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">思考阶段（带进度）</h3>
					<ThinkingIndicator 
						stage="thinking" 
						content={simulatedContent} 
						isVisible={true} 
						showProgress={true}
					/>
				</div>
				
				<div>
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">回答阶段</h3>
					<ThinkingIndicator stage="responding" content="" isVisible={true} />
				</div>
			</div>
		</div>
		
		<!-- 完整消息演示 -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
			<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">完整消息演示</h2>
			
			{#if simulatedContent}
				<MessageItem 
					message={simulatedMessage}
					{isStreaming}
				/>
			{:else}
				<div class="text-gray-500 dark:text-gray-400 text-center py-8">
					点击"开始模拟流式响应"查看效果
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* 确保演示页面的样式正确 */
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
</style>
