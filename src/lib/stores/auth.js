import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initialToken = browser ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) : null;
const initialUserString = browser ? (localStorage.getItem('user_data') || sessionStorage.getItem('user_data')) : null;
const initialUser = initialUserString ? JSON.parse(initialUserString) : null;

export const token = writable(initialToken);
export const user = writable(initialUser);

export function setLogin(newToken, userData, remember = false) {
	token.set(newToken);
	user.set(userData);
	
	if (browser) {
		if (remember) {
			localStorage.setItem('auth_token', newToken);
			localStorage.setItem('user_data', JSON.stringify(userData));
		} else {
			sessionStorage.setItem('auth_token', newToken);
			sessionStorage.setItem('user_data', JSON.stringify(userData));
		}
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
