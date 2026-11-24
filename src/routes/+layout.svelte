<script>
	import '../app.css';
	import { isDarkMode } from '$lib/stores/theme.js';
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
