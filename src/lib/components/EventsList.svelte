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
    let typeFilter = $state("all"); // "all", "camping", "event"

    /** @param {any} activity */
    function isRegistrationPassed(activity) {
        if (!activity) return false;
        const now = new Date();
        
        // Se a data de início da atividade já passou, está indisponível
        if (activity.start_date && new Date(activity.start_date) < now) {
            return true;
        }
        
        // Para acampamento, checamos o fim das inscrições
        if (activity.activitable_type === "App\\Models\\Camping" && activity.activitable) {
            /** @type {number[]} */
            const endDates = [];
            if (activity.activitable.camper_registration_end_date) {
                endDates.push(new Date(activity.activitable.camper_registration_end_date).getTime());
            }
            if (activity.activitable.servant_registration_end_date) {
                endDates.push(new Date(activity.activitable.servant_registration_end_date).getTime());
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

            // Filtro por tipo
            if (typeFilter === "camping" && e.activitable_type !== "App\\Models\\Camping") return false;
            if (typeFilter === "event" && e.activitable_type !== "App\\Models\\Event") return false;
            
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
    <h2 class="text-3xl font-black mb-6">Atividades Disponíveis</h2>
    <input
        type="text"
        bind:value={eventSearchQuery}
        placeholder="Pesquisar por nome da atividade..."
        class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
    />
    <div class="mt-4 flex flex-wrap items-center gap-4">
        <!-- Filtro por tipo -->
        <div class="flex gap-2">
            <button
                onclick={() => typeFilter = "all"}
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter === 'all' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
            >
                Todos
            </button>
            <button
                onclick={() => typeFilter = "camping"}
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter === 'camping' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
            >
                Acampamentos
            </button>
            <button
                onclick={() => typeFilter = "event"}
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all {typeFilter === 'event' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-bg-secondary border border-border-ui text-text-secondary hover:text-text-primary'}"
            >
                Eventos
            </button>
        </div>

        {#if isAdmin}
            <div class="flex items-center gap-3">
                <input
                    id="show-past"
                    type="checkbox"
                    bind:checked={showPastEvents}
                    class="w-5 h-5 accent-brand rounded border-border-ui"
                />
                <label for="show-past" class="text-sm font-bold text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
                    Exibir atividades passadas
                </label>
            </div>
        {/if}
    </div>
</div>
{#if events.length === 0}
    <div
        class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
    >
        <p class="text-text-secondary text-xs font-bold mb-6">
            Nenhuma atividade encontrada
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
            Nenhuma atividade corresponde à pesquisa.
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
                        {event.name || "Atividade"}
                    </h3>
                    <div
                        class="px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full"
                    >
                        <span
                            class="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        >
                            {event.activitable_type === "App\\Models\\Event"
                                ? "Evento"
                                : "Acampamento"}
                        </span>
                    </div>
                </div>
                {#if event.category}
                    <p class="text-xs text-text-secondary font-bold mb-4">{event.category.name}</p>
                {/if}
                <div
                    class="flex justify-between items-center pt-8 border-t border-border-ui"
                >
                    <span class="text-[10px] font-black uppercase opacity-40"
                        >Campanha {event.year || new Date().getFullYear()}</span
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
