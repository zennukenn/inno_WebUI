<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/api';
	import { fade, scale } from 'svelte/transition';
	import { modelStatus } from '$lib/stores';
	import { getModelStatusConfig } from '$lib/utils/settings';

	// Connection status interface
	interface ConnectionStatus {
		timestamp: number;
		backend: {
			status: 'healthy' | 'error' | 'unknown';
			message: string;
		};
		database: {
			status: 'healthy' | 'error' | 'unknown';
			message: string;
		};
		overall: 'healthy' | 'partial' | 'error' | 'unknown';
	}

	// Component props
	export let showDetails = false;
	export let autoRefresh = true;
	export let refreshInterval = 10000; // 10 seconds (reduced for faster feedback)

	// Component state
	let status: ConnectionStatus | null = null;
	let loading = false;
	let error: string | null = null;
	let intervalId: NodeJS.Timeout | null = null;
	let lastUpdated: Date | null = null;
	let retryCount = 0;
	let maxRetries = 3;

	// Use the same status configuration as the gear button
	function getStatusConfig(status: 'healthy' | 'partial' | 'error' | 'unknown') {
		return getModelStatusConfig(status);
	}

	// Check connection status
	async function checkStatus() {
		if (loading) return;

		loading = true;
		error = null;

		try {
			console.log('🔍 [DEBUG] Checking connection status... (attempt', retryCount + 1, 'of', maxRetries + 1, ')');

			// Use API client instead of hardcoded URL
			const result = await api.getConnectionStatus();
			console.log('🔍 [DEBUG] API result:', result);

			if (result.success && result.data) {
				console.log('✅ [DEBUG] Status data received:', result.data);
				status = result.data;
				lastUpdated = new Date();
				retryCount = 0; // Reset retry count on success
			} else {
				console.error('❌ [DEBUG] API call failed:', result.error);
				throw new Error(result.error || 'Failed to get connection status');
			}

		} catch (err) {
			console.error('❌ [DEBUG] Connection status check failed:', err);
			error = err instanceof Error ? err.message : 'Connection failed';

			// Retry logic
			if (retryCount < maxRetries) {
				retryCount++;
				console.log('🔄 [DEBUG] Retrying in 2 seconds... (attempt', retryCount + 1, 'of', maxRetries + 1, ')');
				setTimeout(() => {
					loading = false;
					checkStatus();
				}, 2000);
				return; // Don't set loading to false yet
			} else {
				console.error('❌ [DEBUG] Max retries reached, giving up');
				status = null;
				retryCount = 0; // Reset for next manual check
			}
		} finally {
			if (retryCount === 0 || retryCount >= maxRetries) {
				loading = false;
			}
			console.log('🔍 [DEBUG] Status check completed. Loading:', loading, 'Status:', status, 'Error:', error);
		}
	}

	// Start auto-refresh
	function startAutoRefresh() {
		if (autoRefresh && !intervalId) {
			intervalId = setInterval(checkStatus, refreshInterval);
		}
	}

	// Stop auto-refresh
	function stopAutoRefresh() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	// Toggle details view
	function toggleDetails() {
		showDetails = !showDetails;
	}

	// Format timestamp - 使用北京时间
	function formatTime(date: Date): string {
		// 将时间转换为北京时间
		const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
		const beijingTime = new Date(utc + (8 * 3600000));
		return beijingTime.toLocaleTimeString('zh-CN', {
			timeZone: 'Asia/Shanghai',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}



	// Manual refresh function
	function manualRefresh() {
		console.log('🔄 [DEBUG] Manual refresh triggered');
		retryCount = 0; // Reset retry count for manual refresh
		checkStatus();
	}

	// Component lifecycle
	onMount(() => {
		console.log('🚀 [DEBUG] ConnectionStatus component mounted');
		// Small delay to ensure API client is ready
		setTimeout(() => {
			checkStatus();
			startAutoRefresh();
		}, 100);
	});

	onDestroy(() => {
		stopAutoRefresh();
	});

	// Reactive statements
	$: if (autoRefresh) {
		startAutoRefresh();
	} else {
		stopAutoRefresh();
	}
</script>

<!-- Connection Status Indicator -->
<div class="connection-status">
	<!-- Main Status Indicator -->
	<div class="flex items-center space-x-2">
		<!-- Status Light - Use model status instead of connection status -->
		<div class="relative">
			{#if loading}
				<div class="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
			{:else if $modelStatus}
				{@const config = getStatusConfig($modelStatus.status)}
				<div
					class="w-3 h-3 rounded-full {config.bgColor} shadow-sm"
					class:animate-pulse={$modelStatus.status === 'partial'}
					title="{config.label} - Model Status: {config.title}"
					transition:scale={{ duration: 200 }}
				></div>
			{:else}
				<div class="w-3 h-3 bg-red-500 rounded-full" title="Model Status Unknown"></div>
			{/if}
		</div>

		<!-- Status Text (optional) - Use model status -->
		{#if showDetails || error}
			<div class="text-sm">
				{#if loading}
					<span class="text-gray-500">Checking...</span>
				{:else if error}
					<span class="text-red-500">Error: {error}</span>
				{:else if $modelStatus}
					{@const config = getStatusConfig($modelStatus.status)}
					<span class="{config.color}">{config.label}</span>
				{:else}
					<span class="text-gray-500">Unknown</span>
				{/if}
			</div>
		{/if}

		<!-- Toggle Details Button -->
		<button
			on:click={toggleDetails}
			class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			title="Toggle connection details"
		>
			<svg 
				class="w-4 h-4 text-gray-500 transition-transform {showDetails ? 'rotate-180' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Refresh Button -->
		<button
			on:click={manualRefresh}
			disabled={loading}
			class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
			title="Refresh connection status"
		>
			<svg 
				class="w-4 h-4 text-gray-500 {loading ? 'animate-spin' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</button>
	</div>

	<!-- Detailed Status Panel -->
	{#if showDetails && status}
		<div 
			class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
			transition:fade={{ duration: 200 }}
		>
			<div class="space-y-2 text-sm">
				<!-- Backend Status -->
				<div class="flex items-center justify-between">
					<span class="text-gray-600 dark:text-gray-400">Backend:</span>
					<div class="flex items-center space-x-2">
						{#if status.backend}
							{@const config = getStatusConfig(status.backend.status)}
							<span class="w-2 h-2 rounded-full {config.bgColor}"></span>
							<span class="{config.color}">{status.backend.status}</span>
						{/if}
					</div>
				</div>

				<!-- Database Status -->
				<div class="flex items-center justify-between">
					<span class="text-gray-600 dark:text-gray-400">Database:</span>
					<div class="flex items-center space-x-2">
						{#if status.database}
							{@const config = getStatusConfig(status.database.status)}
							<span class="w-2 h-2 rounded-full {config.bgColor}"></span>
							<span class="{config.color}">{status.database.status}</span>
						{/if}
					</div>
				</div>



				<!-- Last Updated -->
				{#if lastUpdated}
					<div class="pt-2 border-t border-gray-200 dark:border-gray-600">
						<span class="text-xs text-gray-500">
							Last updated: {formatTime(lastUpdated)}
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.connection-status {
		@apply select-none;
	}
</style>
