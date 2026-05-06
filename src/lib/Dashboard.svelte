<script>
    import Sidebar from "./components/Sidebar.svelte";
    import Header from "./components/Header.svelte";
    import Stats from "./components/Stats.svelte";
    import ProfileForm from "./components/ProfileForm.svelte";
    import Modal from "./components/Modal.svelte";
    import EventDetails from "./components/EventDetails.svelte";
    import EventForm from "./components/EventForm.svelte";
    import UsersDashboard from "./components/UsersDashboard.svelte";

    let { onLogout } = $props();

    /** @type {any[]} */
    let events = $state([]);
    /** @type {any[]} */
    let subscriptions = $state([]);
    let loading = $state(true);
    let activeTab = $state("events");
    let selectedEvent = $state(null);
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

    /**
     * @param {string} type
     * @param {string} message
     * @param {(() => void) | null} onConfirm
     */
    function showModal(type, message, onConfirm = null) {
        modalState = { isOpen: true, type, message, onConfirm };
    }

    function closeModal() {
        modalState.isOpen = false;
    }

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("auth_token");

    // Fallback para imagem caso o usuário não tenha uma
    let defaultAvatar = $derived(
        "https://ui-avatars.com/api/?name=" +
            (userData.name || "User") +
            "&background=DE6E27&color=fff",
    );

    $effect(() => {
        if (activeTab === "events") {
            fetchEvents();
        } else if (activeTab === "subscriptions") {
            fetchSubscriptions();
        }
    });

    async function fetchEvents() {
        try {
            loading = true;
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
                activeTab = "subscriptions";
                fetchSubscriptions();
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

    function requestSubscription(eventId) {
        showModal(
            "confirm",
            "Ao confirmar, você será redirecionado para suas inscrições. Deseja continuar?",
            () => {
                closeModal();
                subscribe(eventId);
            },
        );
    }

    function requestUpdateProfile() {
        showModal(
            "confirm",
            "Deseja realmente salvar as alterações no seu perfil?",
            () => {
                closeModal();
                performUpdateProfile();
            },
        );
    }

    function openEventDetails(event) {
        selectedEvent = event;
        activeTab = "event_details";
    }

    function openEventForm(event = null) {
        selectedEvent = event;
        activeTab = "event_form";
    }

    async function performUpdateProfile() {
        try {
            /** @type {Record<string, any>} */
            const payload = {
                name: userData.name,
                email: userData.email,
                phone: userData.phone
                    ? String(userData.phone).replace(/\D/g, "")
                    : undefined,
            };

            const rawCpf = userData.cpf || userData.document;
            if (rawCpf) {
                payload.cpf = String(rawCpf).replace(/\D/g, "");
            }

            const response = await fetch(`${API_URL}/v1/users/${userData.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const responseData = await response.json();
                userData = { ...userData, ...responseData.data };
                localStorage.setItem("user_data", JSON.stringify(userData));
                showModal("success", "Perfil atualizado com sucesso!");
            } else {
                const errorData = await response.json().catch(() => ({}));
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
            console.error("Erro ao atualizar perfil:", err);
            showModal(
                "error",
                "Não foi possível conectar com o servidor. Tente novamente.",
            );
        }
    }

    function handleLogout() {
        showModal(
            "confirm",
            "Tem certeza que deseja sair da sua conta?",
            () => {
                closeModal();
                performLogout();
            },
        );
    }

    function performLogout() {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        onLogout();
    }
</script>

<div
    class="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 font-['Inter']"
>
    <Sidebar
        bind:activeTab
        {isAdmin}
        {userData}
        {defaultAvatar}
        {handleLogout}
        onAddEvent={() => openEventForm()}
    />

    <!-- Main Content -->
    <main class="ml-64 flex-grow p-10">
        <Header {userData} {defaultAvatar} bind:activeTab {handleLogout} />

        <!-- Stats -->
        <Stats
            {isAdmin}
            eventsCount={events.length}
            bind:activeTab
            onAddEvent={() => openEventForm()}
        />

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
                        onclick={fetchEvents}
                        class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                        >Sincronizar</button
                    >
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-text-primary"
                >
                    {#each events as event}
                        <div
                            class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
                        >
                            <div class="flex justify-between items-start mb-6">
                                <h3
                                    class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1"
                                >
                                    {event.name || "Evento"}
                                </h3>
                                <div
                                    class="px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full"
                                >
                                    <span
                                        class="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                    >
                                        {event.eventable_type ===
                                        "App\\Models\\Festival"
                                            ? "Festival"
                                            : "Acampamento"}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="flex justify-between items-center pt-8 border-t border-border-ui"
                            >
                                <span
                                    class="text-[10px] font-black uppercase opacity-40"
                                    >Campanha 2026</span
                                >
                                <div class="flex gap-2">
                                    {#if isAdmin}
                                        <button
                                            onclick={() => openEventForm(event)}
                                            class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                                        >
                                            Gerenciar
                                        </button>
                                    {/if}
                                    <button
                                        onclick={() => openEventDetails(event)}
                                        class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
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
                        class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                        >Ver Eventos</button
                    >
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-text-primary"
                >
                    {#each subscriptions as sub}
                        <div
                            class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
                        >
                            <div class="flex justify-between items-start mb-6">
                                <h3
                                    class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1"
                                >
                                    {sub.event?.name || "Inscrição"}
                                </h3>
                                <div class="flex items-center gap-2">
                                    <div
                                        class="px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full"
                                    >
                                        <span
                                            class="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                        >
                                            {sub.event?.eventable_type ===
                                            "App\\Models\\Festival"
                                                ? "Festival"
                                                : "Acampamento"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p
                                class="text-text-secondary text-sm leading-relaxed mb-4"
                            >
                                <strong>Status:</strong>
                                {sub.paid_the_fee
                                    ? "Confirmado"
                                    : "Pagamento pendente"} <br />
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
        {:else if activeTab === "users"}
            <UsersDashboard {token} />
        {:else if activeTab === "profile"}
            <ProfileForm
                bind:userData
                updateProfile={requestUpdateProfile}
                {defaultAvatar}
            />
        {:else if activeTab === "event_details" && selectedEvent}
            <EventDetails
                event={selectedEvent}
                onSubscribe={requestSubscription}
                onBack={() => (activeTab = "events")}
            />
        {:else if activeTab === "event_form"}
            <EventForm
                event={selectedEvent}
                onCancel={() => (activeTab = "events")}
                {token}
                onSaveSuccess={() => {
                    activeTab = "events";
                    fetchEvents();
                }}
            />
        {/if}
    </main>

    <Modal {modalState} {closeModal} />
</div>
