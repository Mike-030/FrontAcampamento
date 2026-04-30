<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    import bgHero from "../assets/SaoMiguelArcanjo.png";

    /** @type {{ onLoginSuccess: Function, onGoToRegister: Function }} */
    let { onLoginSuccess, onGoToRegister } = $props();

    let email = $state("");
    let password = $state("");
    let loading = $state(false);
    let error = $state("");

    // Estado da Sidebar
    let isSidebarOpen = $state(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @param {Event} e */
    async function handleSubmit(e) {
        if (e) e.preventDefault();
        loading = true;
        error = "";

        try {
            const response = await fetch(`${API_URL}/v1/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                onLoginSuccess(data.token, data.data);
            } else {
                error = data.message || "E-mail ou senha incorretos.";
            }
        } catch (err) {
            error = "Sem conexão com o servidor.";
        } finally {
            loading = false;
        }
    }

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }
</script>

<!-- BOTÃO HAMBÚRGUER (Floating - Adaptado Mobile) -->
<button
    onclick={toggleSidebar}
    class="fixed top-4 left-4 md:top-6 md:left-6 z-[60]
           bg-bg-secondary/80 backdrop-blur-md
           w-12 h-12 md:w-14 md:h-14
           flex items-center justify-center rounded-2xl shadow-xl
           border border-border-ui text-text-primary
           active:scale-90 transition-all"
    aria-label="Botão Menu"
>
    {#if isSidebarOpen}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="md:w-7 md:h-7"
            ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
        >
    {:else}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="md:w-7 md:h-7"
            ><line x1="4" x2="20" y1="12" y2="12" /><line
                x1="4"
                x2="20"
                y1="6"
                y2="6"
            /><line x1="4" x2="20" y1="18" y2="18" /></svg
        >
    {/if}
</button>

<!-- BACKDROP -->
{#if isSidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onclick={toggleSidebar}
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] transition-opacity duration-300"
    ></div>
{/if}

<!-- SIDEBAR RESPONSIVA -->
<aside
    class="fixed top-0 left-0 h-full w-[280px] md:w-80 bg-bg-primary z-[55] shadow-2xl border-r border-border-ui flex flex-col transition-transform duration-500 ease-in-out
           {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
>
    <!-- Espaçamento no topo -->
    <div class="h-24 md:h-32"></div>

    <!-- Navegação Direta -->
    <nav class="flex-1 flex flex-col gap-2 md:gap-3 w-full p-6 text-left">
        <a
            href="https://www.google.com/maps/search/?api=1&query=Av.+Mato+Grosso,+415+-+Primavera+II,+Primavera+do+Leste+-+MT,+78850-000"
            target="_blank"
            class="flex items-center gap-4 text-text-secondary hover:text-brand transition-all p-4 rounded-2xl hover:bg-brand/5 group"
        >
            <div
                class="w-10 h-10 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path
                        d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                    /><circle cx="12" cy="10" r="3" /></svg
                >
            </div>
            <span class="font-bold text-sm tracking-wide">Onde Estamos</span>
        </a>

        <a
            href="https://www.instagram.com/campistasprimavera/"
            target="_blank"
            class="flex items-center gap-4 text-text-secondary hover:text-brand transition-all p-4 rounded-2xl hover:bg-brand/5 group"
        >
            <div
                class="w-10 h-10 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><rect
                        width="20"
                        height="20"
                        x="2"
                        y="2"
                        rx="5"
                        ry="5"
                    /><path
                        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                    /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg
                >
            </div>
            <div class="flex flex-col">
                <span class="font-bold text-sm tracking-wide leading-none"
                    >Instagram</span
                >
                <span
                    class="text-[9px] opacity-40 font-bold mt-1 tracking-wider uppercase"
                    >Seguir @campistas</span
                >
            </div>
        </a>
    </nav>

    <!-- Rodapé Oficial -->
    <div class="p-8 md:p-10 border-t border-border-ui/30 bg-bg-secondary/20">
        <p
            class="text-[9px] md:text-[10px] text-text-secondary/60 font-black text-center tracking-[0.2em] uppercase leading-relaxed"
        >
            Comunidade <br /> São Miguel Arcanjo
        </p>
    </div>
</aside>

<!-- CONTENT PRINCIPAL -->
<div
    class="fixed inset-0 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden"
>
    <div class="flex-1 flex items-center justify-center p-4">
        <!-- Box Centralizado -->
        <div
            class="w-full max-w-7xl md:h-[90vh] md:max-h-[850px] flex flex-col md:flex-row
                    bg-transparent md:bg-bg-secondary
                    border-none md:border md:border-border-ui
                    shadow-none md:shadow-2xl
                    md:rounded-[3rem] overflow-hidden"
        >
            <div class="hidden md:block md:w-1/2 relative bg-forest/10">
                <img
                    src={bgHero}
                    alt="São Miguel Arcanjo"
                    class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
                ></div>
                <div
                    class="relative z-10 p-12 flex flex-col justify-end h-full text-white"
                >
                    <h2
                        class="text-4xl lg:text-4xl font-black mb-3 leading-tight italic"
                    >
                        Quem como Deus?<br /><span
                            class="text-4xl lg:text-5xl text-brand"
                            >Ninguém como Deus!</span
                        >
                    </h2>
                    <p class="text-white/80 text-base lg:text-lg max-w-sm">
                        Portal destinado aos servos e campistas da Comunidade
                        São Miguel Arcanjo.
                    </p>
                </div>
            </div>

            <div
                class="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center items-center"
            >
                <header class="text-center w-full mb-0 relative">
                    <div class="w-full flex justify-center mb-2">
                        <img
                            src={logo}
                            alt="Logo"
                            class="pt-4 h-32 md:h-40 lg:h-50 max-w-full mt-4 drop-shadow-[0_0_30px_rgba(222,110,39,0.3)] object-contain"
                        />
                    </div>
                    <div class="relative z-10 mt-2">
                        <h1
                            class="text-text-primary text-2xl sm:text-4xl font-black mb-2"
                        >
                            Acesso
                        </h1>
                        <p
                            class="text-text-secondary text-[10px] md:text-sm font-bold opacity-60 uppercase tracking-widest leading-none"
                        >
                            Portal Comunidade São Miguel
                        </p>
                    </div>
                </header>

                <form
                    onsubmit={handleSubmit}
                    class="w-full max-w-sm space-y-4 mt-6 px-4"
                >
                    <div class="space-y-1.5 text-left w-full">
                        <label
                            for="email"
                            class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1"
                            >E-mail</label
                        >
                        <input
                            id="email"
                            bind:value={email}
                            type="email"
                            required
                            class="w-full bg-bg-secondary/40 md:bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div class="space-y-1.5 text-left w-full">
                        <label
                            for="password"
                            class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1"
                            >Senha</label
                        >
                        <input
                            id="password"
                            bind:value={password}
                            type="password"
                            required
                            class="w-full bg-bg-secondary/40 md:bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    {#if error}
                        <div
                            class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs text-center border-dashed"
                        >
                            {error}
                        </div>
                    {/if}
                    <div class="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            class="w-full bg-brand text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand/30"
                        >
                            {loading ? "Entrando..." : "Entrar agora"}
                        </button>
                    </div>
                </form>

                <footer class="mt-10 mb-12 text-center w-full">
                    <button
                        onclick={() => onGoToRegister()}
                        class="text-text-secondary text-sm hover:text-text-primary transition-all"
                        >Novo por aqui? <span
                            class="text-brand font-black hover:underline"
                            >Crie sua conta</span
                        ></button
                    >
                </footer>
            </div>
        </div>
    </div>
</div>

<style>
    :global(html, body) {
        overflow-x: hidden;
        margin: 0;
        padding: 0;
    }
</style>
