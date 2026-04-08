/**
 * Shadow Protocol Design System Tokens
 * Extracted from Stitch design system for use in Tailwind v4 + Svelte.
 */

export const colors = {
	background: '#0e0e13',
	surface: '#0e0e13',
	'surface-dim': '#0e0e13',
	'surface-bright': '#2c2b33',
	'surface-container-lowest': '#000000',
	'surface-container-low': '#131318',
	'surface-container': '#19191f',
	'surface-container-high': '#1f1f26',
	'surface-container-highest': '#25252c',
	'surface-variant': '#25252c',
	'surface-tint': '#ca98ff',
	primary: '#ca98ff',
	'primary-dim': '#9c42f4',
	'primary-container': '#c185ff',
	'primary-fixed': '#c185ff',
	'primary-fixed-dim': '#b772ff',
	secondary: '#2ff801',
	'secondary-dim': '#2be800',
	'secondary-container': '#106e00',
	tertiary: '#ff7073',
	'tertiary-dim': '#e90036',
	'tertiary-container': '#fc003b',
	error: '#ff6e84',
	'on-surface': '#f8f5fd',
	'on-surface-variant': '#acaab1',
	'on-background': '#f8f5fd',
	'on-primary': '#46007d',
	'on-primary-fixed': '#000000',
	'on-secondary': '#0b5800',
	'on-tertiary': '#49000a',
	outline: '#76747b',
	'outline-variant': '#48474d',
} as const;

export const fonts = {
	headline: "'Space Grotesk', sans-serif",
	body: "'Manrope', sans-serif",
	label: "'Space Grotesk', sans-serif",
} as const;
