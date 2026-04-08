import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	server: {
		allowedHosts: ['.trycloudflare.com'],
		proxy: {
			'/api': 'http://localhost:3001',
			'/.proxy/api': {
				target: 'http://localhost:3001',
				rewrite: (path) => path.replace(/^\/.proxy/, ''),
			},
			'/ws': {
				target: 'ws://localhost:3001',
				ws: true,
			},
			'/.proxy/ws': {
				target: 'ws://localhost:3001',
				ws: true,
				rewrite: (path) => path.replace(/^\/.proxy/, ''),
			},
		},
	},
});
