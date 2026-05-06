<script>
    let {
        activeTab = $bindable(""),
        isExpanded = $bindable(false),
        isAdmin = false,
        handleLogout,
        onAddEvent = () => {},
    } = $props();
</script>

<aside
    class="{isExpanded
        ? 'w-64'
        : 'w-20'} bg-bg-secondary border-r border-border-ui flex flex-col py-6 px-3 fixed h-full shadow-lg z-20 transition-all duration-300 group"
>
    <div class="flex items-center justify-center mb-10 overflow-hidden w-full">
        <button
            onclick={() => (isExpanded = !isExpanded)}
            class="p-2 rounded-xl bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
            title={isExpanded ? "Recolher Menu" : "Expandir Menu"}
        >
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
            >
                {#if isExpanded}
                    <path d="m15 18-6-6 6-6" />
                {:else}
                    <line x1="4" x2="20" y1="12" y2="12" /><line
                        x1="4"
                        x2="20"
                        y1="6"
                        y2="6"
                    /><line x1="4" x2="20" y1="18" y2="18" />
                {/if}
            </svg>
        </button>
    </div>

    <nav class="flex-grow px-1">
        <ul class="space-y-2">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                onclick={() => (activeTab = "events")}
                class="flex items-center {isExpanded
                    ? 'gap-3 px-3'
                    : 'justify-center'} py-3 rounded-xl {activeTab === 'events'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
                title="Eventos"
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
                {#if isExpanded}
                    <span class="font-medium whitespace-nowrap">Eventos</span>
                {/if}
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
                    {#if isExpanded}
                        <span class="font-medium whitespace-nowrap"
                            >Usuários</span
                        >
                    {/if}
                </li>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    onclick={() => (activeTab = "subscriptions")}
                    class="flex items-center gap-3 p-3 rounded-xl {activeTab ===
                    'subscriptions'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
                    title="Minhas Inscrições"
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
        </ul>
    </nav>

    <!-- Perfil na Sidebar -->
    <div class="pt-6 border-t border-border-ui space-y-4">
        <div class="flex items-center gap-3 px-2">
            <img
                src={userData.picture && userData.picture.startsWith("http")
                    ? userData.picture
                    : defaultAvatar}
                alt="Avatar"
                class="w-10 h-10 rounded-full object-cover border-2 border-brand"
            />
            <div class="flex flex-col overflow-hidden">
                <span class="font-bold text-sm truncate"
                    >{userData.name || "Visitante"}</span
                >
                <span
                    class="text-[10px] text-brand uppercase tracking-widest font-black mt-0.5"
                    >{isAdmin ? "Admin" : "Participante"}</span
                >
            </div>
        </div>
        <button
            onclick={handleLogout}
            title="Sair"
            class="{isExpanded
                ? 'w-full px-4'
                : 'w-10 h-10 flex items-center justify-center'} border border-text-primary/20 text-text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group"
        >
            {#if isExpanded}
                Sair
            {:else}
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
                    class="group-hover:text-white text-red-500"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
            {/if}
        </button>
    </div>
</aside>
