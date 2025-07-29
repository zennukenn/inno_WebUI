<script lang="ts">
	import { settings } from '$lib/stores';
	import { toast } from 'svelte-sonner';

	export let isOpen = false;
	export let onClose: () => void;

	let localSettings = { ...$settings };

	function saveSettings() {
		settings.set(localSettings);
		// Settings are automatically persisted via the store
		toast.success('Settings saved successfully');
		onClose();
	}

	function resetSettings() {
		localSettings = {
			model: 'default',
			temperature: 0.7,
			maxTokens: 2048,
			systemPrompt: '',
			theme: 'dark',
			vllmApiUrl: 'http://localhost:8000/v1',
			vllmApiKey: ''
		};
	}

	// Update local settings when store changes
	$: localSettings = { ...$settings };
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-white">General Settings</h2>
				<button
					on:click={onClose}
					class="text-gray-400 hover:text-white"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-6">
				<!-- Temperature -->
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">
						Temperature: {localSettings.temperature}
					</label>
					<input
						type="range"
						min="0"
						max="2"
						step="0.1"
						bind:value={localSettings.temperature}
						class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
					/>
					<div class="flex justify-between text-xs text-gray-400 mt-1">
						<span>Conservative (0)</span>
						<span>Balanced (1)</span>
						<span>Creative (2)</span>
					</div>
					<p class="text-xs text-gray-400 mt-2">
						Controls randomness in responses. Lower values make output more focused and deterministic.
					</p>
				</div>

				<!-- Max Tokens -->
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">
						Max Tokens: {localSettings.maxTokens}
					</label>
					<input
						type="range"
						min="256"
						max="8192"
						step="256"
						bind:value={localSettings.maxTokens}
						class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
					/>
					<div class="flex justify-between text-xs text-gray-400 mt-1">
						<span>256</span>
						<span>4096</span>
						<span>8192</span>
					</div>
					<p class="text-xs text-gray-400 mt-2">
						Maximum number of tokens in the response. Higher values allow longer responses.
					</p>
				</div>

				<!-- System Prompt -->
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">
						System Prompt
					</label>
					<textarea
						bind:value={localSettings.systemPrompt}
						placeholder="Enter a system prompt to set the AI's behavior and personality..."
						rows="4"
						class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
					></textarea>
					<p class="text-xs text-gray-400 mt-2">
						System prompt helps define the AI's role and behavior. Leave empty for default behavior.
					</p>
				</div>

				<!-- Theme -->
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">
						Theme
					</label>
					<select
						bind:value={localSettings.theme}
						class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
					>
						<option value="dark">Dark</option>
						<option value="light">Light</option>
					</select>
					<p class="text-xs text-gray-400 mt-2">
						Choose your preferred color theme.
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-between mt-8">
				<button
					on:click={resetSettings}
					class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
				>
					Reset to Defaults
				</button>
				<div class="flex items-center space-x-3">
					<button
						on:click={onClose}
						class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={saveSettings}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						Save Settings
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		border: none;
	}
</style>
