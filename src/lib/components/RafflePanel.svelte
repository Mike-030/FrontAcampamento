<script>
    let { token } = $props();

    /** @type {any[]} */
    let campings = $state([]);
    let loading = $state(true);
    let raffleLoading = $state(null); // activity_id being raffled

    /** @type {{ show: boolean, type: string, message: string, details: any }} */
    let notification = $state({
        show: false,
        type: "",
        message: "",
        details: null,
    });

    let isViewingList = $state(false);
    let listData = $state([]);
    let listTitle = $state("");
    let listLoading = $state(false);

    let showPast = $state(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    $effect(() => {
        fetchRaffleData(showPast);
    });

    async function fetchRaffleData(includePast) {
        try {
            loading = true;
            const response = await fetch(`${API_URL}/v1/raffles?include_past=${includePast ? '1' : '0'}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                campings = data.data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar dados de sorteio:", err);
        } finally {
            loading = false;
        }
    }

    /** @param {number} activityId */
    async function performCamperRaffle(activityId) {
        raffleLoading = activityId;
        try {
            const response = await fetch(
                `${API_URL}/v1/raffles/${activityId}/campers`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            );
            const data = await response.json();
            if (response.ok) {
                notification = {
                    show: true,
                    type: "success",
                    message: data.message,
                    details: data.data,
                };
                await fetchRaffleData(showPast);
            } else {
                notification = {
                    show: true,
                    type: "error",
                    message: data.message || "Erro ao realizar o sorteio.",
                    details: null,
                };
            }
        } catch (err) {
            console.error("Erro ao realizar sorteio:", err);
            notification = {
                show: true,
                type: "error",
                message: "Não foi possível conectar com o servidor.",
                details: null,
            };
        } finally {
            raffleLoading = null;
        }
    }

    /** @param {number} activityId */
    async function performServantRaffle(activityId) {
        raffleLoading = activityId;
        try {
            const response = await fetch(
                `${API_URL}/v1/raffles/${activityId}/servants`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            );
            const data = await response.json();
            if (response.ok) {
                notification = {
                    show: true,
                    type: "success",
                    message: data.message,
                    details: data.data,
                };
                await fetchRaffleData(showPast);
            } else {
                notification = {
                    show: true,
                    type: "error",
                    message:
                        data.message || "Erro ao realizar o sorteio de servos.",
                    details: null,
                };
            }
        } catch (err) {
            console.error("Erro ao realizar sorteio de servos:", err);
            notification = {
                show: true,
                type: "error",
                message: "Não foi possível conectar com o servidor.",
                details: null,
            };
        } finally {
            raffleLoading = null;
        }
    }

    /** @param {string | null} dateStr */
    function isDateReached(dateStr) {
        if (!dateStr) return false;
        return new Date() >= new Date(dateStr);
    }

    /** @param {string | null} dateStr */
    function formatDate(dateStr) {
        if (!dateStr) return "Não definida";
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    /** @param {string | null} dateStr */
    function formatDateTime(dateStr) {
        if (!dateStr) return "Não definida";
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function closeNotification() {
        notification.show = false;
    }

    async function viewRaffleList(activityId, activityName, type) {
        listTitle = `Lista de ${type}s - ${activityName}`;
        isViewingList = true;
        listLoading = true;
        listData = [];
        try {
            const response = await fetch(`${API_URL}/v1/raffles/${activityId}/list?type=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                listData = data.data || [];
            }
        } catch (err) {
            console.error(err);
        } finally {
            listLoading = false;
        }
    }
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 class="text-3xl font-black">Menu de Sorteios</h2>
        
        <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
                <input 
                    type="checkbox" 
                    bind:checked={showPast}
                    class="sr-only"
                >
                <div class="w-10 h-6 bg-bg-secondary border-2 border-border-ui rounded-full transition-colors group-hover:border-brand peer-checked:bg-brand"></div>
                <div class="absolute top-1 left-1 bg-text-secondary w-4 h-4 rounded-full transition-transform duration-300 {showPast ? 'translate-x-4 bg-white' : ''}"></div>
            </div>
            <span class="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                Exibir acampamentos passados
            </span>
        </label>
    </div>

    {#if notification.show}
        <div
            class="p-5 rounded-2xl border {notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'} flex items-start justify-between gap-4"
        >
            <div class="flex-1">
                <p class="font-bold text-sm">{notification.message}</p>
                {#if notification.details}
                    {#if notification.details.sectors}
                        <!-- Sorteio de Servos -->
                        <div
                            class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs"
                        >
                            {#each notification.details.sectors as sector}
                                <div
                                    class="bg-bg-primary/50 rounded-xl p-3 border border-border-ui"
                                >
                                    <p
                                        class="text-text-secondary uppercase tracking-widest font-bold mb-1 truncate"
                                        title={sector.sector_name}
                                    >
                                        {sector.sector_name}
                                    </p>
                                    <p class="text-text-primary font-black">
                                        {sector.selected}/{sector.vacancies} vagas
                                    </p>
                                    <p class="text-text-secondary mt-1">
                                        {sector.subscribers} inscritos
                                    </p>
                                </div>
                            {/each}
                        </div>
                    {:else if notification.details.male}
                        <!-- Sorteio de Campistas -->
                        <div class="mt-3 grid grid-cols-3 gap-3 text-xs">
                            <div
                                class="bg-bg-primary/50 rounded-xl p-3 border border-border-ui"
                            >
                                <p
                                    class="text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Masculino
                                </p>
                                <p class="text-text-primary font-black">
                                    {notification.details.male
                                        .selected}/{notification.details.male
                                        .vacancies} vagas
                                </p>
                                <p class="text-text-secondary mt-1">
                                    {notification.details.male.subscribers} inscritos
                                </p>
                            </div>
                            <div
                                class="bg-bg-primary/50 rounded-xl p-3 border border-border-ui"
                            >
                                <p
                                    class="text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Feminino
                                </p>
                                <p class="text-text-primary font-black">
                                    {notification.details.female
                                        .selected}/{notification.details.female
                                        .vacancies} vagas
                                </p>
                                <p class="text-text-secondary mt-1">
                                    {notification.details.female.subscribers} inscritos
                                </p>
                            </div>
                            <div
                                class="bg-bg-primary/50 rounded-xl p-3 border border-border-ui"
                            >
                                <p
                                    class="text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Casais
                                </p>
                                <p class="text-text-primary font-black">
                                    {notification.details.couple
                                        .selected}/{notification.details.couple
                                        .vacancies} vagas
                                </p>
                                <p class="text-text-secondary mt-1">
                                    {notification.details.couple.subscribers} inscritos
                                </p>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
            <button
                onclick={closeNotification}
                class="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
    {/if}

    {#if isViewingList}
        <div class="space-y-6 animate-in fade-in duration-300">
            <div class="flex items-center gap-4 border-b border-border-ui pb-4">
                <button onclick={() => isViewingList = false} class="flex items-center gap-2 px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Voltar
                </button>
                <h3 class="font-black text-lg text-text-primary">
                    {listTitle}
                </h3>
            </div>
            <div class="bg-bg-secondary rounded-3xl border border-border-ui overflow-hidden shadow-sm p-6">
                {#if listLoading}
                    <div class="text-center py-10 text-text-secondary animate-pulse">Carregando lista...</div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-border-ui text-text-secondary uppercase text-[10px] tracking-wider">
                                    <th class="p-3 font-bold">Posição</th>
                                    <th class="p-3 font-bold">Nome</th>
                                    <th class="p-3 font-bold">Setor Preferido</th>
                                    <th class="p-3 font-bold text-center">Confirmação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each listData as item, i}
                                    <tr class="border-b border-border-ui/50 hover:bg-bg-primary/30 {item.is_quitter ? 'opacity-50' : ''}">
                                        <td class="p-3">
                                            {#if item.is_selected}
                                                <span class="px-2 py-1 bg-green-500/10 text-green-500 rounded font-bold text-xs">Sorteado</span>
                                            {:else}
                                                <span class="px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-bold text-xs">Remanescente #{item.substitute_position}</span>
                                            {/if}
                                        </td>
                                        <td class="p-3 font-medium text-text-primary">
                                            {item.name}
                                            {#if item.is_quitter}
                                                <span class="ml-2 text-[10px] text-red-500 font-bold uppercase">(Desistente)</span>
                                            {/if}
                                        </td>
                                        <td class="p-3 text-text-secondary">{item.preferred_sector}</td>
                                        <td class="p-3 text-center">
                                            {#if item.is_confirmed}
                                                <span class="inline-block px-2 py-1 bg-green-500/10 text-green-500 rounded font-bold text-xs">Pago/Confirmado</span>
                                            {:else}
                                                <span class="inline-block px-2 py-1 bg-text-secondary/10 text-text-secondary rounded font-bold text-xs">Pendente</span>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                                {#if listData.length === 0}
                                    <tr>
                                        <td colspan="4" class="p-6 text-center text-text-secondary">Nenhum inscrito encontrado.</td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>
    {:else if loading}
        <div
            class="flex flex-col items-center justify-center py-20 text-text-secondary"
        >
            <div
                class="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-4"
            ></div>
            <p class="animate-pulse">Carregando acampamentos...</p>
        </div>
    {:else if campings.length === 0}
        <div
            class="text-center py-20 bg-bg-secondary border border-border-ui rounded-[3rem] shadow-xl"
        >
            <div
                class="w-16 h-16 rounded-full bg-text-primary/5 mx-auto mb-4 flex items-center justify-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-text-secondary"
                >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 9 7" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 7 15 7" />
                    <path d="M4 22h16" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
            </div>
            <p class="text-text-secondary font-bold text-sm">
                Nenhum acampamento ativo encontrado
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {#each campings as camping}
                <div
                    class="bg-bg-secondary border border-border-ui rounded-[2rem] shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
                >
                    <!-- Header do Card -->
                    <div
                        class="p-6 pb-0 flex items-start justify-between gap-4"
                    >
                        <div class="flex-1 min-w-0">
                            <h3
                                class="text-xl font-black text-text-primary truncate"
                            >
                                {camping.name}
                            </h3>
                        </div>
                    </div>

                    <!-- Info Grid -->
                    <div class="p-6 space-y-4">
                        <!-- Vagas planejadas -->
                        <div>
                            <p
                                class="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2"
                            >
                                Vagas Planejadas
                            </p>
                            <div class="grid grid-cols-3 gap-2">
                                <div
                                    class="bg-bg-primary/60 rounded-xl p-3 border border-border-ui text-center"
                                >
                                    <p class="text-lg font-black text-blue-400">
                                        {camping.planned_man_vacancies}
                                    </p>
                                    <p
                                        class="text-[10px] text-text-secondary font-bold uppercase"
                                    >
                                        Homens
                                    </p>
                                </div>
                                <div
                                    class="bg-bg-primary/60 rounded-xl p-3 border border-border-ui text-center"
                                >
                                    <p class="text-lg font-black text-pink-400">
                                        {camping.planned_woman_vacancies}
                                    </p>
                                    <p
                                        class="text-[10px] text-text-secondary font-bold uppercase"
                                    >
                                        Mulheres
                                    </p>
                                </div>
                                <div
                                    class="bg-bg-primary/60 rounded-xl p-3 border border-border-ui text-center"
                                >
                                    <p
                                        class="text-lg font-black text-purple-400"
                                    >
                                        {camping.planned_couple_vacancies}
                                    </p>
                                    <p
                                        class="text-[10px] text-text-secondary font-bold uppercase"
                                    >
                                        Casais
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Inscritos -->
                        <div class="grid grid-cols-2 gap-3">
                            <div
                                class="p-3 bg-bg-primary/40 rounded-xl border border-border-ui"
                            >
                                <p
                                    class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Inscritos Campistas
                                </p>
                                <p class="text-xl font-black text-text-primary">
                                    {camping.total_camper_subscribers}
                                </p>
                            </div>
                            <div
                                class="p-3 bg-bg-primary/40 rounded-xl border border-border-ui"
                            >
                                <p
                                    class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Inscritos Servos
                                </p>
                                <p class="text-xl font-black text-text-primary">
                                    {camping.total_servant_subscribers}
                                </p>
                            </div>
                        </div>

                        <!-- Datas de sorteio -->
                        <div class="grid grid-cols-2 gap-3">
                            <div
                                class="p-3 bg-bg-primary/40 rounded-xl border border-border-ui"
                            >
                                <p
                                    class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Sorteio Campistas
                                </p>
                                <p class="text-sm font-black text-text-primary">
                                    {formatDate(camping.raffle_camper_date)}
                                </p>
                            </div>
                            <div
                                class="p-3 bg-bg-primary/40 rounded-xl border border-border-ui"
                            >
                                <p
                                    class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                >
                                    Sorteio Servos
                                </p>
                                <p class="text-sm font-black text-text-primary">
                                    {formatDate(camping.raffle_servant_date)}
                                </p>
                            </div>
                        </div>

                        <!-- Botões de Sorteio -->
                        <div
                            class="grid grid-cols-2 gap-3 pt-2 border-t border-border-ui"
                        >
                            <!-- Botão Sortear Campistas -->
                            {#if camping.camper_raffle_done}
                                <button
                                    onclick={() => viewRaffleList(camping.activity_id, camping.name, 'Campista')}
                                    class="flex items-center justify-center gap-2 px-4 py-4 bg-brand text-white shadow-lg shadow-brand/20 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 transition-all rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer"
                                >
                                    Ver Lista
                                </button>
                            {:else}
                                <button
                                    onclick={() =>
                                        performCamperRaffle(
                                            camping.activity_id,
                                        )}
                                    disabled={!isDateReached(
                                        camping.raffle_camper_date,
                                    ) || raffleLoading === camping.activity_id}
                                    class="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                                    {isDateReached(camping.raffle_camper_date)
                                        ? 'bg-brand text-white shadow-lg shadow-brand/20 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 cursor-pointer'
                                        : 'bg-text-primary/5 text-text-secondary/40 cursor-not-allowed border border-border-ui'}"
                                >
                                    {#if raffleLoading === camping.activity_id}
                                        <div
                                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                        ></div>
                                        Sorteando...
                                    {:else}
                                        Sortear Campistas
                                    {/if}
                                </button>
                            {/if}

                            <!-- Botão Sortear Servos -->
                            {#if camping.servant_raffle_done}
                                <button
                                    onclick={() => viewRaffleList(camping.activity_id, camping.name, 'Servo')}
                                    class="flex items-center justify-center gap-2 px-4 py-4 bg-brand text-white shadow-lg shadow-brand/20 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 transition-all rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer"
                                >
                                    Ver Lista
                                </button>
                            {:else}
                                <button
                                    onclick={() =>
                                        performServantRaffle(
                                            camping.activity_id,
                                        )}
                                    disabled={!isDateReached(
                                        camping.raffle_servant_date,
                                    ) || raffleLoading === camping.activity_id}
                                    class="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                                    {isDateReached(camping.raffle_servant_date)
                                        ? 'bg-brand text-white shadow-lg shadow-brand/20 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 cursor-pointer'
                                        : 'bg-text-primary/5 text-text-secondary/40 cursor-not-allowed border border-border-ui'}"
                                >
                                    {#if raffleLoading === camping.activity_id}
                                        <div
                                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                        ></div>
                                        Sorteando...
                                    {:else}
                                        Sortear Servos
                                    {/if}
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
