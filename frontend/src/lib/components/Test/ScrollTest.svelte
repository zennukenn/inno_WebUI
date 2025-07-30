<script lang="ts">
	import { onMount } from 'svelte';
	import { messages } from '$lib/stores';
	import type { Message } from '$lib/types';

	function generateTestMessages() {
		const testMessages: Message[] = [];
		for (let i = 1; i <= 50; i++) {
			testMessages.push({
				id: `test-${i}`,
				chat_id: 'test-chat',
				role: i % 2 === 1 ? 'user' : 'assistant',
				content: `This is test message number ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
				timestamp: Math.floor(Date.now() / 1000) + i,
				metadata: {}
			});
		}
		messages.set(testMessages);
	}

	function clearMessages() {
		messages.set([]);
	}

	function addMessage() {
		const newMessage: Message = {
			id: `test-${Date.now()}`,
			chat_id: 'test-chat',
			role: 'assistant',
			content: `New message added at ${new Date().toLocaleTimeString()}. This is a longer message to test scrolling behavior when new content is added to the chat.`,
			timestamp: Math.floor(Date.now() / 1000),
			metadata: {}
		};
		messages.update(msgs => [...msgs, newMessage]);
	}
</script>

<div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Scroll Test Controls</h3>
	<div class="flex space-x-3">
		<button
			on:click={generateTestMessages}
			class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
		>
			Generate 50 Test Messages
		</button>
		<button
			on:click={addMessage}
			class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
		>
			Add New Message
		</button>
		<button
			on:click={clearMessages}
			class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
		>
			Clear Messages
		</button>
	</div>
	<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
		Use these buttons to test the scrolling functionality. Generate messages to test scrolling, add new messages to test auto-scroll behavior.
	</p>
</div>
