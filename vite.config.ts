import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		sourcemap: true // Doesn't work with the "inline" option either
	},
	define: {
		// We use JSON.stringify to ensure it's wrapped in quotes (e.g. "1.0.0")
		// otherwise it might be inserted as 1.0.0 (which is invalid syntax)
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
});
