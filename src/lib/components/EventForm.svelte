<script>
    import { onMount } from "svelte";
    import Modal from "./Modal.svelte";

    let { event = null, onCancel, onDelete, token, onSaveSuccess } = $props();

    // Estado do formulário
    let loading = $state(false);
    let errorMessage = $state("");
    let activityType = $state("App\\Models\\Camping");

    // Categorias carregadas da API
    /** @type {any[]} */
    let categories = $state([]);
    let loadingCategories = $state(true);

    // Campos Gerais da Activity
    let formData = $state({
        name: "",
        place: "",
        start_date: "",
        duration_days: 1,
        total_vacancies: 0,
        image: "",
        category_id: "",
    });

    // Campos Específicos - Evento (tabela events)
    // is_paid_festival é auto-preenchido: ticket_price > 0
    let eventData = $state({
        minimal_age: 0,
        ticket_price: 0,
        sale_start_date: "",
        payment_link: "",
    });

    // Campos Específicos - Acampamento (tabela campings)
    // minimal_age, maximal_age e raffle_*_vacancies são auto-preenchidos pelo backend
    let campingData = $state({
        notice: "",
        term: "",
        camper_fee: 0,
        servant_fee: 0,
        planned_man_vacancies: 0,
        planned_woman_vacancies: 0,
        planned_couple_vacancies: 0,
        raffle_camper_subscription_start_date: "",
        raffle_camper_subscription_end_date: "",
        raffle_camper_date: "",
        raffle_servant_subscription_start_date: "",
        raffle_servant_subscription_end_date: "",
        raffle_servant_date: "",
        camper_registration_start_date: "",
        camper_registration_end_date: "",
        camper_payment_link: "",
        camper_payment_date: "",
        servant_registration_start_date: "",
        servant_registration_end_date: "",
        servant_payment_link: "",
        servant_payment_date: "",
    });

    // Vagas por setor para acampamento
    /** @type {any[]} */
    let sectorVacancies = $state([]);

    // Apenas categorias de acampamento (eventos são auto-atribuídos pelo backend)
    let filteredCategories = $derived(
        categories.filter((c) => c.type === "Acampamento"),
    );

    // Indicador de evento pago (auto: ticket_price > 0)
    let isPaidEvent = $derived(Number(eventData.ticket_price) > 0);

    let isUnlimitedVacancies = $derived(Number(formData.total_vacancies) <= 0);

    let modalState = $state({
        isOpen: false,
        type: "error",
        message: "",
        onConfirm: null,
    });

    function showModal(type, message, onConfirm = null) {
        modalState = { isOpen: true, type, message, onConfirm };
    }

    function closeModal() {
        modalState.isOpen = false;
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    onMount(async () => {
        await fetchCategories();

        if (event) {
            // Edit Mode
            formData = {
                name: event.name,
                place: event.place,
                start_date: event.start_date
                    ? new Date(event.start_date).toISOString().slice(0, 10)
                    : "",
                duration_days: event.duration_days,
                total_vacancies: event.total_vacancies,
                image: event.image || "",
                category_id: event.category_id || "",
            };

            if (event.activitable_type?.includes("Event")) {
                activityType = "App\\Models\\Event";
                if (event.activitable) {
                    eventData = {
                        minimal_age: event.activitable.minimal_age || 0,
                        ticket_price: event.activitable.ticket_price || 0,
                        sale_start_date: event.activitable.sale_start_date
                            ? new Date(event.activitable.sale_start_date)
                                  .toISOString()
                                  .slice(0, 10)
                            : "",
                        payment_link: event.activitable.payment_link || "",
                    };
                }
            } else {
                activityType = "App\\Models\\Camping";
                if (event.activitable) {
                    campingData = {
                        notice: event.activitable.notice || "",
                        term: event.activitable.term || "",
                        camper_fee: event.activitable.camper_fee || 0,
                        servant_fee: event.activitable.servant_fee || 0,
                        planned_man_vacancies:
                            event.activitable.planned_man_vacancies || 0,
                        planned_woman_vacancies:
                            event.activitable.planned_woman_vacancies || 0,
                        planned_couple_vacancies:
                            event.activitable.planned_couple_vacancies || 0,
                        raffle_camper_subscription_start_date: "",
                        raffle_camper_subscription_end_date: "",
                        raffle_camper_date: "",
                        raffle_servant_subscription_start_date: "",
                        raffle_servant_subscription_end_date: "",
                        raffle_servant_date: "",
                        camper_registration_start_date: "",
                        camper_registration_end_date: "",
                        camper_payment_link:
                            event.activitable.camper_payment_link || "",
                        camper_payment_date: "",
                        servant_registration_start_date: "",
                        servant_registration_end_date: "",
                        servant_payment_link:
                            event.activitable.servant_payment_link || "",
                        servant_payment_date: "",
                    };
                    /** @type {(keyof typeof campingData)[]} */
                    const dateFields = [
                        "raffle_camper_subscription_start_date",
                        "raffle_camper_subscription_end_date",
                        "raffle_camper_date",
                        "raffle_servant_subscription_start_date",
                        "raffle_servant_subscription_end_date",
                        "raffle_servant_date",
                        "camper_registration_start_date",
                        "camper_registration_end_date",
                        "camper_payment_date",
                        "servant_registration_start_date",
                        "servant_registration_end_date",
                        "servant_payment_date",
                    ];
                    for (const field of dateFields) {
                        if (event.activitable[field]) {
                            // @ts-ignore
                            campingData[field] = new Date(
                                event.activitable[field],
                            )
                                .toISOString()
                                .slice(0, 10);
                        }
                    }
                }
            }
        }
    });

    async function fetchCategories() {
        try {
            loadingCategories = true;
            const response = await fetch(`${API_URL}/v1/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                categories = data.data || data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar categorias:", err);
        } finally {
            loadingCategories = false;
        }
    }

    $effect(() => {
        if (activityType === "App\\Models\\Camping" && formData.category_id) {
            fetchSectors(formData.category_id);
        }
    });

    /** @param {string|number} categoryId */
    async function fetchSectors(categoryId) {
        try {
            const res = await fetch(`${API_URL}/v1/categories/${categoryId}/sectors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                sectorVacancies = data.data || [];
            }
        } catch (error) {
            console.error("Erro ao buscar setores da categoria", error);
        }
    }

    async function handleSubmit() {
        loading = true;
        errorMessage = "";

        try {
            const isEditing = !!event;

            if (activityType === "App\\Models\\Camping") {
                // Total de vagas = soma das vagas planejadas
                const man = Number(campingData.planned_man_vacancies || 0);
                const woman = Number(campingData.planned_woman_vacancies || 0);
                const couple = Number(
                    campingData.planned_couple_vacancies || 0,
                );
                formData.total_vacancies = man + woman + couple * 2;
            } else if (activityType === "App\\Models\\Event") {
                // Se total_vacancies <= 0, vagas ilimitadas (0)
                if (Number(formData.total_vacancies) <= 0) {
                    formData.total_vacancies = 0;
                }
            }

            const activitableData =
                activityType === "App\\Models\\Camping"
                    ? campingData
                    : eventData;

            const payload = {
                ...formData,
                activitable_type: activityType,
                activitable_data: activitableData,
                start_date: formData.start_date.includes("T")
                    ? formData.start_date.replace("T", " ") + ":00"
                    : formData.start_date + " 00:00:00",
            };

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${API_URL}/v1/activities/${event.id}`
                : `${API_URL}/v1/activities`;

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Erro ao salvar a atividade.");
            }

            // Save sector vacancies if camping
            if (activityType === "App\\Models\\Camping" && sectorVacancies.length > 0) {
                await Promise.all(sectorVacancies.map(sv => 
                    fetch(`${API_URL}/v1/categories/${formData.category_id}/sectors/${sv.sector_id}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            base_vacancies: sv.base_vacancies,
                            raffle_vacancies: sv.base_vacancies
                        })
                    })
                ));
            }

            onSaveSuccess();
        } catch (err) {
            const error = /** @type {Error} */ (err);
            errorMessage = error.message || String(err);
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div>
    <h2 class="text-3xl font-black mb-6">
        {event ? "Editar Atividade" : "Adicionar Atividade"}
    </h2>

    <div
        class="bg-bg-secondary p-8 rounded-[3rem] shadow-xl border border-border-ui relative"
    >
        {#if errorMessage}
            <div
                class="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold"
            >
                {errorMessage}
            </div>
        {/if}

        <form
            onsubmit={(e) => {
                e.preventDefault();
                if (event) {
                    showModal("confirm", "Tem certeza que deseja salvar as alterações nesta atividade?", async () => {
                        closeModal();
                        await handleSubmit();
                    });
                } else {
                    handleSubmit();
                }
            }}
            class="space-y-12"
        >
            <!-- SECTION 1: TIPO -->
            <section>
                <h3
                    class="text-l font-black text-brand uppercase tracking-widest mb-6"
                >
                    1. Tipo de Atividade
                </h3>
                <div class="flex gap-4">
                    <label class="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            bind:group={activityType}
                            value="App\Models\Camping"
                            class="hidden peer"
                            disabled={!!event}
                        />
                        <div
                            class="p-4 rounded-2xl border-2 border-border-ui bg-bg-primary text-center peer-checked:border-brand peer-checked:bg-brand/5 transition-all"
                        >
                            <span class="font-bold text-text-primary"
                                >Acampamento</span
                            >
                        </div>
                    </label>
                    <label class="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            bind:group={activityType}
                            value="App\Models\Event"
                            class="hidden peer"
                            disabled={!!event}
                        />
                        <div
                            class="p-4 rounded-2xl border-2 border-border-ui bg-bg-primary text-center peer-checked:border-brand peer-checked:bg-brand/5 transition-all"
                        >
                            <span class="font-bold text-text-primary"
                                >Evento</span
                            >
                        </div>
                    </label>
                </div>
            </section>

            <!-- SECTION 2: GERAL -->
            <section>
                <h3
                    class="text-l font-black text-brand uppercase tracking-widest mb-6"
                >
                    2. Informações Gerais
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Nome da Atividade *</label
                        >
                        <input
                            type="text"
                            bind:value={formData.name}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Local *</label
                        >
                        <input
                            type="text"
                            bind:value={formData.place}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Data de Início *</label
                        >
                        <input
                            type="date"
                            bind:value={formData.start_date}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Duração (Dias) *</label
                        >
                        <input
                            type="number"
                            bind:value={formData.duration_days}
                            required
                            min="1"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >URL da Imagem</label
                        >
                        <input
                            type="text"
                            bind:value={formData.image}
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                            placeholder="Link ou path da Imagem"
                        />
                    </div>

                    {#if activityType === "App\\Models\\Camping"}
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Categoria *</label
                            >
                            {#if loadingCategories}
                                <div
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-secondary animate-pulse"
                                >
                                    Carregando categorias...
                                </div>
                            {:else}
                                <select
                                    bind:value={formData.category_id}
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                                >
                                    <option value="" disabled
                                        >Selecione uma categoria</option
                                    >
                                    {#each filteredCategories as cat}
                                        <option value={cat.id}
                                            >{cat.name}</option
                                        >
                                    {/each}
                                </select>
                            {/if}
                        </div>
                    {/if}
                </div>
            </section>

            <!-- SECTION 3: ESPECIFICO -->
            <section>
                <h3
                    class="text-l font-black text-brand uppercase tracking-widest mb-6"
                >
                    3. Configurações Específicas
                </h3>

                {#if activityType === "App\\Models\\Event"}
                    <!-- ═══ EVENTO ═══ -->
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-primary/50 p-6 rounded-3xl border border-border-ui"
                    >
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Idade Mínima</label
                            >
                            <input
                                type="number"
                                bind:value={eventData.minimal_age}
                                required
                                min="0"
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                            />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Preço do Ingresso (R$)</label
                            >
                            <input
                                type="number"
                                bind:value={eventData.ticket_price}
                                required
                                min="0"
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                            />
                            {#if isPaidEvent}
                                <span
                                    class="text-[10px] text-brand font-bold mt-1 block"
                                    >Evento Pago</span
                                >
                            {:else}
                                <span
                                    class="text-[10px] text-green-500 font-bold mt-1 block"
                                    >Evento Gratuito</span
                                >
                            {/if}
                        </div>
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Início das Vendas</label
                            >
                            <input
                                type="date"
                                bind:value={eventData.sale_start_date}
                                required
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                            />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Link de Pagamento</label
                            >
                            <input
                                type="text"
                                bind:value={eventData.payment_link}
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                            />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                >Total de Vagas</label
                            >
                            <input
                                type="number"
                                bind:value={formData.total_vacancies}
                                min="0"
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                            />
                            {#if isUnlimitedVacancies}
                                <span
                                    class="text-[10px] text-text-secondary font-bold mt-1 block"
                                    >0 = Vagas ilimitadas</span
                                >
                            {/if}
                        </div>
                    </div>
                {:else}
                    <!-- ═══ ACAMPAMENTO ═══ -->
                    <div
                        class="bg-bg-primary/50 p-6 rounded-3xl border border-border-ui space-y-8"
                    >
                        <!-- GERAL (Links e Vagas) -->
                        <div>
                            <p
                                class="text-[10px] font-black text-brand uppercase tracking-widest mb-4"
                            >
                                Geral
                            </p>
                            <div
                                class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                            >
                                <div>
                                    <label
                                        class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                        >Link do Edital</label
                                    >
                                    <input
                                        type="text"
                                        bind:value={campingData.notice}
                                        class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                    />
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                        >Link dos Termos</label
                                    >
                                    <input
                                        type="text"
                                        bind:value={campingData.term}
                                        class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <p
                                    class="block text-[10px] font-bold text-text-secondary mb-2 uppercase tracking-widest"
                                >
                                    Vagas Planejadas
                                </p>
                                <div
                                    class="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-text-secondary mb-2"
                                            >Homem</label
                                        >
                                        <input
                                            type="number"
                                            bind:value={
                                                campingData.planned_man_vacancies
                                            }
                                            required
                                            min="0"
                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-text-secondary mb-2"
                                            >Mulher</label
                                        >
                                        <input
                                            type="number"
                                            bind:value={
                                                campingData.planned_woman_vacancies
                                            }
                                            required
                                            min="0"
                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            class="block text-[10px] font-bold text-text-secondary mb-2"
                                            >Casal</label
                                        >
                                        <input
                                            type="number"
                                            bind:value={
                                                campingData.planned_couple_vacancies
                                            }
                                            required
                                            min="0"
                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                        />
                                    </div>
                                </div>
                                <p
                                    class="text-[10px] text-text-secondary font-bold mt-2"
                                >
                                    As vagas de sorteio serão preenchidas
                                    automaticamente com os mesmos valores.
                                </p>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-1 xl:grid-cols-2 gap-8 border-t border-border-ui pt-8"
                        >
                            <!-- ÁREA DO CAMPISTA -->
                            <div
                                class="bg-bg-secondary p-6 rounded-2xl border border-border-ui"
                            >
                                <p
                                    class="text-xs font-black text-brand uppercase tracking-widest mb-6"
                                >
                                    Campistas
                                </p>
                                <div class="space-y-4">
                                    <div>
                                        <label
                                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                            >Taxa de Inscrição (R$)</label
                                        >
                                        <input
                                            type="number"
                                            bind:value={campingData.camper_fee}
                                            required
                                            step="0.01"
                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                        />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Início Inscrição (Sorteio)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_camper_subscription_start_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Fim Inscrição (Sorteio)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_camper_subscription_end_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Data do Sorteio</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_camper_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        class="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-border-ui"
                                    >
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Início Registro (Geral)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.camper_registration_start_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Fim Registro (Geral)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.camper_registration_end_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Link de Pagamento</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={
                                                    campingData.camper_payment_link
                                                }
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Data Limite de Pgto</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.camper_payment_date
                                                }
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- ÁREA DO SERVO -->
                            <div
                                class="bg-bg-secondary p-6 rounded-2xl border border-border-ui"
                            >
                                <p
                                    class="text-xs font-black text-brand uppercase tracking-widest mb-6"
                                >
                                    Servos
                                </p>
                                <div class="space-y-4">
                                    <div>
                                        <label
                                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                                            >Taxa de Inscrição (R$)</label
                                        >
                                        <input
                                            type="number"
                                            bind:value={campingData.servant_fee}
                                            required
                                            step="0.01"
                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                        />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Início Inscrição (Sorteio)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_servant_subscription_start_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Fim Inscrição (Sorteio)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_servant_subscription_end_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Data do Sorteio</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.raffle_servant_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        class="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-border-ui"
                                    >
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Início Registro (Geral)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.servant_registration_start_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Fim Registro (Geral)</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.servant_registration_end_date
                                                }
                                                required
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Link de Pagamento</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={
                                                    campingData.servant_payment_link
                                                }
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                        <div class="col-span-2">
                                            <label
                                                class="block text-[10px] font-bold text-text-secondary mb-2"
                                                >Data Limite de Pgto</label
                                            >
                                            <input
                                                type="date"
                                                bind:value={
                                                    campingData.servant_payment_date
                                                }
                                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                            />
                                        </div>
                                    </div>

                                    {#if sectorVacancies.length > 0}
                                        <div class="pt-4 mt-2 border-t border-border-ui">
                                            <p class="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Vagas por Setor</p>
                                            <div class="grid grid-cols-2 gap-4">
                                                {#each sectorVacancies as sv}
                                                    <div>
                                                        <label class="block text-[10px] font-bold text-text-secondary mb-2">{sv.name}</label>
                                                        <input
                                                            type="number"
                                                            bind:value={sv.base_vacancies}
                                                            min="0"
                                                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                                                        />
                                                    </div>
                                                {/each}
                                            </div>
                                            <p class="text-[10px] text-text-secondary mt-2">O número de vagas preenchido no sorteio usará esses mesmos valores.</p>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </section>

            <!-- BOTÕES -->
            <div
                class="pt-8 border-t border-border-ui flex justify-between items-center gap-4"
            >
                <div>
                    {#if event}
                        <button
                            type="button"
                            onclick={onDelete}
                            class="px-6 py-4 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all"
                        >
                            Excluir Atividade
                        </button>
                    {/if}
                </div>
                <div class="flex gap-4">
                    <button
                        type="button"
                        onclick={onCancel}
                        class="px-6 py-4 rounded-xl text-sm font-bold text-text-secondary hover:bg-bg-primary border border-border-ui transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        class="px-8 py-4 bg-brand text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-brand/20 transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading ? "Salvando..." : "Salvar Atividade"}
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<Modal {modalState} {closeModal} />
