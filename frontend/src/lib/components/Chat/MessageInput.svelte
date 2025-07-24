<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isLoading, isStreaming, modelStatus } from '$lib/stores';

	const dispatch = createEventDispatcher();

	export let placeholder = 'Type your message...';
	export let disabled = false;

	let message = '';
	let textArea: HTMLTextAreaElement;

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function sendMessage() {
		if (!$modelStatus.connected) {
			dispatch('openModelSettings');
			return;
		}

		if (message.trim() && !$isLoading && !$isStreaming) {
			dispatch('send', { content: message.trim() });
			message = '';
			adjustTextAreaHeight();
		}
	}

	function adjustTextAreaHeight() {
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = Math.min(textArea.scrollHeight, 200) + 'px';
		}
	}

	function stopGeneration() {
		dispatch('stop');
	}

	$: if (textArea) {
		adjustTextAreaHeight();
	}
</script>

<div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-end space-x-3">
			<div class="flex-1 relative">
				<textarea
					bind:this={textArea}
					bind:value={message}
					on:keydown={handleKeyDown}
					on:input={adjustTextAreaHeight}
					{placeholder}
					{disabled}
					rows="1"
					class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					style="min-height: 48px; max-height: 200px;"
				></textarea>
			</div>
			
			{#if $isStreaming}
				<button
					on:click={stopGeneration}
					class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm"
				>
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<rect x="6" y="6" width="12" height="12" rx="2" />
					</svg>
					<span>Stop</span>
				</button>
			{:else}
				<button
					on:click={sendMessage}
					disabled={!message.trim() || $isLoading || disabled}
					class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm"
				>
					{#if $isLoading}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>Sending...</span>
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
						</svg>
						<span>Send</span>
					{/if}
				</button>
			{/if}
		</div>
		
		{#if !$modelStatus.connected}
			<div class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
				<div class="flex items-center space-x-2">
					<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span class="text-sm text-red-700 dark:text-red-300 font-medium">
						No model connected
					</span>
				</div>
				<p class="text-xs text-red-600 dark:text-red-400 mt-1">
					Please configure a VLLM model to start chatting. Click the model button in the header to set up your connection.
				</p>
			</div>
		{:else}
			<div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
				Press Enter to send, Shift+Enter for new line
			</div>
		{/if}
	</div>
</div>
