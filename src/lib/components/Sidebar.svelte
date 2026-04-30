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
                <span class="text-xl">📅</span>
                <span class="font-medium">Eventos</span>
            </li>
            {#if isAdmin}
                <li
                    class="flex items-center gap-3 p-3 rounded-xl hover:bg-text-primary/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                    <span class="text-xl">👤</span>
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
                    <span class="text-xl">📋</span>
                    <span>Minhas Inscrições</span>
                </li>
            {/if}
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
            class="w-full border border-text-primary/20 text-text-primary p-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
        >
            Sair
        </button>
    </div>
</aside>
