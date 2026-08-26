<script>
    import ActivityForm from "./ActivityForm.svelte";

    let { events = [], token, fetchEvents, requestDeleteEvent, currentPage = 1, totalPages = 1 } = $props();

    const API_URL = import.meta.env.VITE_API_URL;

    let eventSearchQuery = $state("");
    let isEditingEvent = $state(false);
    let selectedEvent = $state(null);
    let typeFilter = $state("all"); // "all", "camping", "event"

    let filteredEvents = $derived(
        events.filter((e) => {
            if (
                typeFilter === "camping" &&
                e.activitable_type !== "App\\Models\\Camping"
            )
                return false;
            if (
                typeFilter === "event" &&
                e.activitable_type !== "App\\Models\\Event"
            )
                return false;
            return true;
        })
    );

    let isViewingSubscribers = $state(false);
    let subscribersList = $state([]);
    let loadingSubscribers = $state(false);
    let subscribersCurrentPage = $state(1);
    let subscribersTotalPages = $state(1);

    let showFormModal = $state(false);
    let viewingSubscriber = $state(null);
    let viewingAnswers = $state([]);
    let loadingAnswers = $state(false);

    async function viewForm(sub) {
        viewingSubscriber = sub;
        showFormModal = true;
        
        if (!sub.has_answered_form) {
            loadingAnswers = false;
            viewingAnswers = [];
            return;
        }
        
        loadingAnswers = true;
        viewingAnswers = [];
        try {
            const res = await fetch(`${API_URL}/v1/answers?pre_registration_id=${sub.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                viewingAnswers = data.data || [];
            } else {
                console.error("Erro ao buscar respostas");
            }
        } catch (err) {
            console.error(err);
        } finally {
            loadingAnswers = false;
        }
    }

    function closeFormModal() {
        showFormModal = false;
        viewingSubscriber = null;
        viewingAnswers = [];
    }

    async function openSubscribersList(event, page = 1) {
        selectedEvent = event;
        isViewingSubscribers = true;
        loadingSubscribers = true;
        try {
            const response = await fetch(`${API_URL}/v1/subscriptions?activity_id=${event.id}&page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                subscribersList = data.data || [];
                subscribersCurrentPage = data.meta?.current_page || 1;
                subscribersTotalPages = data.meta?.last_page || 1;
            } else {
                console.error("Erro ao buscar inscritos", data);
                subscribersList = [];
            }
        } catch (err) {
            console.error("Erro de conexão", err);
        } finally {
            loadingSubscribers = false;
        }
    }

    function closeSubscribersList() {
        isViewingSubscribers = false;
        selectedEvent = null;
        subscribersList = [];
    }

    function openEditModal(event) {
        selectedEvent = event;
        isEditingEvent = true;
    }

    function closeEditModal() {
        isEditingEvent = false;
        selectedEvent = null;
    }
</script>

{#if isEditingEvent}
    <div class="mb-6">
        <button
            onclick={closeEditModal}
            class="mb-4 flex items-center gap-2 text-text-secondary hover:text-brand font-bold transition-colors"
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
                stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
            >
            Voltar para a Lista
        </button>
    </div>
    <ActivityForm
        event={selectedEvent}
        onCancel={closeEditModal}
        onDelete={() => {
            closeEditModal();
            requestDeleteEvent(selectedEvent);
        }}
        {token}
        onSaveSuccess={() => {
            closeEditModal();
            fetchEvents();
        }}
    />
{:else if isViewingSubscribers}
    <div class="mb-6">
        <button
            onclick={closeSubscribersList}
            class="mb-4 flex items-center gap-2 text-text-secondary hover:text-brand font-bold transition-colors"
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
                stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
            >
            Voltar para a Lista
        </button>
    </div>
    
    <div class="bg-bg-secondary border border-border-ui rounded-[2.5rem] p-8 shadow-xl">
        <h3 class="text-2xl font-black mb-6">Inscritos na Atividade: {selectedEvent?.name}</h3>
        
        {#if loadingSubscribers}
            <div class="flex justify-center items-center py-12">
                <div class="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        {:else if subscribersList.length === 0}
            <div class="text-center py-12 bg-bg-secondary/30 rounded-[2rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
                <p class="text-text-secondary text-xs font-bold">Nenhum usuário inscrito nesta atividade.</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-text-primary">
                    <thead class="text-xs uppercase bg-bg-primary border-b border-border-ui">
                        <tr>
                            <th class="px-6 py-4 font-bold text-text-secondary">Nome</th>
                            <th class="px-6 py-4 font-bold text-text-secondary">Email</th>
                            <th class="px-6 py-4 font-bold text-text-secondary">CPF</th>
                            <th class="px-6 py-4 font-bold text-text-secondary">Tipo de Inscrição</th>
                            <th class="px-6 py-4 font-bold text-text-secondary text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each subscribersList as sub}
                            <tr class="border-b border-border-ui hover:bg-bg-primary/50 transition-colors">
                                <td class="px-6 py-4 font-medium">{sub.user?.name || '-'}</td>
                                <td class="px-6 py-4 text-text-secondary">{sub.user?.email || '-'}</td>
                                <td class="px-6 py-4">{sub.user?.masked_cpf || sub.user?.cpf || '-'}</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-bold">{sub.subscription_type}</span>
                                </td>
                                <td class="px-6 py-4 flex justify-end gap-2">
                                        <button
                                            onclick={() => viewForm(sub)}
                                            class="p-2 bg-text-primary/5 text-brand rounded-lg hover:bg-brand/10 transition-colors text-sm font-bold flex items-center gap-2"
                                            title="Ver Formulário"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                            Ver Formulário
                                        </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-between items-center mt-6">
                <button
                    disabled={subscribersCurrentPage === 1}
                    onclick={() => openSubscribersList(selectedEvent, subscribersCurrentPage - 1)}
                    class="px-6 py-2 bg-bg-secondary border border-border-ui text-text-primary rounded-xl font-bold disabled:opacity-50 hover:bg-border-ui transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                    Página Anterior
                </button>
                <span class="text-sm font-bold text-text-secondary">Página {subscribersCurrentPage} de {subscribersTotalPages}</span>
                <button
                    disabled={subscribersCurrentPage === subscribersTotalPages}
                    onclick={() => openSubscribersList(selectedEvent, subscribersCurrentPage + 1)}
                    class="px-6 py-2 bg-brand text-white rounded-xl font-bold disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-brand/20"
                >
                    Próxima Página
                </button>
            </div>
        {/if}
    </div>

    <!-- Modal Visualizar Formulário -->
    {#if showFormModal && viewingSubscriber}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-bg-secondary w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border-ui">
                <div class="p-6 border-b border-border-ui flex items-center justify-between bg-bg-primary/50">
                    <div>
                        <h3 class="text-2xl font-black text-text-primary">
                            Formulário de {viewingSubscriber.user?.name}
                        </h3>
                    </div>
                    <button
                        onclick={closeFormModal}
                        class="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
    
                <div class="p-6 overflow-y-auto flex-1 bg-bg-primary">
                    {#if loadingAnswers}
                        <div class="flex justify-center items-center py-12">
                            <div class="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    {:else if viewingAnswers && viewingAnswers.length > 0}
                        <div class="space-y-6">
                            {#each viewingAnswers as answer}
                                <div class="bg-bg-secondary p-5 rounded-2xl border border-border-ui">
                                    <p class="text-sm font-black text-brand mb-2">{answer.question?.text || "Pergunta não encontrada"}</p>
                                    <p class="text-text-primary whitespace-pre-wrap">{answer.answer}</p>
                                </div>
                            {/each}
                        </div>
                    {:else if !viewingSubscriber.has_answered_form}
                        <div class="text-center p-12">
                            <p class="text-text-secondary font-bold">O usuário ainda não enviou o formulário.</p>
                        </div>
                    {:else}
                        <div class="text-center p-12">
                            <p class="text-text-secondary font-bold">Nenhuma resposta encontrada.</p>
                        </div>
                    {/if}
                </div>
    
                <div class="p-6 border-t border-border-ui bg-bg-secondary flex justify-end gap-3">
                    <button
                        onclick={closeFormModal}
                        class="px-6 py-3 bg-bg-primary text-text-secondary font-bold rounded-xl border border-border-ui hover:bg-text-primary/5 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    {/if}
{:else}
    <h2 class="text-3xl font-black mb-6">Gerenciar Atividades</h2>
    <div class="mb-6 flex gap-4 items-center">
        <input
            type="text"
            bind:value={eventSearchQuery}
            onkeydown={(e) => { if (e.key === 'Enter') fetchEvents(1, eventSearchQuery); }}
            placeholder="Pesquisar por nome da atividade..."
            class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
        />
        <button
            onclick={() => fetchEvents(1, eventSearchQuery)}
            class="px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:brightness-110 transition-all shrink-0 shadow-lg shadow-brand/20"
        >
            Buscar
        </button>
    </div>

    <!-- Filtro por tipo -->
    <div class="mb-6 flex flex-wrap gap-2">
        <button
            onclick={() => (typeFilter = "all")}
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter ===
            'all'
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
        >
            Todos
        </button>
        <button
            onclick={() => (typeFilter = "camping")}
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter ===
            'camping'
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
        >
            Acampamentos
        </button>
        <button
            onclick={() => (typeFilter = "event")}
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter ===
            'event'
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
        >
            Eventos
        </button>
    </div>

    {#if events.length === 0}
        <div
            class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
        >
            <p class="text-text-secondary text-xs font-bold mb-6">
                Nenhuma atividade cadastrada.
            </p>
            <button
                onclick={fetchEvents}
                class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
            >
                Recarregar
            </button>
        </div>
    {:else if filteredEvents.length === 0}
        <div
            class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
        >
            <p class="text-text-secondary text-xs font-bold mb-6">
                Nenhuma atividade corresponde ao filtro.
            </p>
        </div>
    {:else}
        <div
            class="bg-bg-secondary border border-border-ui rounded-[2rem] overflow-hidden shadow-xl"
        >
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-text-primary">
                    <thead
                        class="text-xs uppercase bg-bg-primary border-b border-border-ui"
                    >
                        <tr>
                            <th class="px-6 py-4 font-bold text-text-secondary"
                                >Nome</th
                            >
                            <th class="px-6 py-4 font-bold text-text-secondary"
                                >Data Início</th
                            >
                            <th class="px-6 py-4 font-bold text-text-secondary text-center"
                                >Inscritos</th
                            >
                            <th
                                class="px-6 py-4 font-bold text-text-secondary text-right"
                                >Ações</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredEvents as event}
                            <tr
                                class="border-b border-border-ui hover:bg-bg-primary/50 transition-colors"
                            >
                                <td class="px-6 py-4 font-medium"
                                    >{event.name}</td
                                >
                                <td class="px-6 py-4">
                                    {event.start_date
                                        ? new Date(
                                              event.start_date,
                                          ).toLocaleDateString("pt-BR")
                                        : "N/A"}
                                </td>
                                <td class="px-6 py-4 text-center font-medium">
                                    {event.pre_registrations_count || 0}
                                </td>
                                <td class="px-6 py-4 flex justify-end gap-2">
                                    <button
                                        onclick={() => openSubscribersList(event)}
                                        class="p-2 bg-text-primary/5 text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors"
                                        title="Ver Inscritos"
                                    >
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
                                            ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    </button>
                                    <button
                                        onclick={() => openEditModal(event)}
                                        class="p-2 bg-text-primary/5 text-brand rounded-lg hover:bg-brand/10 transition-colors"
                                        title="Editar"
                                    >
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
                                            ><path
                                                d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                                            /></svg
                                        >
                                    </button>
                                    <button
                                        onclick={() =>
                                            requestDeleteEvent(event)}
                                        class="p-2 bg-text-primary/5 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Excluir"
                                    >
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
                                            ><path d="M3 6h18" /><path
                                                d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                                            /><path
                                                d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                            /></svg
                                        >
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="flex justify-between items-center mt-6">
            <button
                disabled={currentPage === 1}
                onclick={() => fetchEvents(currentPage - 1)}
                class="px-6 py-2 bg-bg-secondary border border-border-ui text-text-primary rounded-xl font-bold disabled:opacity-50 hover:bg-border-ui transition-all cursor-pointer disabled:cursor-not-allowed"
            >
                Página Anterior
            </button>
            <span class="text-sm font-bold text-text-secondary">Página {currentPage} de {totalPages}</span>
            <button
                disabled={currentPage === totalPages}
                onclick={() => fetchEvents(currentPage + 1)}
                class="px-6 py-2 bg-brand text-white rounded-xl font-bold disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-brand/20"
            >
                Próxima Página
            </button>
        </div>
    {/if}
{/if}
