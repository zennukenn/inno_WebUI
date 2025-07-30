<script lang="ts">
	import { onMount } from 'svelte';

	let scrollContainer: HTMLElement;
	let messages: string[] = [];

	function generateMessages() {
		messages = [];
		for (let i = 1; i <= 50; i++) {
			messages.push(`This is test message number ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`);
		}
		messages = [...messages]; // Trigger reactivity
	}

	function addMessage() {
		messages = [...messages, `New message added at ${new Date().toLocaleTimeString()}`];
	}

	function clearMessages() {
		messages = [];
	}

	function scrollToBottom() {
		if (scrollContainer) {
			scrollContainer.scrollTo({
				top: scrollContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	function handleScroll() {
		if (scrollContainer) {
			console.log('Scroll event:', {
				scrollTop: scrollContainer.scrollTop,
				scrollHeight: scrollContainer.scrollHeight,
				clientHeight: scrollContainer.clientHeight
			});
		}
	}

	onMount(() => {
		if (scrollContainer) {
			console.log('Container mounted:', {
				scrollHeight: scrollContainer.scrollHeight,
				clientHeight: scrollContainer.clientHeight,
				offsetHeight: scrollContainer.offsetHeight
			});
		}
	});
</script>

<div class="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
	<!-- Header -->
	<div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Scroll Test Page</h1>
		<div class="flex space-x-3">
			<button
				on:click={generateMessages}
				class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
				Generate 50 Messages
			</button>
			<button
				on:click={addMessage}
				class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
			>
				Add Message
			</button>
			<button
				on:click={clearMessages}
				class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
			>
				Clear Messages
			</button>
			<button
				on:click={scrollToBottom}
				class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
			>
				Scroll to Bottom
			</button>
		</div>
	</div>

	<!-- Messages Container -->
	<div class="flex-1 min-h-0">
		<div
			bind:this={scrollContainer}
			class="h-full overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 chat-messages-container"
			on:scroll={handleScroll}
		>
			{#if messages.length === 0}
				<div class="text-center text-gray-500 dark:text-gray-400 mt-20">
					<p>No messages yet. Click "Generate 50 Messages" to test scrolling.</p>
				</div>
			{:else}
				{#each messages as message, index}
					<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
						<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Message #{index + 1}</div>
						<div class="text-gray-900 dark:text-white">{message}</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for this test */
	.chat-messages-container::-webkit-scrollbar {
		width: 8px;
	}

	.chat-messages-container::-webkit-scrollbar-track {
		background: rgba(156, 163, 175, 0.2);
		border-radius: 4px;
	}

	.chat-messages-container::-webkit-scrollbar-thumb {
		background: rgba(156, 163, 175, 0.6);
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.chat-messages-container::-webkit-scrollbar-thumb:hover {
		background: rgba(156, 163, 175, 0.8);
	}

	/* Firefox scrollbar support */
	.chat-messages-container {
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.6) rgba(156, 163, 175, 0.2);
	}
</style>
