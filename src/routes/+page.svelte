<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { token } from '$lib/stores/auth.js';

	onMount(() => {
		if ($token) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main"></div>
</div>
