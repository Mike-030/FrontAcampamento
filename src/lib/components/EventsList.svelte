<script>
    let {
        events = [],
        isAdmin = false,
        fetchEvents,
        openEventForm,
        openEventDetails,
    } = $props();

    let eventSearchQuery = $state("");
    let showPastEvents = $state(false);

    /** @param {any} event */
    function isRegistrationPassed(event) {
        if (!event) return false;
        const now = new Date();
        
        // Se a data de início do evento já passou, está indisponível
        if (event.start_date && new Date(event.start_date) < now) {
            return true;
        }
        
        // Para acampamento, checamos o fim das inscrições
        if (event.eventable_type === "App\\Models\\Camping" && event.eventable) {
            /** @type {number[]} */
            const endDates = [];
            if (event.eventable.camper_registration_end_date) {
                endDates.push(new Date(event.eventable.camper_registration_end_date).getTime());
            }
            if (event.eventable.servant_registration_end_date) {
                endDates.push(new Date(event.eventable.servant_registration_end_date).getTime());
            }
            
            if (endDates.length > 0) {
                const maxDate = new Date(Math.max(...endDates));
                if (maxDate < now) return true;
            }
        }
        
        return false;
    }

    let filteredEvents = $derived(
        events.filter((e) => {
            const matchesSearch = e.name && e.name.toLowerCase().includes(eventSearchQuery.toLowerCase());
            if (!matchesSearch) return false;
            
            const isPassed = isRegistrationPassed(e);
            
            if (isAdmin) {
                return showPastEvents ? true : !isPassed;
            } else {
                return !isPassed;
            }
        }),
    );
</script>

<div class="mb-6">
    <h2 class="text-3xl font-black mb-6">Eventos Disponíveis</h2>
    <input
        type="text"
        bind:value={eventSearchQuery}
        placeholder="Pesquisar por nome do evento..."
        class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
    />
    {#if isAdmin}
        <div class="mt-4 flex items-center gap-3">
            <input
                id="show-past"
                type="checkbox"
                bind:checked={showPastEvents}
                class="w-5 h-5 accent-brand rounded border-border-ui"
            />
            <label for="show-past" class="text-sm font-bold text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
                Exibir eventos passados
            </label>
        </div>
    {/if}
</div>
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
{:else if filteredEvents.length === 0}
    <div
        class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
    >
        <p class="text-text-secondary text-xs font-bold mb-6">
            Nenhum evento corresponde à pesquisa.
        </p>
    </div>
{:else}
    <div
        class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-text-primary"
    >
        {#each filteredEvents as event}
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
                            {event.eventable_type === "App\\Models\\Festival"
                                ? "Festival"
                                : "Acampamento"}
                        </span>
                    </div>
                </div>
                <div
                    class="flex justify-between items-center pt-8 border-t border-border-ui"
                >
                    <span class="text-[10px] font-black uppercase opacity-40"
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
