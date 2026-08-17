<script>
    // Componentes da Interface e Estrutura
    import Sidebar from "./components/Sidebar.svelte";
    import Header from "./components/Header.svelte";
    import ProfileForm from "./components/ProfileForm.svelte";
    import Modal from "./components/Modal.svelte";
    import ActivityDetails from "./components/ActivityDetails.svelte";
    import ActivityForm from "./components/ActivityForm.svelte";
    import UsersList from "./components/UsersList.svelte";
    import ActivitiesList from "./components/ActivitiesList.svelte";
    import MySubscriptions from "./components/MySubscriptions.svelte";
    import RafflePanel from "./components/RafflePanel.svelte";
    import SectorManager from "./components/SectorManager.svelte";
    import ManageActivities from "./components/ManageActivities.svelte";
    import InboxTab from "./components/InboxTab.svelte";
    import QuestionManager from "./components/QuestionManager.svelte";
    import ReviewPanel from "./components/ReviewPanel.svelte";
    import QuestionnaireForm from "./components/QuestionnaireForm.svelte";

    import { token as auth_token, user as auth_user, setLogout, updateUser } from '$lib/stores/auth.js';
    import { goto } from '$app/navigation';

    // Estado principal do Dashboard
    /** @type {any[]} */
    let events = $state([]); // Lista de eventos disponíveis
    let eventsCurrentPage = $state(1);
    let eventsTotalPages = $state(1);

    /** @type {any[]} */
    let subscriptions = $state([]); // Lista de inscrições do usuário
    let loading = $state(true); // Controle de carregamento global
    let activeTab = $state("events"); // Aba ativa (events, subscriptions, profile, etc.)
    let selectedEvent = $state(null); // Evento selecionado para detalhes ou edição
    let selectedInboxMessage = $state(null); // Mensagem selecionada para visualização
    let selectedSubscriptionId = $state(null); // ID da inscrição selecionada para responder questionário
    let userData = $state( // Dados do usuário logado
        $auth_user || {}
    );
    // Verificação de privilégios de administrador
    let isAdmin = $derived(
        userData.is_admin === true ||
            userData.role === "admin",
    );

    let isSidebarExpanded = $state(false);

    let showPaymentModal = $state(false);
    let isProcessingPayment = $state(false);
    let paymentFee = $state(0);
    let createdSubscriptionId = $state(null);

    // Estado do Modal global para confirmações e alertas
    /** @type {{ isOpen: boolean, type: string, message: string, onConfirm: (() => void) | null }} */
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
    const token = $derived($auth_token);

    // Fallback para imagem caso o usuário não tenha uma
    let defaultAvatar = $derived(
        "https://ui-avatars.com/api/?name=" +
            (userData.name || "User") +
            "&background=DE6E27&color=fff",
    );

    // Efeito para carregar dados baseados na aba ativa
    $effect(() => {
        if (activeTab === "events") {
            fetchEvents();
        } else if (activeTab === "subscriptions") {
            fetchSubscriptions();
        } else {
            // Tabs that manage their own loading state
            loading = false;
        }
    });

    // Função para buscar lista de atividades da API
    async function fetchEvents(page = 1, searchQuery = "") {
        try {
            loading = true;
            let endpoint = isAdmin
                ? `${API_URL}/v1/activities?page=${page}`
                : `${API_URL}/v1/activities?available=true&page=${page}`;
            if (searchQuery.trim()) {
                endpoint += `&search=${encodeURIComponent(searchQuery.trim())}`;
            }
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                events = data.data || [];
                eventsCurrentPage = data.meta?.current_page || 1;
                eventsTotalPages = data.meta?.last_page || 1;
            }
        } catch (err) {
            console.error("Erro ao buscar atividades:", err);
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

    /** 
     * @param {number | string} eventId 
     * @param {string} type
     * @param {string|number|null} sector1
     * @param {string|number|null} sector2
     * @param {number} eventFee
     */
    async function subscribe(eventId, type = "Campista", sector1 = null, sector2 = null, eventFee = 0) {
        try {
            const payload = {
                subscription_date: new Date().toISOString().split("T")[0],
                subscription_type: type,
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
                sector_id: sector1 || undefined,
                sector2_id: sector2 || undefined,
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
                const responseData = await response.json();
                if (eventFee > 0) {
                    paymentFee = eventFee;
                    createdSubscriptionId = responseData.data?.id;
                    showPaymentModal = true;
                } else {
                    showModal("success", "Inscrição realizada com sucesso!");
                    activeTab = "subscriptions";
                    fetchSubscriptions();
                }
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

    /** @param {number | string} subscriptionId */
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

    /** @param {number | string} subscriptionId */
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

    /** 
     * @param {number | string} eventId 
     * @param {string} type
     * @param {string|number|null} sector1
     * @param {string|number|null} sector2
     * @param {number} eventFee
     */
    function requestSubscription(eventId, type = "Campista", sector1 = null, sector2 = null, eventFee = 0) {
        showModal(
            "confirm",
            "Ao confirmar, prosseguiremos com sua inscrição. Deseja continuar?",
            () => {
                closeModal();
                subscribe(eventId, type, sector1, sector2, eventFee);
            },
        );
    }

    async function simulatePayment() {
        isProcessingPayment = true;
        try {
            if (createdSubscriptionId) {
                await fetch(`${API_URL}/v1/subscriptions/${createdSubscriptionId}`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ paid_the_fee: true })
                });
            }
        } catch (err) {
            console.error("Erro ao simular pagamento:", err);
        }
        
        setTimeout(() => {
            isProcessingPayment = false;
            showPaymentModal = false;
            showModal("success", "Pagamento confirmado e inscrição realizada com sucesso!");
            activeTab = "subscriptions";
            fetchSubscriptions();
        }, 1500);
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

    function handleOpenMessage(message) {
        selectedInboxMessage = message;
        activeTab = "inbox";
    }

    /** @param {any} event */
    function openEventDetails(event) {
        selectedEvent = event;
        activeTab = "event_details";
    }

    /** @param {any} event */
    function openEventForm(event = null) {
        selectedEvent = event;
        activeTab = "event_form";
    }

    /** @param {any} event */
    function requestDeleteEvent(event) {
        showModal(
            "confirm",
            "Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.",
            () => {
                closeModal();
                performDeleteEvent(event.id);
            },
        );
    }

    /** @param {number | string} eventId */
    async function performDeleteEvent(eventId) {
        try {
            loading = true;
            const response = await fetch(`${API_URL}/v1/activities/${eventId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.ok || response.status === 204) {
                showModal("success", "Atividade excluída com sucesso!", () => {
                    activeTab = "events";
                    fetchEvents();
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                showModal(
                    "error",
                    errorData.message || "Erro ao excluir a atividade.",
                );
            }
        } catch (err) {
            console.error("Erro ao excluir atividade:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        } finally {
            loading = false;
        }
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
                updateUser(userData);
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
        setLogout();
        goto('/login');
    }
</script>

<div
    class="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 font-['Inter']"
>
    <!-- Componente: Sidebar (Navegação lateral) -->
    <Sidebar
        bind:activeTab
        bind:isExpanded={isSidebarExpanded}
        {isAdmin}
        {handleLogout}
        onAddEvent={() => openEventForm()}
    />

    <!-- Main Content -->
    <main class="{isSidebarExpanded ? 'ml-64' : 'ml-20'} flex-grow p-10 transition-all duration-300">
        <!-- Componente: Header (Cabeçalho com perfil) -->
        <Header {userData} {defaultAvatar} bind:activeTab {handleLogout} onOpenMessage={handleOpenMessage} />
        
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
            <!-- Componente: Lista de Eventos -->
            <ActivitiesList
                {events}
                {isAdmin}
                {fetchEvents}
                currentPage={eventsCurrentPage}
                totalPages={eventsTotalPages}
                openEventForm={openEventForm}
                {openEventDetails}
            />
        {:else if activeTab === "inbox"}
            <!-- Componente: Caixa de Entrada -->
            <InboxTab bind:selectedMessage={selectedInboxMessage} />
        {:else if activeTab === "subscriptions"}
            <!-- Componente: Minhas Inscrições -->
            <MySubscriptions
                {subscriptions}
                onGoToEvents={() => (activeTab = "events")}
                {requestCancelSubscription}
                onOpenQuestionnaire={(id) => {
                    selectedSubscriptionId = id;
                    activeTab = "questionnaire";
                }}
            />
        {:else if activeTab === "users"}
            <!-- Componente: Lista de Usuários (Admin) -->
            <UsersList {token} />
        {:else if activeTab === "profile"}
            <!-- Componente: Formulário de Perfil -->
            <ProfileForm
                bind:userData
                updateProfile={requestUpdateProfile}
                {defaultAvatar}
            />
        {:else if activeTab === "event_details" && selectedEvent}
            <!-- Componente: Detalhes do Evento para inscrição -->
            <ActivityDetails
                event={selectedEvent}
                onSubscribe={requestSubscription}
                onBack={() => (activeTab = "events")}
            />
        {:else if activeTab === "event_form"}
            <!-- Componente: Formulário de Criação/Edição de Evento (Admin) -->
            <ActivityForm
                event={selectedEvent}
                onCancel={() => (activeTab = "events")}
                onDelete={() => requestDeleteEvent(selectedEvent)}
                {token}
                onSaveSuccess={() => {
                    showModal("success", "Atividade salva com sucesso!", () => {
                        activeTab = "events";
                        fetchEvents();
                    });
                }}
            />
        {:else if activeTab === "manage_activities" && isAdmin}
            <!-- Componente: Gerenciamento de Atividades (Admin) -->
            <ManageActivities
                {token}
                {events}
                {fetchEvents}
                currentPage={eventsCurrentPage}
                totalPages={eventsTotalPages}
                requestDeleteEvent={requestDeleteEvent}
                onEditEvent={(evt) => {
                    selectedEvent = evt;
                    activeTab = "event_form";
                }}
            />
        {:else if activeTab === "raffle" && isAdmin}
            <!-- Componente: Painel de Sorteio (Admin) -->
            <RafflePanel {token} />
        {:else if activeTab === "sectors" && isAdmin}
            <!-- Componente: Gerenciamento de Setores (Admin) -->
            <SectorManager {token} />
        {:else if activeTab === "questions_admin" && isAdmin}
            <QuestionManager {token} />
        {:else if activeTab === "counselor_review" && isAdmin}
            <ReviewPanel {token} {events} {showModal} {closeModal} />
        {:else if activeTab === "questionnaire" && selectedSubscriptionId}
            <QuestionnaireForm
                {token}
                preRegistrationId={selectedSubscriptionId}
                onBack={() => (activeTab = "subscriptions")}
                {showModal}
                {closeModal}
                onSuccess={() => {
                    activeTab = "subscriptions";
                    fetchSubscriptions();
                }}
            />
        {/if}
    </main>

    <Modal {modalState} {closeModal} />

    {#if showPaymentModal}
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-bg-primary border border-border-ui w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                <h3 class="text-2xl font-black mb-6 text-center">Pagamento da Inscrição</h3>
                <p class="text-text-secondary text-center text-sm font-bold uppercase tracking-wider mb-8">
                    Valor: <span class="text-brand">R$ {parseFloat(paymentFee).toFixed(2).replace(".", ",")}</span>
                </p>

                <div class="flex flex-col gap-4">
                    {#if isProcessingPayment}
                        <div class="flex flex-col items-center justify-center py-8">
                            <div class="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-sm font-bold text-text-secondary uppercase tracking-widest animate-pulse">Processando Pagamento...</p>
                        </div>
                    {:else}
                        <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui text-center mb-4">
                            <p class="text-xs text-text-secondary mb-2">Simulação de Pagamento via PIX</p>
                            <div class="w-48 h-48 bg-white mx-auto border-4 border-border-ui rounded-xl mb-4 flex items-center justify-center">
                                <span class="text-border-ui font-black uppercase tracking-widest text-xs">QR CODE</span>
                            </div>
                        </div>

                        <button
                            onclick={simulatePayment}
                            class="w-full px-6 py-4 bg-brand text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                            Simular Pagamento
                        </button>
                        <button
                            onclick={() => {
                                showPaymentModal = false;
                                showModal("success", "Sua inscrição foi reservada! Você pode realizar o pagamento depois pela aba de inscrições.");
                                activeTab = "subscriptions";
                                fetchSubscriptions();
                            }}
                            class="w-full px-6 py-4 bg-bg-secondary text-text-primary font-black uppercase tracking-widest rounded-2xl hover:bg-border-ui transition-all"
                        >
                            Pagar Depois
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
