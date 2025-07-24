<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { settings } from '$lib/stores';
	import { theme } from '$lib/utils/theme';

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}

	function updateSettings(key: string, value: any) {
		settings.update(s => ({ ...s, [key]: value }));
	}
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
	>
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
				<button
					on:click={closeModal}
					class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6">
				<!-- Theme Setting -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
						Theme
					</label>
					<div class="flex space-x-3">
						<button
							on:click={() => theme.set('light')}
							class="flex-1 p-3 rounded-lg border-2 transition-colors {$theme === 'light' 
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
						>
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
								<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
							</div>
						</button>
						<button
							on:click={() => theme.set('dark')}
							class="flex-1 p-3 rounded-lg border-2 transition-colors {$theme === 'dark' 
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
								: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
						>
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
								<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
							</div>
						</button>
					</div>
				</div>

				<!-- Model Settings -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Model
					</label>
					<input
						type="text"
						bind:value={$settings.model}
						on:input={(e) => updateSettings('model', e.target.value)}
						class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Model name"
					/>
				</div>

				<!-- Temperature -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Temperature: {$settings.temperature}
					</label>
					<input
						type="range"
						min="0"
						max="2"
						step="0.1"
						bind:value={$settings.temperature}
						on:input={(e) => updateSettings('temperature', parseFloat(e.target.value))}
						class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
					<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
						<span>0</span>
						<span>2</span>
					</div>
				</div>

				<!-- Max Tokens -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Max Tokens
					</label>
					<input
						type="number"
						min="1"
						max="4096"
						bind:value={$settings.maxTokens}
						on:input={(e) => updateSettings('maxTokens', parseInt(e.target.value))}
						class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<!-- System Prompt -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						System Prompt
					</label>
					<textarea
						bind:value={$settings.systemPrompt}
						on:input={(e) => updateSettings('systemPrompt', e.target.value)}
						rows="3"
						class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
						placeholder="Enter system prompt..."
					></textarea>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
				<button
					on:click={closeModal}
					class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
