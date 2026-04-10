import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			// SvelteKit handles routing; the SW should serve index.html for all nav requests
			injectRegister: 'auto',
			devOptions: {
				enabled: true
			},
			workbox: {
				// Precache the built SvelteKit assets
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
				// Cache canvas thumbnail images at runtime (served from the Laravel server)
				runtimeCaching: [
					{
						urlPattern: /\/storage\/.+\.(png|jpg|jpeg|webp|gif)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'canvas-thumbnails',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				],
				// Serve index.html for navigation requests that miss the cache (SPA fallback)
				navigateFallback: '/index.html'
			},
			manifest: {
				name: 'Place-it',
				short_name: 'Place-it',
				description: 'Collaborative pixel art',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/svg/logo.svg',
						sizes: 'any',
						type: 'image/svg+xml'
					}
				]
			}
		})
	],
	build: {
		sourcemap: true // Doesn't work with the "inline" option either
	},
	define: {
		// We use JSON.stringify to ensure it's wrapped in quotes (e.g. "1.0.0")
		// otherwise it might be inserted as 1.0.0 (which is invalid syntax)
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	server: {
		allowedHosts: ['place-it.test']
	}
});
