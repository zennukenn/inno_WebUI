/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
					950: '#030712'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: 'inherit',
						a: {
							color: 'inherit',
							textDecoration: 'underline',
							fontWeight: '500'
						},
						'[class~="lead"]': {
							color: 'inherit'
						},
						strong: {
							color: 'inherit'
						},
						'ol > li::before': {
							color: 'inherit'
						},
						'ul > li::before': {
							backgroundColor: 'currentColor'
						},
						hr: {
							borderColor: 'currentColor',
							opacity: 0.3
						},
						blockquote: {
							color: 'inherit',
							borderLeftColor: 'currentColor',
							opacity: 0.8
						},
						h1: {
							color: 'inherit'
						},
						h2: {
							color: 'inherit'
						},
						h3: {
							color: 'inherit'
						},
						h4: {
							color: 'inherit'
						},
						'figure figcaption': {
							color: 'inherit'
						},
						code: {
							color: 'inherit'
						},
						'a code': {
							color: 'inherit'
						},
						pre: {
							color: 'inherit',
							backgroundColor: 'transparent'
						},
						thead: {
							color: 'inherit',
							borderBottomColor: 'currentColor'
						},
						'tbody tr': {
							borderBottomColor: 'currentColor'
						}
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
