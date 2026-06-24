<script>
	import Register from '$lib/Register.svelte';
	import { token } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($token) {
			goto('/dashboard');
		}
	});
</script>

<svelte:head>
	<title>Registro - Acampamento</title>
</svelte:head>

{#if !$token}
	<Register />
{/if}
