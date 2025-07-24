<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { theme } from '$lib/utils/theme';

	onMount(() => {
		theme.init();
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
