<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { theme } from '$lib/utils/theme';
	import { initializeSettings } from '$lib/utils/settings';

	onMount(async () => {
		// Initialize theme
		theme.init();

		// Initialize application settings
		await initializeSettings();
	});
</script>

<main>
	<slot />
</main>

<Toaster
	theme={$theme}
	position="top-right"
	richColors
	closeButton
/>
