<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { token, user, setLogout } from "$lib/stores/auth.js";
    import { isDarkMode, toggleTheme } from "$lib/stores/theme.js";

    import logo from "../../assets/LogoComunidadeSaoMiguel.png";
    import Inbox from "./Inbox.svelte";
    import Modal from "./Modal.svelte";

    /**
     * Navbar unificada do sistema (presente na landing page e demais telas)
     *
     * @type {{
     *   activeTab?: string,
     *   onOpenLogin?: (() => void) | null,
     *   onOpenMessage?: ((message: any) => void) | null,
     *   handleLogout?: (() => void) | null,
     *   onAddEvent?: (() => void) | null
     * }}
     */
    let {
        activeTab = $bindable(""),
        onOpenLogin = null,
        onOpenMessage = null,
        handleLogout = null,
        onAddEvent = null,
    } = $props();

    let isSidebarOpen = $state(false);
    let isProfileMenuOpen = $state(false);

    // Estado dos dropdowns de categorias na sidebar
    let openGroups = $state({
        navegacao: true,
        minhaConta: false,
        administracao: false,
        sobreNos: false,
        exibicao: false,
    });

    /** @param {'navegacao' | 'minhaConta' | 'administracao' | 'sobreNos' | 'exibicao'} group */
    function toggleGroup(group) {
        openGroups[group] = !openGroups[group];
    }

    // Modal interno de confirmação de logout (usado fora do Dashboard)
    /** @type {{ isOpen: boolean, type: string, message: string, onConfirm: (() => void) | null }} */
    let logoutModal = $state({
        isOpen: false,
        type: "confirm",
        message: "",
        onConfirm: null,
    });

    let isLoggedIn = $derived(Boolean($token));
    let userData = $derived($user || {});
    let isAdmin = $derived(
        userData.is_admin === true || userData.role === "admin",
    );
    let currentPath = $derived($page.url.pathname);
    let isLandingPage = $derived(currentPath === "/");
    let isDashboardPage = $derived(currentPath.startsWith("/dashboard"));

    let defaultAvatar = $derived(
        "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(userData.name || "User") +
            "&background=C4982A&color=fff",
    );

    let avatarSrc = $derived(
        userData.picture && String(userData.picture).startsWith("http")
            ? userData.picture
            : defaultAvatar,
    );

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }

    /** @param {string} sectionId */
    async function navigateToSection(sectionId) {
        isSidebarOpen = false;
        if (isLandingPage) {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else {
            await goto(`/#${sectionId}`);
        }
    }

    function navigateHome() {
        isSidebarOpen = false;
        isProfileMenuOpen = false;
        if (isLandingPage) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            goto("/");
        }
    }

    /** @param {string} tab */
    function navigateToDashboardTab(tab) {
        isSidebarOpen = false;
        isProfileMenuOpen = false;
        if (isDashboardPage) {
            if (tab === "event_form" && onAddEvent) {
                onAddEvent();
            } else {
                activeTab = tab;
            }
        } else if (tab === "profile") {
            goto(`/dashboard?tab=profile&from=${encodeURIComponent(currentPath)}`);
        } else {
            goto(tab === "events" ? "/dashboard" : `/dashboard?tab=${tab}`);
        }
    }

    /** @param {any} message */
    function handleInboxOpenMessage(message) {
        if (isDashboardPage && onOpenMessage) {
            onOpenMessage(message);
        } else {
            goto("/dashboard?tab=inbox");
        }
    }

    function triggerLogin() {
        isSidebarOpen = false;
        if (onOpenLogin) {
            onOpenLogin();
        } else {
            goto("/?login=true");
        }
    }

    function triggerLogout() {
        isProfileMenuOpen = false;
        isSidebarOpen = false;

        if (handleLogout) {
            handleLogout();
            return;
        }

        logoutModal = {
            isOpen: true,
            type: "confirm",
            message: "Tem certeza que deseja sair da sua conta?",
            onConfirm: () => {
                logoutModal.isOpen = false;
                setLogout();
                goto("/");
            },
        };
    }

    function closeLogoutModal() {
        logoutModal.isOpen = false;
    }
</script>

<!-- BACKDROP DA SIDEBAR DA COMUNIDADE -->
{#if isSidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onclick={toggleSidebar}
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300"
    ></div>
{/if}

<!-- SIDEBAR RESPONSIVA (Links da Comunidade e Navegação) -->
<aside
    class="fixed top-0 left-0 h-dvh w-[280px] md:w-80 bg-bg-primary z-[60] shadow-2xl border-r border-border-ui flex flex-col overflow-hidden transition-transform duration-500 ease-in-out
           {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
>
    <div
        class="flex-shrink-0 flex items-center justify-between p-6 border-b border-border-ui/50"
    >
        <div class="flex items-center gap-3">
            <img src={logo} alt="Logo" class="h-10 w-auto object-contain" />
            <span
                class="text-xs font-black uppercase tracking-widest text-text-primary"
            >
                Menu
            </span>
        </div>
        <button
            type="button"
            onclick={toggleSidebar}
            aria-label="Fechar menu"
            class="w-9 h-9 rounded-xl bg-bg-secondary border border-border-ui flex items-center justify-center text-text-secondary hover:text-brand transition-colors cursor-pointer"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
        </button>
    </div>

    <nav class="flex-1 min-h-0 flex flex-col gap-3 w-full p-5 text-left overflow-y-auto sidebar-scroll">
        <!-- DROPDOWN 1: NAVEGAÇÃO (Página Inicial a Atividades) -->
        <div class="flex-shrink-0 rounded-2xl border border-border-ui/60 bg-bg-secondary/35">
            <button
                type="button"
                onclick={() => toggleGroup("navegacao")}
                aria-expanded={openGroups.navegacao}
                class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-brand/5 transition-colors cursor-pointer"
            >
                <span class="text-xs font-black uppercase tracking-[0.18em] text-text-primary">
                    Navegação
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-text-secondary transition-transform duration-300 {openGroups.navegacao ? 'rotate-180 text-brand' : ''}"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {#if openGroups.navegacao}
                <div class="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-border-ui/40">
                    <button
                        type="button"
                        onclick={navigateHome}
                        class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                               {isLandingPage
                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                            : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                   {isLandingPage
                                ? 'bg-white/20 text-white'
                                : 'bg-bg-secondary group-hover:bg-brand/10'}"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm tracking-wide">Página Inicial</span>
                    </button>

                    <button
                        type="button"
                        onclick={() => navigateToSection("acampamentos")}
                        class="flex items-center gap-3.5 text-text-secondary hover:text-brand transition-all p-2.5 rounded-xl hover:bg-brand/5 group cursor-pointer text-left"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M3.5 21 14 3" />
                                <path d="M20.5 21 10 3" />
                                <path d="M15.5 21 12 15l-3.5 6" />
                                <path d="M2 21h20" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm tracking-wide">Acampamentos</span>
                    </button>

                    <button
                        type="button"
                        onclick={() => navigateToSection("eventos")}
                        class="flex items-center gap-3.5 text-text-secondary hover:text-brand transition-all p-2.5 rounded-xl hover:bg-brand/5 group cursor-pointer text-left"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" />
                                <line x1="8" x2="8" y1="2" y2="6" />
                                <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm tracking-wide">Eventos</span>
                    </button>

                    <button
                        type="button"
                        onclick={() => navigateToSection("produtos")}
                        class="flex items-center gap-3.5 text-text-secondary hover:text-brand transition-all p-2.5 rounded-xl hover:bg-brand/5 group cursor-pointer text-left"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm tracking-wide">Produtos</span>
                    </button>

                    {#if isLoggedIn}
                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("events")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'events'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'events'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect width="7" height="9" x="3" y="3" rx="1" />
                                    <rect width="7" height="5" x="14" y="3" rx="1" />
                                    <rect width="7" height="9" x="14" y="12" rx="1" />
                                    <rect width="7" height="5" x="3" y="16" rx="1" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Atividades</span>
                        </button>
                    {/if}
                </div>
            {/if}
        </div>

        <!-- DROPDOWN 2: MINHA CONTA (Minhas Inscrições a Caixa de Entrada) -->
        {#if isLoggedIn}
            <div class="flex-shrink-0 rounded-2xl border border-border-ui/60 bg-bg-secondary/35">
                <button
                    type="button"
                    onclick={() => toggleGroup("minhaConta")}
                    aria-expanded={openGroups.minhaConta}
                    class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-brand/5 transition-colors cursor-pointer"
                >
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-text-primary">
                        Minha Conta
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-text-secondary transition-transform duration-300 {openGroups.minhaConta ? 'rotate-180 text-brand' : ''}"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {#if openGroups.minhaConta}
                    <div class="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-border-ui/40">
                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("subscriptions")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'subscriptions'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'subscriptions'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                    <path
                                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                                    />
                                    <path d="M12 11h4" />
                                    <path d="M12 16h4" />
                                    <path d="M8 11h.01" />
                                    <path d="M8 16h.01" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Minhas Inscrições</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("inbox")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'inbox'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'inbox'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Caixa de Entrada</span>
                        </button>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- DROPDOWN 3: ADMINISTRAÇÃO (Usuários a Gerenciar Produtos) -->
        {#if isLoggedIn && isAdmin}
            <div class="flex-shrink-0 rounded-2xl border border-border-ui/60 bg-bg-secondary/35">
                <button
                    type="button"
                    onclick={() => toggleGroup("administracao")}
                    aria-expanded={openGroups.administracao}
                    class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-brand/5 transition-colors cursor-pointer"
                >
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-text-primary">
                        Administração
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-text-secondary transition-transform duration-300 {openGroups.administracao ? 'rotate-180 text-brand' : ''}"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {#if openGroups.administracao}
                    <div class="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-border-ui/40">
                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("users")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'users'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'users'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Usuários</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("event_form")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'event_form'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'event_form'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Criar Atividade</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("manage_activities")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'manage_activities'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'manage_activities'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                    />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" x2="8" y1="13" y2="13" />
                                    <line x1="16" x2="8" y1="17" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Gerenciar Atividades</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("questions_admin")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'questions_admin'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'questions_admin'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" x2="12.01" y1="17" y2="17" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Perguntas</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("sectors")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'sectors'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'sectors'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                    <path d="M3 9h18" />
                                    <path d="M9 21V9" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Setores</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("raffle")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'raffle'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'raffle'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 9 7" />
                                    <path
                                        d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 7 15 7"
                                    />
                                    <path d="M4 22h16" />
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Sorteio</span>
                        </button>

                        <button
                            type="button"
                            onclick={() => navigateToDashboardTab("products")}
                            class="flex items-center gap-3.5 transition-all p-2.5 rounded-xl group cursor-pointer text-left
                                   {isDashboardPage && activeTab === 'products'
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : 'text-text-secondary hover:text-brand hover:bg-brand/5'}"
                        >
                            <div
                                class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-sm
                                       {isDashboardPage && activeTab === 'products'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-bg-secondary group-hover:bg-brand/10'}"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                                    />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </div>
                            <span class="font-bold text-sm tracking-wide">Gerenciar Produtos</span>
                        </button>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- DROPDOWN 4: SOBRE NÓS (Onde Estamos a Instagram) -->
        <div class="flex-shrink-0 rounded-2xl border border-border-ui/60 bg-bg-secondary/35">
            <button
                type="button"
                onclick={() => toggleGroup("sobreNos")}
                aria-expanded={openGroups.sobreNos}
                class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-brand/5 transition-colors cursor-pointer"
            >
                <span class="text-xs font-black uppercase tracking-[0.18em] text-text-primary">
                    Sobre Nós
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-text-secondary transition-transform duration-300 {openGroups.sobreNos ? 'rotate-180 text-brand' : ''}"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {#if openGroups.sobreNos}
                <div class="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-border-ui/40">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Av.+Mato+Grosso,+415+-+Primavera+II,+Primavera+do+Leste+-+MT,+78850-000"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-3.5 text-text-secondary hover:text-brand transition-all p-2.5 rounded-xl hover:bg-brand/5 group"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <span class="font-bold text-sm tracking-wide">Onde Estamos</span>
                    </a>

                    <a
                        href="https://www.instagram.com/campistasprimavera/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-3.5 text-text-secondary hover:text-brand transition-all p-2.5 rounded-xl hover:bg-brand/5 group"
                    >
                        <div
                            class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-sm tracking-wide leading-none">
                                Instagram
                            </span>
                            <span
                                class="text-[9px] opacity-40 font-bold mt-1 tracking-wider uppercase"
                            >
                                Seguir @campistas
                            </span>
                        </div>
                    </a>
                </div>
            {/if}
        </div>

        <!-- DROPDOWN 5: EXIBIÇÃO (Toggle de Tema Claro / Escuro) -->
        <div class="flex-shrink-0 rounded-2xl border border-border-ui/60 bg-bg-secondary/35">
            <button
                type="button"
                onclick={() => toggleGroup("exibicao")}
                aria-expanded={openGroups.exibicao}
                class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-brand/5 transition-colors cursor-pointer"
            >
                <span class="text-xs font-black uppercase tracking-[0.18em] text-text-primary">
                    Exibição
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-text-secondary transition-transform duration-300 {openGroups.exibicao ? 'rotate-180 text-brand' : ''}"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {#if openGroups.exibicao}
                <div class="px-2.5 pb-2.5 pt-1 flex flex-col gap-1 border-t border-border-ui/40">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={$isDarkMode}
                        onclick={toggleTheme}
                        class="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-text-secondary hover:text-brand hover:bg-brand/5 transition-all cursor-pointer group"
                    >
                        <div class="flex items-center gap-3.5 min-w-0">
                            <div
                                class="w-9 h-9 flex items-center justify-center bg-bg-secondary rounded-xl group-hover:bg-brand/10 transition-colors shadow-sm flex-shrink-0"
                            >
                                {#if $isDarkMode}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.3"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                    </svg>
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.3"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 2v2" />
                                        <path d="M12 20v2" />
                                        <path d="m4.93 4.93 1.41 1.41" />
                                        <path d="m17.66 17.66 1.41 1.41" />
                                        <path d="M2 12h2" />
                                        <path d="M20 12h2" />
                                        <path d="m6.34 17.66-1.41 1.41" />
                                        <path d="m19.07 4.93-1.41 1.41" />
                                    </svg>
                                {/if}
                            </div>
                            <span class="font-bold text-sm tracking-wide truncate">
                                {$isDarkMode ? "Tema Escuro" : "Tema Claro"}
                            </span>
                        </div>

                        <!-- Toggle Switch -->
                        <div
                            class="w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex-shrink-0 {$isDarkMode
                                ? 'bg-brand'
                                : 'bg-border-ui'}"
                        >
                            <div
                                class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 {$isDarkMode
                                    ? 'translate-x-5'
                                    : 'translate-x-0'}"
                            ></div>
                        </div>
                    </button>
                </div>
            {/if}
        </div>
    </nav>

    <div class="flex-shrink-0 p-6 border-t border-border-ui/30 bg-bg-secondary/20 space-y-4">
        {#if isLoggedIn}
            <button
                type="button"
                onclick={triggerLogout}
                class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-text-primary/20 text-text-primary text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Sair</span>
            </button>
        {/if}
        <p
            class="text-[10px] text-text-secondary/60 font-black text-center tracking-[0.2em] uppercase leading-relaxed"
        >
            Comunidade <br /> São Miguel Arcanjo
        </p>
    </div>
</aside>

<!-- NAVBAR FIXA NO TOPO -->
<header
    class="sticky top-0 z-40 w-full bg-bg-primary/85 backdrop-blur-lg border-b border-border-ui/60"
>
    <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4"
    >
        <!-- Esquerda: Botão Menu + Logo (retorna para a Landing Page) -->
        <div class="flex items-center gap-3 sm:gap-4">
            <button
                type="button"
                onclick={toggleSidebar}
                aria-label="Abrir menu"
                class="w-11 h-11 rounded-2xl bg-bg-secondary/90 border border-border-ui text-text-primary hover:border-brand hover:text-brand flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
            </button>

            <a
                href="/"
                onclick={(e) => {
                    if (isLandingPage) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                }}
                class="flex items-center gap-3 group"
                title="Voltar à Página Inicial"
            >
                <img
                    src={logo}
                    alt="Logo Comunidade São Miguel Arcanjo"
                    class="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <div class="hidden sm:flex flex-col">
                    <span
                        class="text-sm font-black text-text-primary leading-tight tracking-tight group-hover:text-brand transition-colors"
                    >
                        Comunidade São Miguel
                    </span>
                    <span
                        class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand"
                    >
                        Portal de Acampamentos
                    </span>
                </div>
            </a>
        </div>

        <!-- Centro: Links de Navegação (Desktop) -->
        <nav class="hidden md:flex items-center gap-1.5">
            <button
                type="button"
                onclick={navigateHome}
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                       {isLandingPage
                    ? 'text-brand bg-brand/10'
                    : 'text-text-secondary hover:text-brand hover:bg-bg-secondary'}"
            >
                Início
            </button>
            <button
                type="button"
                onclick={() => navigateToSection("acampamentos")}
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-text-secondary hover:text-brand hover:bg-bg-secondary transition-all cursor-pointer"
            >
                Acampamentos
            </button>
            <button
                type="button"
                onclick={() => navigateToSection("eventos")}
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-text-secondary hover:text-brand hover:bg-bg-secondary transition-all cursor-pointer"
            >
                Eventos
            </button>
            <button
                type="button"
                onclick={() => navigateToSection("produtos")}
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-text-secondary hover:text-brand hover:bg-bg-secondary transition-all cursor-pointer"
            >
                Produtos
            </button>
            {#if isLoggedIn}
                <button
                    type="button"
                    onclick={() => navigateToDashboardTab("events")}
                    class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                           {isDashboardPage
                        ? 'text-brand bg-brand/10'
                        : 'text-text-secondary hover:text-brand hover:bg-bg-secondary'}"
                >
                    Atividades
                </button>
            {/if}
        </nav>

        <!-- Direita: Notificações de Caixa de Entrada + Perfil do Usuário (ou Entrar) -->
        <div class="flex items-center gap-3 relative">
            {#if isLoggedIn}
                <!-- Botão de Notificações (Caixa de Entrada) -->
                <Inbox
                    bind:activeTab
                    onOpenMessage={handleInboxOpenMessage}
                    onViewAll={() => navigateToDashboardTab("inbox")}
                />

                <!-- Botão de Perfil do Usuário + Dropdown -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="relative"
                    onmouseleave={() => (isProfileMenuOpen = false)}
                >
                    <button
                        type="button"
                        onclick={() => (isProfileMenuOpen = !isProfileMenuOpen)}
                        aria-label="Menu do perfil do usuário"
                        class="relative flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
                    >
                        <img
                            src={avatarSrc}
                            alt={userData.name || "Perfil"}
                            class="w-11 h-11 rounded-full object-cover border-[2.5px] border-bg-secondary shadow-md group-hover:border-brand transition-all"
                        />
                    </button>

                    {#if isProfileMenuOpen}
                        <div class="absolute right-0 top-full pt-3 w-64 z-50">
                            <div
                                class="bg-bg-secondary border border-border-ui rounded-3xl shadow-2xl overflow-hidden"
                            >
                                <div
                                    class="p-5 border-b border-border-ui bg-bg-primary/50"
                                >
                                    <p
                                        class="font-black text-sm text-text-primary line-clamp-1"
                                    >
                                        {userData.name || "Usuário"}
                                    </p>
                                    <p
                                        class="text-[11px] text-text-secondary mt-1 line-clamp-1 opacity-70 font-medium"
                                    >
                                        {userData.email || ""}
                                    </p>
                                </div>
                                <ul class="p-3 space-y-1">
                                    <li>
                                        <button
                                            type="button"
                                            onclick={navigateHome}
                                            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand hover:text-white rounded-xl transition-all text-left text-text-secondary cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path
                                                    d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                                />
                                                <polyline
                                                    points="9 22 9 12 15 12 15 22"
                                                />
                                            </svg>
                                            Página Inicial
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                navigateToDashboardTab("events")}
                                            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand hover:text-white rounded-xl transition-all text-left text-text-secondary cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <rect
                                                    width="18"
                                                    height="18"
                                                    x="3"
                                                    y="4"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <line
                                                    x1="16"
                                                    x2="16"
                                                    y1="2"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="8"
                                                    x2="8"
                                                    y1="2"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="3"
                                                    x2="21"
                                                    y1="10"
                                                    y2="10"
                                                />
                                            </svg>
                                            Atividades
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                navigateToDashboardTab("inbox")}
                                            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand hover:text-white rounded-xl transition-all text-left text-text-secondary cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path
                                                    d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"
                                                />
                                                <path
                                                    d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                                                />
                                                <path d="M19 16v6" />
                                                <path d="M16 19h6" />
                                            </svg>
                                            Caixa de Entrada
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                navigateToDashboardTab(
                                                    "profile",
                                                )}
                                            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand hover:text-white rounded-xl transition-all text-left text-text-secondary cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path
                                                    d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Configurações de Perfil
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onclick={triggerLogout}
                                            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path
                                                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                                />
                                                <polyline
                                                    points="16 17 21 12 16 7"
                                                />
                                                <line
                                                    x1="21"
                                                    x2="9"
                                                    y1="12"
                                                    y2="12"
                                                />
                                            </svg>
                                            Sair da Conta
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    {/if}
                </div>
            {:else}
                <button
                    type="button"
                    onclick={triggerLogin}
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                    <span>Entrar</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                </button>
            {/if}
        </div>
    </div>
</header>

{#if !handleLogout}
    <Modal modalState={logoutModal} closeModal={closeLogoutModal} />
{/if}

<style>
    .sidebar-scroll {
        scrollbar-width: thin;
        scrollbar-color: var(--border-ui) transparent;
    }

    .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
    }

    .sidebar-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb {
        background-color: var(--border-ui);
        border-radius: 9999px;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-brand);
    }
</style>

