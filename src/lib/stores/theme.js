import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default to dark mode
const initialTheme = browser ? (localStorage.getItem('theme') || 'dark') : 'dark';

export const isDarkMode = writable(initialTheme === 'dark');

isDarkMode.subscribe((value) => {
	if (browser) {
		const theme = value ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		
		if (value) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
});

export function toggleTheme() {
	isDarkMode.update(n => !n);
}
