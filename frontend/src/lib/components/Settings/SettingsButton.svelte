<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { settings } from '$lib/stores';

	const dispatch = createEventDispatcher();

	let showDropdown = false;

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function openModelSettings() {
		dispatch('openModelSettings');
		showDropdown = false;
	}

	function openGeneralSettings() {
		dispatch('openGeneralSettings');
		showDropdown = false;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.settings-dropdown')) {
			showDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative settings-dropdown">
	<button
		on:click={toggleDropdown}
		class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
		title="Settings"
	>
		<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	</button>

	{#if showDropdown}
		<div class="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
			<div class="p-3 border-b border-gray-700">
				<h3 class="text-sm font-semibold text-white">Settings</h3>
			</div>
			
			<div class="p-2">
				<button
					on:click={openModelSettings}
					class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
				>
					<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					Model Settings
				</button>
				
				<button
					on:click={openGeneralSettings}
					class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
				>
					<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
					</svg>
					General Settings
				</button>
			</div>
			
			<div class="p-3 border-t border-gray-700">
				<div class="text-xs text-gray-400">
					<div>Current Model: <span class="text-blue-400">{$settings.model}</span></div>
					<div>Temperature: {$settings.temperature}</div>
					<div>Max Tokens: {$settings.maxTokens}</div>
				</div>
			</div>
		</div>
	{/if}
</div>
