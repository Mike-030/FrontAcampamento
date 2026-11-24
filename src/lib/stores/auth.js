import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { applyTheme, registerThemePersister } from './theme.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const initialToken = browser ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
const initialUserString = browser ? (localStorage.getItem('user_data') || sessionStorage.getItem('user_data')) : null;
const initialUser = initialUserString ? JSON.parse(initialUserString) : null;

export const token = writable(initialToken);
export const user = writable(initialUser);

/**
 * Persiste o tema escolhido pelo usuário logado (storage + banco de dados)
 * @param {'light' | 'dark'} newTheme
 */
async function persistUserTheme(newTheme) {
	const currentToken = get(token);
	const currentUser = get(user);
	if (!currentToken || !currentUser?.id) return;

	const updatedUser = { ...currentUser, theme: newTheme };
	updateUser(updatedUser);

	if (browser) {
		localStorage.setItem(`user_theme_${currentUser.id}`, newTheme);
	}

	try {
		await fetch(`${API_URL}/v1/users/${currentUser.id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${currentToken}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ theme: newTheme }),
		});
	} catch (err) {
		console.error('Erro ao salvar preferência de tema do usuário:', err);
	}
}

registerThemePersister(persistUserTheme);

export function setLogin(newToken, userData, remember = false) {
	const savedLocalTheme =
		browser && userData?.id
			? localStorage.getItem(`user_theme_${userData.id}`)
			: null;

	const preferredTheme =
		userData?.theme === 'light' || userData?.theme === 'dark'
			? userData.theme
			: savedLocalTheme === 'light' || savedLocalTheme === 'dark'
				? savedLocalTheme
				: null;

	const normalizedUser = preferredTheme
		? { ...userData, theme: preferredTheme }
		: userData;

	token.set(newToken);
	user.set(normalizedUser);

	if (browser) {
		if (remember) {
			localStorage.setItem('auth_token', newToken);
			localStorage.setItem('user_data', JSON.stringify(normalizedUser));
		} else {
			sessionStorage.setItem('auth_token', newToken);
			sessionStorage.setItem('user_data', JSON.stringify(normalizedUser));
		}

		if (preferredTheme && normalizedUser?.id) {
			localStorage.setItem(`user_theme_${normalizedUser.id}`, preferredTheme);
		}
	}

	// Ao logar, aplica automaticamente o tema salvo no perfil do usuário
	if (preferredTheme) {
		applyTheme(preferredTheme);
	}
}

export function setLogout() {
	token.set(null);
	user.set(null);
	if (browser) {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_data');
		sessionStorage.removeItem('auth_token');
		sessionStorage.removeItem('user_data');
	}
}

export function updateUser(newUserData) {
	user.set(newUserData);
	if (browser) {
		if (sessionStorage.getItem('auth_token')) {
			sessionStorage.setItem('user_data', JSON.stringify(newUserData));
		} else if (localStorage.getItem('auth_token')) {
			localStorage.setItem('user_data', JSON.stringify(newUserData));
		}
	}
}
