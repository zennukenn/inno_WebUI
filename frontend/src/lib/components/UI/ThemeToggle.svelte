<script lang="ts">
	import { theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';

	onMount(() => {
		theme.init();
	});
</script>

<button
	on:click={theme.toggle}
	class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
	title="Toggle theme"
>
	{#if $theme === 'light'}
		<!-- Moon icon for dark mode -->
		<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
		</svg>
	{:else}
		<!-- Sun icon for light mode -->
		<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	{/if}
</button>
