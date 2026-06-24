<script>
	import Login from '$lib/Login.svelte';
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
	<title>Login - Acampamento</title>
</svelte:head>

{#if !$token}
	<Login />
{/if}
