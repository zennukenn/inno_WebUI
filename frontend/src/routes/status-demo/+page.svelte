<script lang="ts">
	import { getModelStatusConfig } from '$lib/utils/settings';
	
	// Demo status configurations
	const statusTypes = ['healthy', 'partial', 'error', 'unknown'] as const;
	
	// Demo scenarios
	const scenarios = [
		{
			name: 'Fully Configured & Connected',
			status: 'healthy' as const,
			description: 'VLLM URL configured, model selected, connection successful',
			settings: {
				vllmApiUrl: 'http://localhost:8000/v1',
				model: 'Qwen3-0.6B-GPTQ-Int8',
				connected: true
			}
		},
		{
			name: 'Configured but No Model Selected',
			status: 'partial' as const,
			description: 'VLLM URL configured and connected, but no model selected',
			settings: {
				vllmApiUrl: 'http://localhost:8000/v1',
				model: '',
				connected: true
			}
		},
		{
			name: 'Connection Failed',
			status: 'error' as const,
			description: 'VLLM URL configured, model selected, but connection failed',
			settings: {
				vllmApiUrl: 'http://localhost:8000/v1',
				model: 'Qwen3-0.6B-GPTQ-Int8',
				connected: false
			}
		},
		{
			name: 'No Configuration',
			status: 'error' as const,
			description: 'No VLLM URL configured',
			settings: {
				vllmApiUrl: '',
				model: '',
				connected: false
			}
		},
		{
			name: 'Initial State',
			status: 'unknown' as const,
			description: 'Application just started, status not yet determined',
			settings: {
				vllmApiUrl: '',
				model: '',
				connected: false
			}
		}
	];
</script>

<svelte:head>
	<title>Model Status Demo - VLLM Chat</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
				Model Status Indicator Demo
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Demonstration of the red, yellow, green status system for model configuration
			</p>
		</div>

		<!-- Status Types Overview -->
		<div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Status Types</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{#each statusTypes as statusType}
					{@const config = getModelStatusConfig(statusType)}
					<div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div class="w-4 h-4 rounded-full {config.bgColor}"></div>
						<div>
							<div class="font-medium {config.color}">{config.label}</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">{statusType}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Scenarios -->
		<div class="space-y-6">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Usage Scenarios</h2>
			
			{#each scenarios as scenario}
				{@const config = getModelStatusConfig(scenario.status)}
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-2">
								<h3 class="text-lg font-medium text-gray-900 dark:text-white">
									{scenario.name}
								</h3>
								<div class="flex items-center space-x-2">
									<div class="w-3 h-3 rounded-full {config.bgColor}"
										 class:animate-pulse={scenario.status === 'partial'}></div>
									<span class="text-sm {config.color}">{config.label}</span>
								</div>
							</div>
							<p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
								{scenario.description}
							</p>
						</div>
						
						<!-- Settings Button Demo -->
						<div class="ml-4">
							<button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors {config.color}"
									class:animate-pulse={scenario.status === 'partial'}
									title="{config.title}">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
								</svg>

							</button>
						</div>
					</div>
					
					<!-- Configuration Details -->
					<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
						<h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Configuration:</h4>
						<div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
							<div>VLLM URL: <code class="bg-gray-200 dark:bg-gray-600 px-1 rounded">{scenario.settings.vllmApiUrl || 'Not configured'}</code></div>
							<div>Model: <code class="bg-gray-200 dark:bg-gray-600 px-1 rounded">{scenario.settings.model || 'Not selected'}</code></div>
							<div>Connected: <span class="{scenario.settings.connected ? 'text-green-600' : 'text-red-600'}">{scenario.settings.connected ? 'Yes' : 'No'}</span></div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Back to Chat -->
		<div class="mt-8 text-center">
			<a href="/" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
				</svg>
				Back to Chat
			</a>
		</div>
	</div>
</div>
