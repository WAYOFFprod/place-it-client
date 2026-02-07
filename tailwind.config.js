import { CompletionTriggerKind } from 'typescript';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['NeueBit', 'system-ui']
		},
		borderRadius: {
			DEFAULT: '8px',
			full: '9999px'
		},
		extend: {
			cursor: {
				hand: 'url("/cursors/hand.svg"), pointer',
				pointer: 'url("/cursors/cursor.svg") 5 0, pointer',
				selection: 'url("/cursors/selection.svg"), pointer',
				eraser: 'url("/cursors/erase.svg") 0 20, pointer',
				place: 'url("/cursors/plus.svg") 0 0, pointer'
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
			aspectRatio: {
				'7/5': '7 / 5'
			},
			fontSize: {
				md: [
					'14px',
					{
						fontWeight: 400
					}
				],
				lg: [
					'20px',
					{
						lineHeight: '20px'
					}
				],
				xl: [
					'24px',
					{
						fontWeight: 700,
						lineHeight: '17.14px'
					}
				],
				'2xl': [
					'28px',
					{
						fontWeight: 700
					}
				],
				'3xl': [
					'32px',
					{
						fontWeight: 700
					}
				]
			}
		}
	},
	safelist: [
		'cursor-hand',
		'cursor-pointer',
		'cursor-selection',
		'cursor-eraser',
		'cursor-place',
		'text-fluorescent-cyan'
	],
	plugins: []
};
