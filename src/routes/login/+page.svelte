<script>
	import { token } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($token) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/?login=true', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Login - Acampamento</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
	<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main"></div>
</div>
