import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 8080
	},
	build: {
		outDir: 'build'
	},
	preview: {
		host: '0.0.0.0',
		port: 8080
	}
});
