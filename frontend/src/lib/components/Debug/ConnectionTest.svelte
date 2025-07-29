<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { API_BASE_URL } from '$lib/constants';

	let testResults: string[] = [];
	let testing = false;

	function addResult(message: string, type: 'info' | 'success' | 'error' = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
		testResults = [...testResults, `${timestamp} ${emoji} ${message}`];
		console.log(`${emoji} [ConnectionTest] ${message}`);
	}

	function clearResults() {
		testResults = [];
	}

	async function runTests() {
		if (testing) return;
		
		testing = true;
		clearResults();
		
		addResult('Starting connection tests...');
		addResult(`API Base URL: ${API_BASE_URL}`);

		// Test 1: Basic fetch to health endpoint
		try {
			addResult('Test 1: Basic health check...');
			const response = await fetch(`${API_BASE_URL}/health`);
			if (response.ok) {
				const data = await response.json();
				addResult(`Health check passed: ${JSON.stringify(data)}`, 'success');
			} else {
				addResult(`Health check failed: ${response.status} ${response.statusText}`, 'error');
			}
		} catch (error) {
			addResult(`Health check error: ${error.message}`, 'error');
		}

		// Test 2: API client health check
		try {
			addResult('Test 2: API client health check...');
			const result = await api.healthCheck();
			if (result.success) {
				addResult(`API client health check passed: ${JSON.stringify(result.data)}`, 'success');
			} else {
				addResult(`API client health check failed: ${result.error}`, 'error');
			}
		} catch (error) {
			addResult(`API client health check error: ${error.message}`, 'error');
		}

		// Test 3: Connection status via direct fetch
		try {
			addResult('Test 3: Direct status fetch...');
			const response = await fetch(`${API_BASE_URL}/api/chat/status`);
			if (response.ok) {
				const data = await response.json();
				addResult(`Direct status fetch passed`, 'success');
				addResult(`Status: ${JSON.stringify(data, null, 2)}`);
			} else {
				addResult(`Direct status fetch failed: ${response.status} ${response.statusText}`, 'error');
			}
		} catch (error) {
			addResult(`Direct status fetch error: ${error.message}`, 'error');
		}

		// Test 4: API client connection status
		try {
			addResult('Test 4: API client connection status...');
			const result = await api.getConnectionStatus();
			if (result.success) {
				addResult(`API client connection status passed`, 'success');
				addResult(`Status: ${JSON.stringify(result.data, null, 2)}`);
			} else {
				addResult(`API client connection status failed: ${result.error}`, 'error');
			}
		} catch (error) {
			addResult(`API client connection status error: ${error.message}`, 'error');
		}

		// Test 5: CORS test
		try {
			addResult('Test 5: CORS test...');
			const response = await fetch(`${API_BASE_URL}/api/chat/status`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Origin': window.location.origin
				}
			});
			if (response.ok) {
				addResult(`CORS test passed`, 'success');
			} else {
				addResult(`CORS test failed: ${response.status} ${response.statusText}`, 'error');
			}
		} catch (error) {
			addResult(`CORS test error: ${error.message}`, 'error');
		}

		addResult('All tests completed!');
		testing = false;
	}

	onMount(() => {
		addResult('ConnectionTest component mounted');
		// Auto-run tests after a short delay
		setTimeout(runTests, 1000);
	});
</script>

<div class="connection-test p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Connection Test</h3>
		<div class="space-x-2">
			<button
				on:click={runTests}
				disabled={testing}
				class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			>
				{testing ? 'Testing...' : 'Run Tests'}
			</button>
			<button
				on:click={clearResults}
				class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
			>
				Clear
			</button>
		</div>
	</div>

	<div class="test-results max-h-96 overflow-y-auto bg-white dark:bg-gray-900 p-3 rounded border">
		{#if testResults.length === 0}
			<p class="text-gray-500 dark:text-gray-400">No test results yet...</p>
		{:else}
			{#each testResults as result}
				<div class="text-sm font-mono mb-1 text-gray-800 dark:text-gray-200">
					{result}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.connection-test {
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>
