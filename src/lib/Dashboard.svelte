<script>
    import Sidebar from "./components/Sidebar.svelte";
    import Header from "./components/Header.svelte";
    import ProfileForm from "./components/ProfileForm.svelte";
    import Modal from "./components/Modal.svelte";
    import EventDetails from "./components/EventDetails.svelte";
    import EventForm from "./components/EventForm.svelte";
    import UsersList from "./components/UsersList.svelte";
    import EventsList from "./components/EventsList.svelte";
    import MySubscriptions from "./components/MySubscriptions.svelte";

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
            <EventsList
                {events}
                {isAdmin}
                {fetchEvents}
                {openEventForm}
                {openEventDetails}
            />
        {:else if activeTab === "subscriptions"}
            <MySubscriptions
                {subscriptions}
                onGoToEvents={() => (activeTab = "events")}
                {requestCancelSubscription}
            />
        {:else if activeTab === "users"}
            <UsersList {token} />
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
