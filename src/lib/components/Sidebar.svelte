<script>
    import logo from "../../assets/LogoComunidadeSaoMiguel.png";
    let {
        activeTab = $bindable(""),
        isAdmin = false,
        userData = {},
        defaultAvatar = "",
        handleLogout,
    } = $props();
</script>

<aside
    class="w-64 bg-bg-secondary border-r border-border-ui flex flex-col p-6 fixed h-full shadow-lg z-10 transition-colors duration-300"
>
    <div class="flex items-center gap-3 mb-10 overflow-hidden">
        <img src={logo} alt="Logo" class="w-auto object-contain" />
    </div>

    <nav class="flex-grow">
        <ul class="space-y-2">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                onclick={() => (activeTab = "events")}
                class="flex items-center gap-3 p-3 rounded-xl {activeTab ===
                'events'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
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
                >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span class="font-medium">Eventos</span>
            </li>
            {#if isAdmin}
                <li
                    class="flex items-center gap-3 p-3 rounded-xl hover:bg-text-primary/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
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
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Usuários</span>
                </li>
            {:else}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    onclick={() => (activeTab = "subscriptions")}
                    class="flex items-center gap-3 p-3 rounded-xl {activeTab ===
                    'subscriptions'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
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
                    <span>Minhas Inscrições</span>
                </li>
            {/if}
        </ul>
    </nav>

    <!-- Perfil na Sidebar -->
    <div class="pt-6 border-t border-border-ui space-y-4">
        <button
            onclick={handleLogout}
            class="w-full border border-text-primary/20 text-text-primary p-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
        >
            Sair
        </button>
    </div>
</aside>
