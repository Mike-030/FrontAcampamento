import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

function resolveInitialTheme() {
	if (!browser) return 'light';

	// Se houver usuário logado com tema salvo, prioriza o tema do usuário
	try {
		const storedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
		if (storedUser) {
			const parsed = JSON.parse(storedUser);
			if (parsed?.theme === 'light' || parsed?.theme === 'dark') {
				return parsed.theme;
			}
		}
	} catch {
		// Ignora JSON inválido no storage
	}

	const saved = localStorage.getItem('theme');
	return saved === 'light' || saved === 'dark' ? saved : 'light';
}

const initialTheme = resolveInitialTheme();

export const isDarkMode = writable(initialTheme === 'dark');

/** @type {((theme: 'light' | 'dark') => void) | null} */
let persistUserThemeHandler = null;

/** @param {(theme: 'light' | 'dark') => void} handler */
export function registerThemePersister(handler) {
	persistUserThemeHandler = handler;
}

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

/**
 * Aplica um tema específico sem disparar requisição ao servidor (ex.: ao fazer login)
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
	if (theme !== 'light' && theme !== 'dark') return;
	isDarkMode.set(theme === 'dark');
}

/**
 * Alterna entre tema claro e escuro e persiste no perfil do usuário logado (se houver)
 */
export function toggleTheme() {
	const nextIsDark = !get(isDarkMode);
	const nextTheme = nextIsDark ? 'dark' : 'light';
	isDarkMode.set(nextIsDark);

	if (persistUserThemeHandler) {
		persistUserThemeHandler(nextTheme);
	}
}
