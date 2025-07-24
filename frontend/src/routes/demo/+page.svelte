<script lang="ts">
	import AIResponse from '$lib/components/Chat/AIResponse.svelte';
	
	// 示例AI回答，包含思考部分
	const sampleResponse = `<thinking>
用户询问如何优化网站性能，这是一个很常见的问题。我需要从多个角度来回答：

1. 前端优化 - 代码分割、懒加载、图片优化等
2. 后端优化 - 缓存、数据库优化、CDN等  
3. 网络优化 - HTTP/2、压缩等
4. 监控和测量 - 性能指标、工具等

我应该提供具体可行的建议，而不是泛泛而谈。
</thinking>

# 网站性能优化指南

网站性能优化是一个系统性工程，需要从多个维度进行考虑。以下是一些关键的优化策略：

## 🚀 前端优化

### 代码优化
- **代码分割**：使用动态导入(dynamic imports)按需加载代码
- **Tree Shaking**：移除未使用的代码
- **压缩混淆**：使用工具如Terser压缩JavaScript代码

### 资源优化
- **图片优化**：
  - 使用现代格式如WebP、AVIF
  - 实现响应式图片
  - 添加懒加载
- **字体优化**：使用font-display: swap，预加载关键字体

## ⚡ 后端优化

### 缓存策略
- **浏览器缓存**：设置合适的Cache-Control头
- **CDN缓存**：使用内容分发网络
- **服务器缓存**：Redis、Memcached等

### 数据库优化
- 添加适当的索引
- 优化查询语句
- 使用连接池

## 📊 性能监控

使用工具如：
- **Lighthouse**：综合性能评估
- **WebPageTest**：详细的性能分析
- **Core Web Vitals**：关注用户体验指标

> 💡 **提示**：性能优化是一个持续的过程，需要定期监控和调整。

记住，**测量比猜测更重要**！`;

	const sampleResponse2 = `【思考】
这个问题涉及到React的状态管理。用户可能是初学者，我需要解释清楚useState的工作原理，包括：

1. 状态的异步更新特性
2. 函数式更新的概念
3. 为什么直接修改状态不会触发重新渲染
4. 提供具体的代码示例

我应该用简单易懂的语言来解释这些概念。
【/思考】

# React useState 详解

\`useState\` 是React中最基础也是最重要的Hook之一。让我来详细解释它的工作原理。

## 基本用法

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
\`\`\`

## 🔑 关键概念

### 1. 状态是异步更新的
React会批量处理状态更新，这意味着状态不会立即改变：

\`\`\`javascript
function handleClick() {
  setCount(count + 1);
  console.log(count); // 这里打印的仍然是旧值！
}
\`\`\`

### 2. 函数式更新
当新状态依赖于前一个状态时，使用函数式更新更安全：

\`\`\`javascript
// ✅ 推荐
setCount(prevCount => prevCount + 1);

// ❌ 可能有问题
setCount(count + 1);
\`\`\`

### 3. 对象和数组的更新
状态是不可变的，必须创建新的对象或数组：

\`\`\`javascript
// 对象更新
setUser(prevUser => ({
  ...prevUser,
  name: 'New Name'
}));

// 数组更新
setItems(prevItems => [...prevItems, newItem]);
\`\`\`

## ⚠️ 常见陷阱

1. **直接修改状态**：永远不要直接修改状态对象
2. **在循环中多次调用setState**：可能导致意外的结果
3. **忘记状态更新是异步的**：不要期望状态立即改变

希望这个解释对你有帮助！`;
</script>

<div class="container mx-auto p-8 max-w-4xl">
	<h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
		AI回答样式演示
	</h1>
	
	<div class="space-y-8">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
				示例1：使用 &lt;thinking&gt; 标签
			</h2>
			<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
				<AIResponse content={sampleResponse} />
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
				示例2：使用【思考】标签
			</h2>
			<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
				<AIResponse content={sampleResponse2} />
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
				示例3：流式输入效果
			</h2>
			<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
				<AIResponse content="这是一个正在输入的AI回答..." isStreaming={true} />
			</div>
		</div>
	</div>

	<div class="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
		<h3 class="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
			💡 使用说明
		</h3>
		<div class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
			<p><strong>思考标记支持：</strong></p>
			<ul class="list-disc list-inside space-y-1 ml-4">
				<li><code>&lt;thinking&gt;...&lt;/thinking&gt;</code> - XML风格标记</li>
				<li><code>【思考】...【/思考】</code> - 中文标记</li>
			</ul>
			<p class="mt-3"><strong>功能特性：</strong></p>
			<ul class="list-disc list-inside space-y-1 ml-4">
				<li>思考部分默认折叠，点击可展开</li>
				<li>思考内容使用斜体和灰色显示</li>
				<li>正式回答使用正常样式</li>
				<li>支持Markdown渲染</li>
				<li>支持流式输入效果</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	}
	
	:global(.dark) .container {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	}
</style>
