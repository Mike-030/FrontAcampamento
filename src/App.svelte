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
    let isDarkMode = $state(true); // Começa no dark por padrão

    onMount(() => {
        const savedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("user_data");
        const savedTheme = localStorage.getItem("theme");
        
        // Recupera o tema salvo
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

<!-- Botão de Troca de Tema (Fica fixo em todas as telas por enquanto) -->
<button 
    onclick={toggleTheme}
    class="fixed bottom-6 right-6 z-50 bg-brand text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-xl"
    title="Trocar tema"
>
    {isDarkMode ? '☀️' : '🌙'}
</button>

<main class="w-full min-h-screen">
    {#if screen === "login"}
        <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={goToRegister} />
    {:else if screen === "register"}
        <Register onBackToLogin={goToLogin} />
    {:else if screen === "dashboard"}
        <Dashboard onLogout={handleLogout} />
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: "Inter", sans-serif;
    }
</style>
