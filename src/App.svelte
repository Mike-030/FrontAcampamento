<script>
    import { onMount } from "svelte";
    import Login from "./lib/Login.svelte";
    import Dashboard from "./lib/Dashboard.svelte";
    import Register from "./lib/Register.svelte";

    // Estados Globais
    /** @type {string | null} */
    let token = $state(null);
    /** @type {any} */
    let user = $state(null);
    /** @type {string} */
    let screen = $state("login");
    
    // Estado do Tema (Escuro/Claro)
    let isDarkMode = $state(true);

    onMount(() => {
        const savedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("user_data");
        const savedTheme = localStorage.getItem("theme");
        
        if (savedTheme === "light") {
            isDarkMode = false;
        }
        applyTheme();

        if (savedToken) {
            token = savedToken;
            user = savedUser ? JSON.parse(savedUser) : null;
            screen = "dashboard";
        }
    });

    function applyTheme() {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem("theme", "light");
        }
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
    }

    /** @param {string} newToken @param {any} userData */
    function handleLoginSuccess(newToken, userData) {
        token = newToken;
        user = userData;
        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("user_data", JSON.stringify(userData));
        screen = "dashboard";
    }

    function handleLogout() {
        token = null;
        user = null;
        localStorage.clear();
        screen = "login";
    }

    function goToRegister() { screen = "register"; }
    function goToLogin() { screen = "login"; }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- BACKGROUND DINÂMICO 45º (LEVE E ELEGANTE) -->
<div class="fixed inset-0 z-[-1] transition-colors duration-700
            bg-gradient-to-br from-primary via-primary to-secondary
            dark:from-[#0a0c0e] dark:via-[#0f1214] dark:to-[#1a1d20]">
</div>

<!-- Botão de Troca de Tema -->
<button 
    onclick={toggleTheme}
    class="fixed bottom-6 right-6 z-50 bg-secondary/80 backdrop-blur-md text-main p-3.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-border"
    aria-label="Trocar Tema"
>
    {#if isDarkMode}
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
    {#if screen === "login"}
        <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={goToRegister} />
    {:else if screen === "register"}
        <Register onGoToLogin={goToLogin} />
    {:else if screen === "dashboard"}
        <Dashboard onLogout={handleLogout} />
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: "Inter", sans-serif;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: background-color 0.5s ease, color 0.5s ease;
    }
</style>
