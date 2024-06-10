import { CompletionTriggerKind } from 'typescript';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['NeueBit', 'system-ui']
		},
		extend: {
			cursor: {
				hand: 'url("/cursors/hand.svg"), pointer',
				pointer: 'url("/cursors/cursor.svg"), pointer',
				selection: 'url("/cursors/selection.svg"), pointer'
			},
			colors: {
				'tea-rose': {
					DEFAULT: '#F7CACA',
					focus: '#D4A0A0'
				},
				'naples-yellow': {
					DEFAULT: '#F4DE5B',
					focus: '#E5C246'
				},
				'fluorescent-cyan': {
					DEFAULT: '#49E8E0',
					focus: '#41C9C9'
				},
				'bittersweet-red': {
					DEFAULT: '#FF6955',
					focus: '#E64B35'
				},
				'off-white': '#F6F4F4',
				'dark-grey': '#504F4F',
				black: '#141414'
			},
			fontSize: {
				'3xl': [
					'32px',
					{
						fontWeight: 700
					}
				]
			}
		}
	},
	safelist: ['cursor-hand', 'cursor-pointer', 'cursor-selection', 'text-fluorescent-cyan'],
	plugins: []
};
