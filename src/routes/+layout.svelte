<script>
	import '../app.css';
	import { isDarkMode, toggleTheme } from '$lib/stores/theme.js';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- BACKGROUND DINÂMICO 45º MONOCROMÁTICO -->
<div 
	class="fixed inset-0 z-[-1] transition-all duration-700"
	style={$isDarkMode 
		? 'background: linear-gradient(45deg, #020304, #0D0F11, #242830)'
		: 'background: linear-gradient(45deg, #C8BFB0, #E2D9CC, #F5F0E8)'}
>
</div>

<!-- Botão de Troca de Tema -->
<button 
	onclick={toggleTheme}
	class="fixed bottom-6 right-6 z-50 bg-secondary/80 backdrop-blur-md text-main p-3.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-border"
	aria-label="Trocar Tema"
>
	{#if $isDarkMode}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
		</svg>
	{/if}
</button>

<main class="w-full min-h-screen relative z-10">
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: "Inter", sans-serif;
		background: transparent;
		color: var(--text-primary);
		transition: color 0.5s ease;
	}
</style>
