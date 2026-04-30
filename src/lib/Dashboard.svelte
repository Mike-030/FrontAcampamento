<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    let { onLogout } = $props();

    /** @type {any[]} */
    let events = $state([]);
    /** @type {any[]} */
    let subscriptions = $state([]);
    let loading = $state(true);
    let activeTab = $state("events");
    let userData = $state(
        JSON.parse(localStorage.getItem("user_data") || "{}"),
    );
    let isAdmin = $derived(
        userData.is_counselor === true ||
            userData.is_admin === true ||
            userData.role === "admin",
    );

    let modalState = $state({
        isOpen: false,
        type: "error",
        message: "",
        onConfirm: null,
    });

    function showModal(type, message, onConfirm = null) {
        modalState = { isOpen: true, type, message, onConfirm };
    }

    function closeModal() {
        modalState.isOpen = false;
    }

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("auth_token");

    // Fallback para imagem caso o usuário não tenha uma
    const defaultAvatar =
        "https://ui-avatars.com/api/?name=" +
        (userData.name || "User") +
        "&background=DE6E27&color=fff";

    $effect(() => {
        if (activeTab === "events") {
            fetchEvents();
        } else {
            fetchSubscriptions();
        }
    });

    async function fetchEvents() {
        try {
            const endpoint = isAdmin
                ? `${API_URL}/v1/events`
                : `${API_URL}/v1/events?available=true`;
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                events = data.data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar eventos:", err);
        } finally {
            loading = false;
        }
    }

    async function fetchSubscriptions() {
        try {
            loading = true;
            const response = await fetch(
                `${API_URL}/v1/subscriptions?user_id=${userData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                },
            );
            const data = await response.json();
            if (response.ok) {
                subscriptions = data.data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar inscrições:", err);
        } finally {
            loading = false;
        }
    }

    async function subscribe(eventId) {
        try {
            const payload = {
                subscription_date: new Date().toISOString().split("T")[0],
                subscription_type: "Campista",
                was_selected: false,
                substitute_position: 0,
                paid_the_fee: false,
                is_quitter: false,
                payment_code: "N/A",
                qrcode_data: "N/A",
                used_qrcode: false,
                selection_method_id: 1, // Ex: Sorteio
                user_id: userData.id,
                event_id: eventId,
            };

            const response = await fetch(`${API_URL}/v1/subscriptions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showModal("success", "Inscrição realizada com sucesso!");
                // Opcional: Atualizar a listagem ou exibir status
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.errors
                    ? Object.values(errorData.errors)[0][0]
                    : errorData.message;
                showModal(
                    "error",
                    errorMessage || "Verifique os dados informados.",
                );
                console.error("Erros de validação:", errorData);
            }
        } catch (err) {
            console.error("Erro de conexão ao se inscrever:", err);
            showModal(
                "error",
                "Não foi possível conectar com o servidor. Tente novamente.",
            );
        }
    }

    function requestCancelSubscription(subscriptionId) {
        showModal(
            "confirm",
            "Tem certeza que deseja cancelar esta inscrição? Esta ação não pode ser desfeita.",
            () => {
                closeModal();
                performCancelSubscription(subscriptionId);
            },
        );
    }

    async function performCancelSubscription(subscriptionId) {
        try {
            const response = await fetch(
                `${API_URL}/v1/subscriptions/${subscriptionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                },
            );

            if (response.ok || response.status === 204) {
                showModal("success", "Inscrição cancelada com sucesso!");
                fetchSubscriptions(); // Refresh local list
            } else {
                const errorData = await response.json().catch(() => ({}));
                showModal(
                    "error",
                    errorData.message || "Erro ao cancelar a inscrição.",
                );
            }
        } catch (err) {
            console.error("Erro ao cancelar inscrição:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        }
    }

    function handleLogout() {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        onLogout();
    }
</script>

<div
    class="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 font-['Inter']"
>
    <!-- Sidebar -->
    <aside
        class="w-64 bg-bg-secondary border-r border-border-ui flex flex-col p-6 fixed h-full shadow-lg z-10 transition-colors duration-300"
    >
        <div class="flex items-center gap-3 mb-10 overflow-hidden">
            <img src={logo} alt="Logo" class="w-auto object-contain" />
        </div>

        <nav class="flex-grow">
            <ul class="space-y-2">
                <li
                    onclick={() => (activeTab = "events")}
                    class="flex items-center gap-3 p-3 rounded-xl {activeTab ===
                    'events'
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
                >
                    <span class="text-xl">⛺</span>
                    <span class="font-medium">Festivais</span>
                </li>
                {#if isAdmin}
                    <li
                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    >
                        <span class="text-xl">👤</span>
                        <span>Usuários</span>
                    </li>
                    <li
                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    >
                        <span class="text-xl">📅</span>
                        <span>Eventos</span>
                    </li>
                {:else}
                    <li
                        onclick={() => (activeTab = "subscriptions")}
                        class="flex items-center gap-3 p-3 rounded-xl {activeTab ===
                        'subscriptions'
                            ? 'bg-brand text-white shadow-lg shadow-brand/20'
                            : 'hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary'} transition-all cursor-pointer"
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
                class="w-full border border-forest/20 dark:border-cream/20 text-text-primary p-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
            >
                Sair
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-grow p-10">
        <header class="flex justify-between items-start mb-12">
            <div>
                <div class="flex items-center gap-4 mb-2">
                    <h2 class="text-4xl font-black text-forest dark:text-cream">
                        Painel Geral
                    </h2>
                    <span
                        class="bg-forest/10 dark:bg-cream/10 px-3 py-1 rounded-full text-[10px] font-bold text-brand uppercase tracking-tighter self-center"
                        >Versão 1.0</span
                    >
                </div>
                <p class="text-text-secondary text-sm">
                    Bem-vindo de volta, <span
                        class="text-forest dark:text-cream font-bold"
                        >{userData.name}</span
                    >!
                </p>
            </div>

            <div class="flex items-center gap-4">
                <!-- Foto de Perfil Grande com Dropdown Placeholder -->
                <div class="flex flex-col items-end mr-2">
                    <span
                        class="text-xs font-bold opacity-50 uppercase tracking-widest"
                        >Acesso Rápido</span
                    >
                    <span class="text-[10px] text-emerald-500 font-bold"
                        >● ONLINE</span
                    >
                </div>
                <div class="relative group">
                    <img
                        src={userData.picture &&
                        userData.picture.startsWith("http")
                            ? userData.picture
                            : defaultAvatar}
                        alt="Profile"
                        class="w-14 h-14 rounded-full object-cover border-[3px] border-bg-secondary shadow-xl group-hover:border-brand transition-all cursor-pointer"
                    />
                    <div
                        class="absolute -bottom-1 -right-1 w-5 h-5 bg-brand rounded-full border-4 border-bg-primary flex items-center justify-center text-[10px] text-white font-bold"
                    >
                        +
                    </div>
                </div>
            </div>
        </header>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {#if isAdmin}
                <div
                    class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm group hover:border-brand transition-all"
                >
                    <p
                        class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60"
                    >
                        Total Eventos
                    </p>
                    <p class="text-4xl font-black text-text-primary">
                        {events.length}
                    </p>
                </div>
                <div
                    class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm"
                >
                    <p
                        class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60"
                    >
                        Usuários Ativos
                    </p>
                    <p class="text-4xl font-black text-text-primary">--</p>
                </div>
                <button
                    class="bg-brand group hover:opacity-90 p-6 rounded-3xl shadow-xl shadow-brand/20 transition-all text-left"
                >
                    <p
                        class="text-white/60 text-xs font-bold uppercase tracking-widest mb-2"
                    >
                        Ação Rápida
                    </p>
                    <p class="text-xl font-black text-white">
                        + Novo Acampamento
                    </p>
                </button>
            {:else}
                <div
                    class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm group hover:border-brand transition-all"
                >
                    <p
                        class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60"
                    >
                        Eventos Disponíveis
                    </p>
                    <p class="text-4xl font-black text-text-primary">
                        {events.length}
                    </p>
                </div>
                <button
                    onclick={() => (activeTab = "subscriptions")}
                    class="bg-brand group hover:opacity-90 p-6 rounded-3xl shadow-xl shadow-brand/20 transition-all text-left"
                >
                    <p
                        class="text-white/60 text-xs font-bold uppercase tracking-widest mb-2"
                    >
                        Ação Rápida
                    </p>
                    <p class="text-xl font-black text-white">Ver Inscrições</p>
                </button>
            {/if}
        </div>

        {#if loading}
            <div
                class="flex flex-col items-center justify-center py-20 text-text-secondary"
            >
                <div
                    class="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-4"
                ></div>
                <p class="animate-pulse">Buscando dados...</p>
            </div>
        {:else if activeTab === "events"}
            {#if events.length === 0}
                <div
                    class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
                >
                    <p class="text-text-secondary text-xs font-bold mb-6">
                        Nenhum evento encontrado
                    </p>
                    <button
                        class="bg-forest text-cream px-6 py-2 rounded-full text-[10px] font-bold"
                        >Sincronizar</button
                    >
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-forest dark:text-stone"
                >
                    {#each events as event}
                        <div
                            class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
                        >
                            <div
                                class="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full"
                            ></div>

                            <div class="flex justify-between items-start mb-6">
                                <h3
                                    class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1"
                                >
                                    {event.name || "Evento"}
                                </h3>
                                <div
                                    class="w-3 h-3 bg-brand rounded-full shadow-[0_0_10px_rgba(222,110,39,0.5)]"
                                ></div>
                            </div>
                            <p
                                class="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80"
                            >
                                {event.description ||
                                    "Nenhuma descrição disponível para este evento."}
                            </p>
                            <div
                                class="flex justify-between items-center pt-8 border-t border-border-ui"
                            >
                                <span
                                    class="text-[10px] font-black uppercase opacity-40"
                                    >Campanha 2026</span
                                >
                                <button
                                    onclick={() =>
                                        isAdmin ? null : subscribe(event.id)}
                                    class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                                >
                                    {isAdmin ? "Gerenciar" : "Inscrever-se"}
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {:else if activeTab === "subscriptions"}
            {#if subscriptions.length === 0}
                <div
                    class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
                >
                    <p class="text-text-secondary text-xs font-bold mb-6">
                        Nenhuma inscrição encontrada
                    </p>
                    <button
                        onclick={() => (activeTab = "events")}
                        class="bg-forest text-cream px-6 py-2 rounded-full text-[10px] font-bold"
                        >Ver Eventos</button
                    >
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-forest dark:text-stone"
                >
                    {#each subscriptions as sub}
                        <div
                            class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
                        >
                            <div
                                class="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full"
                            ></div>

                            <div class="flex justify-between items-start mb-6">
                                <h3
                                    class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1"
                                >
                                    {sub.event?.name || "Inscrição"}
                                </h3>
                                <div
                                    class="w-3 h-3 {sub.paid_the_fee
                                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                        : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'} rounded-full"
                                ></div>
                            </div>
                            <p
                                class="text-text-secondary text-sm leading-relaxed mb-4"
                            >
                                <strong>Status:</strong>
                                {sub.paid_the_fee
                                    ? "Confirmado"
                                    : "Pendente pagamento"} <br />
                                <strong>Tipo:</strong>
                                {sub.subscription_type} <br />
                                <strong>Sorteado:</strong>
                                {sub.was_selected ? "Sim" : "Não"}
                            </p>
                            <div
                                class="flex justify-end items-center pt-6 border-t border-border-ui mt-4"
                            >
                                <button
                                    onclick={() =>
                                        requestCancelSubscription(sub.id)}
                                    class="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider"
                                >
                                    Cancelar Inscrição
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </main>

    <!-- Modal Pop-up -->
    {#if modalState.isOpen}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
        >
            <div
                class="bg-bg-primary border border-border-ui p-8 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all animate-in fade-in zoom-in-95 duration-200"
            >
                <div class="flex flex-col items-center text-center">
                    {#if modalState.type === "error"}
                        <div
                            class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 border border-red-500/20"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-black text-red-500 mb-3">
                            Ops, algo falhou!
                        </h3>
                    {:else if modalState.type === "success"}
                        <div
                            class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 border border-green-500/20"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="3"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-black text-green-500 mb-3">
                            Sucesso!
                        </h3>
                    {:else if modalState.type === "confirm"}
                        <div
                            class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-500 border border-yellow-500/20"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-black text-yellow-500 mb-3">
                            Atenção
                        </h3>
                    {/if}
                    <p
                        class="text-text-secondary text-sm font-medium leading-relaxed mb-8"
                    >
                        {modalState.message}
                    </p>

                    {#if modalState.type === "confirm"}
                        <div class="flex gap-4 w-full">
                            <button
                                onclick={closeModal}
                                class="w-1/2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-bg-secondary text-text-secondary border border-border-ui hover:border-brand hover:text-text-primary transition-all"
                            >
                                Voltar
                            </button>
                            <button
                                onclick={modalState.onConfirm}
                                class="w-1/2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    {:else}
                        <button
                            onclick={closeModal}
                            class="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all {modalState.type ===
                            'error'
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'}"
                        >
                            Entendi
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
