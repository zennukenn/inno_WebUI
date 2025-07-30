<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { API_BASE_URL } from '$lib/constants';
	import { modelStatus, messages, currentChat, settings } from '$lib/stores';

	export let isOpen = false;

	let debugInfo = {
		apiBaseUrl: API_BASE_URL,
		modelStatus: null,
		lastError: null,
		requestCount: 0,
		responseTime: 0,
		memoryUsage: null,
		connectionStatus: 'unknown'
	};

	let logs: string[] = [];
	let autoRefresh = false;
	let refreshInterval: NodeJS.Timeout | null = null;

	function addLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		const emoji = {
			info: 'ℹ️',
			success: '✅',
			error: '❌',
			warning: '⚠️'
		}[type];
		logs = [...logs, `${timestamp} ${emoji} ${message}`];
		console.log(`${emoji} [DebugPanel] ${message}`);
	}

	function clearLogs() {
		logs = [];
	}

	async function refreshDebugInfo() {
		try {
			addLog('Refreshing debug information...');
			
			// Test API connection
			const startTime = Date.now();
			const healthResponse = await fetch(`${API_BASE_URL}/health`);
			const responseTime = Date.now() - startTime;

			if (healthResponse.ok) {
				debugInfo.connectionStatus = 'connected';
				debugInfo.responseTime = responseTime;
				addLog(`Main health check passed (${responseTime}ms)`, 'success');
			} else {
				debugInfo.connectionStatus = 'error';
				addLog(`Main health check failed: ${healthResponse.status}`, 'error');
			}

			// Get model status from store
			try {
				const { modelStatus } = await import('$lib/stores');
				let currentModelStatus;
				const unsubscribe = modelStatus.subscribe(status => currentModelStatus = status);
				unsubscribe();

				debugInfo.modelStatus = currentModelStatus;
				addLog('Model status retrieved from store', 'success');
			} catch (error) {
				addLog(`Model status error: ${error.message}`, 'error');
			}

			// Get memory info if available
			try {
				const memoryResponse = await fetch(`${API_BASE_URL}/api/system/memory`);
				if (memoryResponse.ok) {
					debugInfo.memoryUsage = await memoryResponse.json();
					addLog('Memory usage retrieved', 'success');
				}
			} catch (error) {
				// Memory endpoint might not exist, that's ok
			}

			debugInfo.requestCount++;
		} catch (error) {
			debugInfo.connectionStatus = 'error';
			debugInfo.lastError = error.message;
			addLog(`Debug refresh error: ${error.message}`, 'error');
		}
	}

	function toggleAutoRefresh() {
		autoRefresh = !autoRefresh;
		if (autoRefresh) {
			refreshInterval = setInterval(refreshDebugInfo, 5000);
			addLog('Auto-refresh enabled (5s interval)', 'info');
		} else {
			if (refreshInterval) {
				clearInterval(refreshInterval);
				refreshInterval = null;
			}
			addLog('Auto-refresh disabled', 'info');
		}
	}

	function exportDebugData() {
		const debugData = {
			timestamp: new Date().toISOString(),
			debugInfo,
			logs,
			stores: {
				modelStatus: $modelStatus,
				messagesCount: $messages.length,
				currentChat: $currentChat,
				settings: $settings
			}
		};
		
		const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `debug-data-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		
		addLog('Debug data exported', 'success');
	}

	function closePanel() {
		isOpen = false;
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
		autoRefresh = false;
	}

	onMount(() => {
		if (isOpen) {
			addLog('Debug panel opened');
			refreshDebugInfo();
		}
	});

	$: if (isOpen) {
		addLog('Debug panel opened');
		refreshDebugInfo();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Debug Panel</h2>
				<div class="flex items-center space-x-2">
					<button
						on:click={refreshDebugInfo}
						class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
					>
						Refresh
					</button>
					<button
						on:click={toggleAutoRefresh}
						class="px-3 py-1 rounded text-sm {autoRefresh ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}"
					>
						{autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
					</button>
					<button
						on:click={exportDebugData}
						class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
					>
						Export
					</button>
					<button
						on:click={closePanel}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- System Info -->
					<div class="space-y-4">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white">System Information</h3>
						
						<div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">API Base URL:</span>
									<span class="font-mono text-gray-900 dark:text-white">{debugInfo.apiBaseUrl}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">Connection Status:</span>
									<span class="font-mono {debugInfo.connectionStatus === 'connected' ? 'text-green-600' : debugInfo.connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}">
										{debugInfo.connectionStatus}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">Response Time:</span>
									<span class="font-mono text-gray-900 dark:text-white">{debugInfo.responseTime}ms</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600 dark:text-gray-400">Request Count:</span>
									<span class="font-mono text-gray-900 dark:text-white">{debugInfo.requestCount}</span>
								</div>
							</div>
						</div>

						<!-- Model Status -->
						{#if debugInfo.modelStatus}
							<div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
								<h4 class="font-medium text-gray-900 dark:text-white mb-2">Model Status</h4>
								<pre class="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">{JSON.stringify(debugInfo.modelStatus, null, 2)}</pre>
							</div>
						{/if}

						<!-- Memory Usage -->
						{#if debugInfo.memoryUsage}
							<div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
								<h4 class="font-medium text-gray-900 dark:text-white mb-2">Memory Usage</h4>
								<pre class="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">{JSON.stringify(debugInfo.memoryUsage, null, 2)}</pre>
							</div>
						{/if}
					</div>

					<!-- Logs -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-medium text-gray-900 dark:text-white">Debug Logs</h3>
							<button
								on:click={clearLogs}
								class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
							>
								Clear Logs
							</button>
						</div>
						
						<div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg max-h-96 overflow-y-auto">
							{#if logs.length === 0}
								<p class="text-gray-500 dark:text-gray-400 text-sm">No logs yet...</p>
							{:else}
								{#each logs as log}
									<div class="text-xs font-mono mb-1 text-gray-800 dark:text-gray-200">
										{log}
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for logs */
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 3px;
	}
	
	:global(.dark) .overflow-y-auto::-webkit-scrollbar-thumb {
		background: #4a5568;
	}
</style>
