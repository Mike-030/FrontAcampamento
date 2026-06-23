<script>
    // Props recebidas pelo componente Sidebar
    let {
        activeTab = $bindable(""),
        isExpanded = $bindable(false),
        isAdmin = false,
        handleLogout,
        onAddEvent = () => {},
    } = $props();
</script>

<aside
    class="{isExpanded ? 'w-64' : 'w-24'} bg-bg-secondary border-r border-border-ui flex flex-col py-6 px-4 fixed h-full shadow-lg z-10 transition-all duration-300"
>
    <!-- Botão de Menu Retrátil -->
    <div class="flex items-center mb-10 {isExpanded ? 'justify-end' : 'justify-center'} overflow-hidden">
        <button
            onclick={() => (isExpanded = !isExpanded)}
            class="p-2 rounded-xl text-text-secondary hover:bg-text-primary/5 hover:text-brand transition-all flex-shrink-0"
        >
            <svg class="transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    </div>

    <!-- Navegação e Links -->
    <nav class="flex-grow">
        <ul class="space-y-2">
            <!-- Link: Lista de Eventos -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                onclick={() => (activeTab = "events")}
                class="flex items-center rounded-xl {activeTab ===
                'events'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
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
                    class="flex-shrink-0"
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
            
            <!-- Funcionalidades Restritas a Administradores -->
            {#if isAdmin}
                <!-- Link: Gerenciamento de Usuários -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    onclick={() => (activeTab = "users")}
                    class="flex items-center rounded-xl {activeTab ===
                    'users'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
                    title="Usuários"
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
                        class="flex-shrink-0"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    {#if isExpanded}
                        <span class="font-medium whitespace-nowrap">Usuários</span>
                    {/if}
                </li>
                
                <!-- Link: Criação de um Novo Evento -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    onclick={onAddEvent}
                    class="flex items-center rounded-xl {activeTab ===
                    'event_form'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
                    title="Criar Atividade"
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
                        class="flex-shrink-0"
                    >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                    </svg>
                    {#if isExpanded}
                        <span class="font-medium whitespace-nowrap">Criar Atividade</span>
                    {/if}
                </li>

                <li
                    onclick={() => (activeTab = "raffle")}
                    class="flex items-center rounded-xl {activeTab ===
                    'raffle'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
                    title="Sorteio"
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
                        class="flex-shrink-0"
                    >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 9 7" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 7 15 7" />
                        <path d="M4 22h16" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                    {#if isExpanded}
                        <span class="font-medium whitespace-nowrap">Sorteio</span>
                    {/if}
                </li>

                <!-- Link: Setores -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    onclick={() => (activeTab = "sectors")}
                    class="flex items-center rounded-xl {activeTab ===
                    'sectors'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
                    title="Setores"
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
                        class="flex-shrink-0"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                    </svg>
                    {#if isExpanded}
                        <span class="font-medium whitespace-nowrap">Setores</span>
                    {/if}
                </li>
            {/if}
            
            <!-- Link: Inscrições do Usuário Logado -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                onclick={() => (activeTab = "subscriptions")}
                class="flex items-center rounded-xl {activeTab ===
                'subscriptions'
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'hover:bg-text-primary/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer {isExpanded ? 'p-3 gap-3 justify-start' : 'w-12 h-12 justify-center mx-auto'}"
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
                    class="flex-shrink-0"
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
                {#if isExpanded}
                    <span class="font-medium whitespace-nowrap">Minhas Inscrições</span>
                {/if}
            </li>
        </ul>
    </nav>

    <!-- Rodapé da Sidebar: Ações do Perfil -->
    <div class="pt-6 border-t border-border-ui space-y-4 overflow-hidden flex flex-col {isExpanded ? 'items-stretch' : 'items-center'}">
        <!-- Botão para Sair da Conta -->
        <button
            onclick={handleLogout}
            title="Sair"
            class="flex items-center justify-center rounded-xl border border-text-primary/20 text-text-primary text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all {isExpanded ? 'w-full gap-2 p-2.5' : 'w-12 h-12'}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            {#if isExpanded}
                <span>Sair</span>
            {/if}
        </button>
    </div>
</aside>
