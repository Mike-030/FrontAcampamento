<script>
    import EventForm from "./EventForm.svelte";

    let {
        events = [],
        token,
        fetchEvents,
        requestDeleteEvent,
    } = $props();

    let eventSearchQuery = $state("");
    let isEditingEvent = $state(false);
    let selectedEvent = $state(null);

    let filteredEvents = $derived(
        events.filter((e) => {
            const matchesSearch = e.name && e.name.toLowerCase().includes(eventSearchQuery.toLowerCase());
            return matchesSearch;
        }),
    );

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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar para a Lista
        </button>
    </div>
    <EventForm
        event={selectedEvent}
        onCancel={closeEditModal}
        onDelete={() => { closeEditModal(); requestDeleteEvent(selectedEvent); }}
        {token}
        onSaveSuccess={() => {
            closeEditModal();
            fetchEvents();
        }}
    />
{:else}
    <div class="mb-6">
        <h2 class="text-3xl font-black mb-6">Gerenciamento de Atividades</h2>
        <input
            type="text"
            bind:value={eventSearchQuery}
            placeholder="Pesquisar por nome da atividade..."
            class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
        />
    </div>

    {#if events.length === 0}
        <div class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
            <p class="text-text-secondary text-xs font-bold mb-6">Nenhuma atividade cadastrada.</p>
            <button
                onclick={fetchEvents}
                class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
            >
                Recarregar
            </button>
        </div>
    {:else}
        <div class="bg-bg-secondary border border-border-ui rounded-[2rem] overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-text-primary">
                    <thead class="text-xs uppercase bg-bg-primary border-b border-border-ui">
                        <tr>
                            <th class="px-6 py-4 font-bold text-text-secondary">Nome</th>
                            <th class="px-6 py-4 font-bold text-text-secondary">Categoria</th>
                            <th class="px-6 py-4 font-bold text-text-secondary">Data Início</th>
                            <th class="px-6 py-4 font-bold text-text-secondary text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredEvents as event}
                            <tr class="border-b border-border-ui hover:bg-text-primary/5 transition-colors">
                                <td class="px-6 py-4 font-medium">{event.name}</td>
                                <td class="px-6 py-4">
                                    {#if event.category}
                                        <span class="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-bold">{event.category.name}</span>
                                    {/if}
                                </td>
                                <td class="px-6 py-4">
                                    {event.start_date ? new Date(event.start_date).toLocaleDateString("pt-BR") : "N/A"}
                                </td>
                                <td class="px-6 py-4 flex justify-end gap-2">
                                    <button
                                        onclick={() => openEditModal(event)}
                                        class="p-2 bg-text-primary/5 text-brand rounded-lg hover:bg-brand/10 transition-colors"
                                        title="Editar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                    </button>
                                    <button
                                        onclick={() => requestDeleteEvent(event)}
                                        class="p-2 bg-text-primary/5 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Excluir"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
{/if}
