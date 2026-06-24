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
        if (
            activity.activitable_type === "App\\Models\\Camping" &&
            activity.activitable
        ) {
            /** @type {number[]} */
            const endDates = [];
            if (activity.activitable.camper_registration_end_date) {
                endDates.push(
                    new Date(
                        activity.activitable.camper_registration_end_date,
                    ).getTime(),
                );
            }
            if (activity.activitable.servant_registration_end_date) {
                endDates.push(
                    new Date(
                        activity.activitable.servant_registration_end_date,
                    ).getTime(),
                );
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
            const matchesSearch =
                e.name &&
                e.name.toLowerCase().includes(eventSearchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // Filtro por tipo
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

        {#if isAdmin}
            <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative">
                    <input 
                        type="checkbox" 
                        bind:checked={showPastEvents}
                        class="sr-only"
                    >
                    <div class="w-10 h-6 bg-bg-secondary border-2 border-border-ui rounded-full transition-colors group-hover:border-brand peer-checked:bg-brand"></div>
                    <div class="absolute top-1 left-1 bg-text-secondary w-4 h-4 rounded-full transition-transform duration-300 {showPastEvents ? 'translate-x-4 bg-white' : ''}"></div>
                </div>
                <span class="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                    Exibir atividades passadas
                </span>
            </label>
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
                <div class="flex justify-between items-start mb-4">
                    <h3
                        class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1"
                    >
                        {event.name || "Atividade"}
                    </h3>
                </div>
                {#if event.category}
                    <p class="text-xs text-text-secondary font-bold mb-3">
                        {event.category.name}
                    </p>
                {/if}

                <!-- Info grid -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    {#if event.start_date}
                        <div class="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="text-text-secondary"
                                ><rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="4"
                                    rx="2"
                                    ry="2"
                                /><line x1="16" x2="16" y1="2" y2="6" /><line
                                    x1="8"
                                    x2="8"
                                    y1="2"
                                    y2="6"
                                /><line x1="3" x2="21" y1="10" y2="10" /></svg
                            >
                            <span
                                class="text-xs text-text-secondary font-medium"
                            >
                                {new Date(event.start_date).toLocaleDateString(
                                    "pt-BR",
                                )}
                            </span>
                        </div>
                    {/if}
                    {#if event.place}
                        <div class="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="text-text-secondary"
                                ><path
                                    d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                                /><circle cx="12" cy="10" r="3" /></svg
                            >
                            <span
                                class="text-xs text-text-secondary font-medium line-clamp-1"
                            >
                                {event.place}
                            </span>
                        </div>
                    {/if}
                    <div class="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="text-text-secondary"
                            ><path
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                            /><circle cx="9" cy="7" r="4" /><path
                                d="M22 21v-2a4 4 0 0 0-3-3.87"
                            /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
                        >
                        <span class="text-xs text-text-secondary font-medium">
                            {event.total_vacancies > 0
                                ? `${event.total_vacancies} vagas`
                                : "Vagas ilimitadas"}
                        </span>
                    </div>
                    {#if event.activitable?.camper_fee || event.activitable?.ticket_price}
                        <div class="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="text-brand"
                                ><line x1="12" x2="12" y1="2" y2="22" /><path
                                    d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                /></svg
                            >
                            <span class="text-xs text-brand font-bold">
                                R$ {parseFloat(
                                    event.activitable.camper_fee ||
                                        event.activitable.ticket_price,
                                )
                                    .toFixed(2)
                                    .replace(".", ",")}
                            </span>
                        </div>
                    {:else}
                        <div class="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="text-green-500"
                                ><line x1="12" x2="12" y1="2" y2="22" /><path
                                    d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                /></svg
                            >
                            <span class="text-xs text-green-500 font-bold">
                                Gratuito
                            </span>
                        </div>
                    {/if}
                </div>

                <div
                    class="flex justify-between items-center pt-6 border-t border-border-ui"
                >
                    <span class="text-[10px] font-black uppercase opacity-40"
                        >Campanha {event.year || new Date().getFullYear()}</span
                    >
                    <div class="flex gap-2">
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
