<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, modelStatus } from '$lib/stores';
	import { api } from '$lib/api';
	import { calculateModelStatus } from '$lib/utils/settings';
	import { toast } from 'svelte-sonner';
	import type { ModelInfo } from '$lib/types';

	export let isOpen = false;
	export let onClose: () => void;

	let models: ModelInfo[] = [];
	let loading = false;
	let isTestingConnection = false;

	async function testConnection() {
		if (!$settings.vllmApiUrl.trim()) {
			toast.error('Please enter VLLM API URL');
			return;
		}

		isTestingConnection = true;

		try {
			const response = await api.testVllmConnection($settings.vllmApiUrl, $settings.vllmApiKey);

			if (response.success && response.data) {
				models = response.data.models || [];

				// Calculate and set the new status
				const status = calculateModelStatus($settings, response);
				modelStatus.set(status);

				// Auto-select first model if no model is selected
				if (models.length > 0 && (!$settings.model || $settings.model === 'default' || $settings.model === '')) {
					settings.update(s => ({ ...s, model: models[0].id }));
					// Recalculate status with the new model
					const updatedSettings = { ...$settings, model: models[0].id };
					const updatedStatus = calculateModelStatus(updatedSettings, response);
					modelStatus.set(updatedStatus);
				}

				toast.success('Successfully connected to VLLM!');
			} else {
				throw new Error(response.error || 'Failed to connect');
			}
		} catch (error) {
			console.error('Connection test failed:', error);
			const status = calculateModelStatus($settings, { success: false, error: error.message });
			modelStatus.set(status);
			toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isTestingConnection = false;
		}
	}

	async function selectModel(modelId: string) {
		settings.update(s => ({ ...s, model: modelId }));

		// Recalculate status with the new model selection
		const updatedSettings = { ...$settings, model: modelId };
		const lastConnectionTest = $modelStatus.models.length > 0 ?
			{ success: true, data: { models: $modelStatus.models } } :
			undefined;
		const status = calculateModelStatus(updatedSettings, lastConnectionTest);
		modelStatus.set(status);

		toast.success(`Model switched to ${modelId}`);
		console.log('✅ [DEBUG] Model selected:', modelId);
	}

	function saveSettings() {
		// Settings are automatically saved via the store
		settings.save(); // Ensure settings are persisted
		toast.success('Settings saved');
		onClose();
	}

	function resetSettings() {
		const resetSettings = {
			...$settings,
			vllmApiUrl: 'http://localhost:8000/v1',
			vllmApiKey: '',
			model: ''
		};
		settings.update(s => resetSettings);

		// Calculate status for reset settings
		const status = calculateModelStatus(resetSettings);
		modelStatus.set(status);
		models = [];
	}

	// Auto-test connection when component mounts
	onMount(async () => {
		// Settings are already loaded by the store, no need to load again

		// Auto-test connection if URL is available and no model is selected
		if ($settings.vllmApiUrl && (!$settings.model || $settings.model === '')) {
			await testConnection();
		}
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-white">Model Configuration</h2>
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
				<!-- Connection Status -->
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-white">Connection Status</h3>
					<div class="flex items-center space-x-2">
						<div class="w-3 h-3 rounded-full {$modelStatus.connected ? 'bg-green-500' : 'bg-red-500'}"></div>
						<span class="text-sm text-gray-400">
							{$modelStatus.connected ? 'Connected' : 'Disconnected'}
						</span>
					</div>
				</div>

				<!-- VLLM API URL -->
				<div class="space-y-2">
					<label for="vllm-url" class="block text-sm font-medium text-gray-300">
						VLLM API URL
					</label>
					<input
						id="vllm-url"
						type="url"
						bind:value={$settings.vllmApiUrl}
						placeholder="http://localhost:8000/v1"
						class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
					/>
					<p class="text-xs text-gray-500">
						Enter the VLLM API endpoint URL (e.g., http://localhost:8000/v1)
					</p>
				</div>

				<!-- API Key (Optional) -->
				<div class="space-y-2">
					<label for="api-key" class="block text-sm font-medium text-gray-300">
						API Key (Optional)
					</label>
					<input
						id="api-key"
						type="password"
						bind:value={$settings.vllmApiKey}
						placeholder="Enter API key if required"
						class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
					/>
				</div>

				<!-- Test Connection Button -->
				<div class="flex space-x-3">
					<button
						on:click={testConnection}
						disabled={isTestingConnection || !$settings.vllmApiUrl.trim()}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
					>
						{#if isTestingConnection}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>Testing...</span>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							<span>Test Connection</span>
						{/if}
					</button>

					<button
						on:click={resetSettings}
						class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
					>
						Reset
					</button>
				</div>

				<!-- Connection Status -->
				{#if $modelStatus.error}
					<div class="p-3 bg-red-900/50 border border-red-700 rounded-lg">
						<div class="flex items-center space-x-2">
							<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span class="text-red-400 text-sm">Connection Error</span>
						</div>
						<p class="text-red-300 text-sm mt-1">{$modelStatus.error}</p>
					</div>
				{/if}

				<!-- Model Selection -->
				<div class="space-y-2">
					<label for="model-input" class="block text-sm font-medium text-gray-300">
						Model Name
					</label>
					{#if $modelStatus.connected && models.length > 0}
						<!-- Show dropdown when connected and models are available -->
						<select
							id="model-select"
							bind:value={$settings.model}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
						>
							<option value="">Select a model...</option>
							{#each models as model}
								<option value={model.id}>{model.id}</option>
							{/each}
						</select>
						<p class="text-xs text-gray-500">
							{models.length} model(s) available
						</p>
					{:else}
						<!-- Show text input when not connected or no models available -->
						<input
							id="model-input"
							type="text"
							bind:value={$settings.model}
							placeholder="Enter model name (e.g., llama-2-7b-chat)"
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
						/>
						<p class="text-xs text-gray-500">
							{#if !$modelStatus.connected}
								Test connection to see available models
							{:else}
								No models available from the server
							{/if}
						</p>
					{/if}
				</div>

				<!-- Model Parameters -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="temperature" class="block text-sm font-medium text-gray-300">
							Temperature: {$settings.temperature}
						</label>
						<input
							id="temperature"
							type="range"
							min="0"
							max="2"
							step="0.1"
							bind:value={$settings.temperature}
							class="w-full"
						/>
					</div>

					<div class="space-y-2">
						<label for="max-tokens" class="block text-sm font-medium text-gray-300">
							Max Tokens
						</label>
						<input
							id="max-tokens"
							type="number"
							min="1"
							max="8192"
							bind:value={$settings.maxTokens}
							class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- System Prompt -->
				<div class="space-y-2">
					<label for="system-prompt" class="block text-sm font-medium text-gray-300">
						System Prompt
					</label>
					<textarea
						id="system-prompt"
						bind:value={$settings.systemPrompt}
						placeholder="Enter system prompt (optional)"
						rows="3"
						class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
					></textarea>
				</div>

				<!-- Action Buttons -->
				<div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
					<button
						on:click={onClose}
						class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={saveSettings}
						class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
					>
						Save Settings
					</button>
				</div>
			</div>

		</div>
	</div>
{/if}
