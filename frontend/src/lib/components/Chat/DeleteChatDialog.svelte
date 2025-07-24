<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	export let chatTitle = '';

	function handleConfirm() {
		dispatch('confirm');
		isOpen = false;
	}

	function handleCancel() {
		dispatch('cancel');
		isOpen = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		} else if (event.key === 'Enter') {
			handleConfirm();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<!-- Dialog -->
		<div 
			class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header with gradient -->
			<div class="px-6 py-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-red-100 dark:border-red-800">
				<div class="flex items-center space-x-4">
					<!-- Animated delete icon -->
					<div class="flex-shrink-0">
						<div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
							<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
					</div>
					
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
							Delete Chat
						</h3>
						<p class="text-sm text-red-600 dark:text-red-400 mt-1">
							This action cannot be undone
						</p>
					</div>
				</div>
			</div>

			<!-- Content -->
			<div class="px-6 py-5">
				<div class="space-y-4">
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						Are you sure you want to delete the chat 
						<span class="font-semibold text-gray-900 dark:text-white">"{chatTitle}"</span>?
					</p>
					
					<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<div class="flex items-start space-x-3">
							<svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<div class="text-sm">
								<p class="font-medium text-red-800 dark:text-red-200">
									All messages will be permanently lost
								</p>
								<p class="text-red-700 dark:text-red-300 mt-1">
									This includes all conversation history, attachments, and any shared content in this chat.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3">
				<button
					type="button"
					on:click={handleCancel}
					class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={handleConfirm}
					class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-all duration-200 hover:scale-105 transform"
				>
					<span class="flex items-center space-x-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						<span>Delete Chat</span>
					</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom backdrop blur for better browser support */
	.backdrop-blur-sm {
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}
	
	/* Smooth animations */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
