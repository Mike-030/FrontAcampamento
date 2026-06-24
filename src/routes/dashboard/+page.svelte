<script>
	import Dashboard from '$lib/Dashboard.svelte';
	import { token } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!$token) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Dashboard - Acampamento</title>
</svelte:head>

{#if $token}
	<Dashboard />
{/if}
