<script>
    import { onMount } from "svelte";

    let { token, events = [], showModal, closeModal } = $props();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    let selectedEventId = $state("");
    let campers = $state([]);
    let loading = $state(false);
    let currentPage = $state(1);
    let totalPages = $state(1);

    let camperSearchTerm = $state("");

    // Dropdown state
    let eventSearchTerm = $state("");
    let showEventDropdown = $state(false);
    let filteredEvents = $derived(events.filter(e => e.name.toLowerCase().includes(eventSearchTerm.toLowerCase())));

    // Modal state for viewing form
    let viewingCamper = $state(null);
    let showFormModal = $state(false);

    /** @type {{ show: boolean, type: string, message: string }} */
    let notification = $state({ show: false, type: "", message: "" });

    function showNotification(type, message) {
        notification = { show: true, type, message };
        setTimeout(() => {
            notification.show = false;
        }, 3000);
    }

    async function fetchCampers(page = 1, searchQuery = "") {
        if (!selectedEventId) {
            campers = [];
            return;
        }
        try {
            loading = true;
            let url = `${API_URL}/v1/reviews?activity_id=${selectedEventId}&page=${page}`;
            if (searchQuery.trim()) {
                url += `&search=${encodeURIComponent(searchQuery.trim())}`;
            }
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                campers = data.data || [];
                currentPage = data.current_page || 1;
                totalPages = data.last_page || 1;
            } else {
                showNotification("error", "Erro ao buscar inscrições.");
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        } finally {
            loading = false;
        }
    }

    function viewForm(camper) {
        viewingCamper = camper;
        showFormModal = true;
    }

    function closeFormModal() {
        showFormModal = false;
        viewingCamper = null;
    }

    function requestApproveRegistration(camperId) {
        if (showModal) {
            showModal(
                "confirm",
                "Tem certeza que deseja aprovar esta inscrição?",
                () => {
                    closeModal();
                    performApproveRegistration(camperId);
                }
            );
        } else {
            if (confirm("Tem certeza que deseja aprovar esta inscrição?")) {
                performApproveRegistration(camperId);
            }
        }
    }

    async function performApproveRegistration(camperId) {
        try {
            const res = await fetch(`${API_URL}/v1/reviews/${camperId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                showNotification("success", "Inscrição aprovada com sucesso!");
                fetchCampers();
            } else {
                showNotification("error", "Erro ao aprovar inscrição.");
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }

    function requestRejectRegistration(camperId) {
        if (showModal) {
            showModal(
                "confirm",
                "Tem certeza que deseja REJEITAR esta inscrição? Esta ação é irreversível.",
                () => {
                    closeModal();
                    performRejectRegistration(camperId);
                }
            );
        } else {
            if (confirm("Tem certeza que deseja REJEITAR esta inscrição? Esta ação é irreversível.")) {
                performRejectRegistration(camperId);
            }
        }
    }

    async function performRejectRegistration(camperId) {
        try {
            const res = await fetch(`${API_URL}/v1/reviews/${camperId}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                showNotification("success", "Inscrição rejeitada.");
                fetchCampers();
            } else {
                showNotification("error", "Erro ao rejeitar inscrição.");
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 class="text-3xl font-black mb-6">Aprovação de Inscrições</h2>
    </div>

    {#if notification.show}
        <div class="p-4 rounded-xl border font-medium text-sm {notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}">
            {notification.message}
        </div>
    {/if}

    <div class="bg-bg-secondary border border-border-ui rounded-[2rem] p-6 shadow-xl">
        <div class="max-w-md mb-8 relative">
            <label class="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">
                Selecione a Atividade
            </label>
            
            <div class="relative z-[10]">
                <button
                    type="button"
                    onclick={() => showEventDropdown = !showEventDropdown}
                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-left focus:outline-none focus:border-brand transition-colors flex justify-between items-center"
                >
                    <span class={selectedEventId ? 'text-text-primary font-bold' : 'text-text-secondary'}>
                        {selectedEventId ? events.find(e => e.id === selectedEventId)?.name : "Pesquisar e selecionar..."}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-secondary transition-transform {showEventDropdown ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {#if showEventDropdown}
                    <div class="absolute w-full mt-2 bg-bg-primary border border-border-ui rounded-xl shadow-2xl overflow-hidden">
                        <div class="p-3 border-b border-border-ui bg-bg-secondary sticky top-0">
                            <div class="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    bind:value={eventSearchTerm}
                                    placeholder="Buscar atividade..."
                                    class="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border-ui rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                                    autofocus
                                />
                            </div>
                        </div>
                        <ul class="max-h-60 overflow-y-auto">
                            {#each filteredEvents as event}
                                <li>
                                    <button
                                        type="button"
                                        onclick={() => {
                                            selectedEventId = event.id;
                                            showEventDropdown = false;
                                            eventSearchTerm = "";
                                            fetchCampers();
                                        }}
                                        class="w-full text-left px-4 py-3 hover:bg-brand/10 transition-colors {selectedEventId === event.id ? 'bg-brand/5 text-brand font-bold border-l-4 border-brand' : 'text-text-primary border-l-4 border-transparent'}"
                                    >
                                        {event.name}
                                    </button>
                                </li>
                            {:else}
                                <li class="px-4 py-4 text-text-secondary text-sm text-center font-medium">Nenhuma atividade encontrada</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>

            <!-- Overlay invisível para fechar o dropdown ao clicar fora -->
            {#if showEventDropdown}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <div 
                    class="fixed inset-0 z-[9]" 
                    onclick={() => {showEventDropdown = false; eventSearchTerm = "";}}
                ></div>
            {/if}
        </div>

        {#if loading}
            <div class="flex justify-center items-center py-12">
                <div class="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        {:else if selectedEventId}
            <div class="mb-6 flex gap-4 items-center">
                <input
                    type="text"
                    bind:value={camperSearchTerm}
                    onkeydown={(e) => { if (e.key === 'Enter') fetchCampers(1, camperSearchTerm); }}
                    placeholder="Pesquisar campista por nome, email ou CPF..."
                    class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                />
                <button
                    onclick={() => fetchCampers(1, camperSearchTerm)}
                    class="px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:brightness-110 transition-all shrink-0 shadow-lg shadow-brand/20"
                >
                    Buscar
                </button>
            </div>
            
            {#if campers.length === 0}
                <div class="text-center p-12 border border-dashed border-border-ui rounded-xl">
                    <p class="text-text-secondary font-bold">Não há inscrições aguardando aprovação para esta atividade.</p>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b-2 border-border-ui">
                                <th class="py-4 px-4 font-bold text-text-secondary uppercase tracking-wider text-xs">Campista</th>
                                <th class="py-4 px-4 font-bold text-text-secondary uppercase tracking-wider text-xs">CPF</th>
                                <th class="py-4 px-4 font-bold text-text-secondary uppercase tracking-wider text-xs text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each campers as camper}
                                <tr class="border-b border-border-ui hover:bg-bg-primary/50 transition-colors">
                                    <td class="py-4 px-4">
                                        <p class="font-bold text-text-primary">{camper.user?.name || "Desconhecido"}</p>
                                        <p class="text-xs text-text-secondary">{camper.user?.email}</p>
                                    </td>
                                    <td class="py-4 px-4 text-text-secondary">
                                        {camper.user?.masked_cpf || camper.user?.cpf || 'Não informado'}
                                    </td>
                                    <td class="py-4 px-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button
                                                onclick={() => viewForm(camper)}
                                                class="px-4 py-2 bg-text-primary/5 text-text-primary rounded-lg font-bold hover:bg-text-primary/10 transition-colors text-sm"
                                            >
                                                Visualizar Formulário
                                            </button>
                                            {#if camper.camping_pre_registration?.is_approved || camper.campingPreRegistration?.is_approved}
                                                <button
                                                    disabled
                                                    class="px-4 py-2 bg-green-500/50 text-white rounded-lg font-bold cursor-not-allowed text-sm"
                                                >
                                                    Aprovado
                                                </button>
                                            {:else}
                                                <button
                                                    onclick={() => requestApproveRegistration(camper.id)}
                                                    class="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:brightness-110 transition-colors text-sm"
                                                >
                                                    Aprovar
                                                </button>
                                            {/if}
                                            <button
                                                onclick={() => requestRejectRegistration(camper.id)}
                                                class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:brightness-110 transition-colors text-sm"
                                            >
                                                Rejeitar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-between items-center mt-6">
                    <button
                        disabled={currentPage === 1}
                        onclick={() => fetchCampers(currentPage - 1, camperSearchTerm)}
                        class="px-6 py-2 bg-bg-secondary border border-border-ui text-text-primary rounded-xl font-bold disabled:opacity-50 hover:bg-border-ui transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                        Página Anterior
                    </button>
                    <span class="text-sm font-bold text-text-secondary">Página {currentPage} de {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onclick={() => fetchCampers(currentPage + 1, camperSearchTerm)}
                        class="px-6 py-2 bg-brand text-white rounded-xl font-bold disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-brand/20"
                    >
                        Próxima Página
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</div>

<!-- Modal Visualizar Formulário -->
{#if showFormModal && viewingCamper}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-bg-secondary w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border-ui">
            <div class="p-6 border-b border-border-ui flex items-center justify-between bg-bg-primary/50">
                <div>
                    <h3 class="text-2xl font-black text-text-primary">
                        Formulário de {viewingCamper.user?.name}
                    </h3>
                    <p class="text-text-secondary text-sm font-medium mt-1">Revise as respostas enviadas pelo campista antes de aprovar.</p>
                </div>
                <button
                    onclick={closeFormModal}
                    class="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 bg-bg-primary">
                {#if viewingCamper.answers && viewingCamper.answers.length > 0}
                    <div class="space-y-6">
                        {#each viewingCamper.answers as answer}
                            <div class="bg-bg-secondary p-5 rounded-2xl border border-border-ui">
                                <p class="text-sm font-black text-brand mb-2">{answer.question?.text || "Pergunta não encontrada"}</p>
                                <p class="text-text-primary whitespace-pre-wrap">{answer.answer}</p>
                            </div>
                        {/each}
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
