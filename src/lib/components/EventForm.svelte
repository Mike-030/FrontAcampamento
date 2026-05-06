<script>
    import { onMount } from "svelte";

    let { event = null, onCancel, token, onSaveSuccess } = $props();

    // Estado do formulário
    let loading = $state(false);
    let errorMessage = $state("");
    let eventType = $state("App\\Models\\Camping"); // Padrão

    // Campos Gerais do Evento
    let formData = $state({
        name: "",
        place: "",
        year: new Date().getFullYear(),
        start_date: "",
        duration_days: 1,
        total_vacancies: 0,
        image: "",
    });

    // Campos Específicos - Festival
    let festivalData = $state({
        minimal_age: 0,
        is_paid_festival: false,
        ticket_price: 0,
        sale_start_date: "",
        payment_link: 0,
    });

    // Campos Específicos - Acampamento
    let campingData = $state({
        notice: "",
        term: "",
        camper_fee: 0,
        servant_fee: 0,
        minimal_age: 0,
        maximal_age: 99,
        raffle_man_vacancies: 0,
        raffle_woman_vacancies: 0,
        raffle_couple_vacancies: 0,
        raffle_total_vacancies: 0,
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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    onMount(() => {
        if (event) {
            // Edit Mode
            formData = {
                name: event.name,
                place: event.place,
                year: event.year,
                start_date: event.start_date
                    ? new Date(event.start_date).toISOString().slice(0, 16)
                    : "",
                duration_days: event.duration_days,
                total_vacancies: event.total_vacancies,
                image: event.image || "",
            };

            if (event.eventable_type.includes("Festival")) {
                eventType = "App\\Models\\Festival";
                if (event.eventable) {
                    festivalData = {
                        ...event.eventable,
                        sale_start_date: event.eventable.sale_start_date
                            ? new Date(event.eventable.sale_start_date)
                                  .toISOString()
                                  .slice(0, 16)
                            : "",
                    };
                }
            } else {
                eventType = "App\\Models\\Camping";
                if (event.eventable) {
                    campingData = { ...event.eventable };
                    // Format dates for inputs
                    const dateFields = [
                        "raffle_camper_subscription_start_date",
                        "raffle_camper_subscription_end_date",
                        "raffle_camper_date",
                        "raffle_servant_subscription_start_date",
                        "raffle_servant_subscription_end_date",
                        "raffle_servant_date",
                        "camper_registration_start_date",
                        "camper_registration_end_date",
                        "camper_payment_link",
                        "camper_payment_date",
                        "servant_registration_start_date",
                        "servant_registration_end_date",
                        "servant_payment_link",
                        "servant_payment_date",
                    ];
                    for (const field of dateFields) {
                        if (campingData[field]) {
                            campingData[field] = new Date(campingData[field])
                                .toISOString()
                                .slice(0, 16);
                        }
                    }
                }
            }
        }
    });

    async function handleSubmit() {
        loading = true;
        errorMessage = "";

        try {
            const isEditing = !!event;
            let eventableId = isEditing ? event.eventable_id : null;

            // 1. Salvar Eventable (Camping ou Festival)
            const eventableEndpoint =
                eventType === "App\\Models\\Camping"
                    ? "/v1/campings"
                    : "/v1/festivals";

            if (eventType === "App\\Models\\Camping") {
                const man = Number(campingData.raffle_man_vacancies || 0);
                const woman = Number(campingData.raffle_woman_vacancies || 0);
                const couple = Number(campingData.raffle_couple_vacancies || 0);
                campingData.raffle_total_vacancies = man + woman + couple * 2;
                formData.total_vacancies = campingData.raffle_total_vacancies;
            } else if (eventType === "App\\Models\\Festival") {
                festivalData.is_paid_festival = !!festivalData.is_paid_festival;
                formData.total_vacancies = 999999;
            }

            const eventablePayload =
                eventType === "App\\Models\\Camping"
                    ? campingData
                    : festivalData;

            const methodEventable = isEditing ? "PUT" : "POST";
            const urlEventable = isEditing
                ? `${API_URL}${eventableEndpoint}/${eventableId}`
                : `${API_URL}${eventableEndpoint}`;

            const resEventable = await fetch(urlEventable, {
                method: methodEventable,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(eventablePayload),
            });

            const dataEventable = await resEventable.json();
            if (!resEventable.ok) {
                throw new Error(
                    dataEventable.message ||
                        "Erro ao salvar os detalhes específicos do evento.",
                );
            }

            if (!isEditing) {
                eventableId = dataEventable.data.id;
            }

            // 2. Salvar Event
            const eventPayload = {
                ...formData,
                eventable_id: eventableId,
                eventable_type: eventType,
                start_date: formData.start_date.replace("T", " ") + ":00",
            };

            const methodEvent = isEditing ? "PUT" : "POST";
            const urlEvent = isEditing
                ? `${API_URL}/v1/events/${event.id}`
                : `${API_URL}/v1/events`;

            const resEvent = await fetch(urlEvent, {
                method: methodEvent,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(eventPayload),
            });

            if (!resEvent.ok) {
                const dataEvent = await resEvent.json();
                throw new Error(
                    dataEvent.message || "Erro ao salvar o evento geral.",
                );
            }

            onSaveSuccess();
        } catch (err) {
            errorMessage = err.message;
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div
    class="max-w-4xl mx-auto bg-bg-secondary p-8 md:p-12 rounded-[3rem] shadow-xl border border-border-ui relative"
>
    <div
        class="flex justify-start items-center gap-4 md:gap-6 mb-8 pb-6 border-b border-border-ui"
    >
        <button
            onclick={onCancel}
            class="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center bg-bg-primary/50 border border-border-ui rounded-full text-text-secondary hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm"
            aria-label="Voltar"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
            >
        </button>
        <h2 class="text-3xl font-black text-text-primary">
            {event ? "Editar Evento" : "Novo Evento"}
        </h2>
    </div>

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
            handleSubmit();
        }}
        class="space-y-12"
    >
        <!-- SECTION: GERAL -->
        <section>
            <h3
                class="text-xs font-black text-brand uppercase tracking-widest mb-6"
            >
                1. Informações Gerais
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                        >Nome do Evento *</label
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
                        >Ano *</label
                    >
                    <input
                        type="number"
                        bind:value={formData.year}
                        required
                        min="2000"
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

                <div class="md:col-span-2">
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
            </div>
        </section>

        <!-- SECTION: TIPO -->
        <section>
            <h3
                class="text-xs font-black text-brand uppercase tracking-widest mb-6"
            >
                2. Tipo de Evento
            </h3>
            <div class="flex gap-4">
                <label class="flex-1 cursor-pointer">
                    <input
                        type="radio"
                        bind:group={eventType}
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
                        bind:group={eventType}
                        value="App\Models\Festival"
                        class="hidden peer"
                        disabled={!!event}
                    />
                    <div
                        class="p-4 rounded-2xl border-2 border-border-ui bg-bg-primary text-center peer-checked:border-brand peer-checked:bg-brand/5 transition-all"
                    >
                        <span class="font-bold text-text-primary">Festival</span
                        >
                    </div>
                </label>
            </div>
        </section>

        <!-- SECTION: ESPECIFICO -->
        <section>
            <h3
                class="text-xs font-black text-brand uppercase tracking-widest mb-6"
            >
                3. Configurações Específicas
            </h3>

            {#if eventType === "App\\Models\\Festival"}
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
                            bind:value={festivalData.minimal_age}
                            required
                            min="0"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Preço do Ingresso</label
                        >
                        <input
                            type="number"
                            bind:value={festivalData.ticket_price}
                            required
                            min="0"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Início das Vendas</label
                        >
                        <input
                            type="date"
                            bind:value={festivalData.sale_start_date}
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
                            bind:value={festivalData.payment_link}
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div class="md:col-span-2 flex items-center gap-3 mt-2">
                        <input
                            type="checkbox"
                            bind:checked={festivalData.is_paid_festival}
                            class="w-5 h-5 accent-brand"
                        />
                        <label class="text-sm font-bold text-text-primary"
                            >Festival Pago</label
                        >
                    </div>
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-bg-primary/50 p-6 rounded-3xl border border-border-ui"
                >
                    <div
                        class="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"
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
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Idade Mínima</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.minimal_age}
                            required
                            min="0"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Idade Máxima</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.maximal_age}
                            required
                            min="0"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Taxa Campista (R$)</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.camper_fee}
                            required
                            step="0.01"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Taxa Servo (R$)</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.servant_fee}
                            required
                            step="0.01"
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Vagas Sorteio - Homem</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.raffle_man_vacancies}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Vagas Sorteio - Mulher</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.raffle_woman_vacancies}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-[10px] uppercase font-bold text-text-secondary mb-2"
                            >Vagas Sorteio - Casal</label
                        >
                        <input
                            type="number"
                            bind:value={campingData.raffle_couple_vacancies}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand outline-none"
                        />
                    </div>

                    <!-- Datas de Sorteio -->
                    <div
                        class="md:col-span-3 mt-4 border-t border-border-ui pt-4"
                    >
                        <p
                            class="text-[10px] font-black text-brand uppercase tracking-widest mb-4"
                        >
                            Datas do Sorteio
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Início Inscrição Campista</label
                                ><input
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
                                    >Fim Inscrição Campista</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.raffle_camper_subscription_end_date
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Data Sorteio Campista</label
                                ><input
                                    type="date"
                                    bind:value={campingData.raffle_camper_date}
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Início Inscrição Servo</label
                                ><input
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
                                    >Fim Inscrição Servo</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.raffle_servant_subscription_end_date
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Data Sorteio Servo</label
                                ><input
                                    type="date"
                                    bind:value={campingData.raffle_servant_date}
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Datas de Inscrição Direta / Pagamento -->
                    <div
                        class="md:col-span-3 mt-4 border-t border-border-ui pt-4"
                    >
                        <p
                            class="text-[10px] font-black text-brand uppercase tracking-widest mb-4"
                        >
                            Datas de Registro
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Início Registro Campista</label
                                ><input
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
                                    >Fim Registro Campista</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.camper_registration_end_date
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Link Pgto Campista (Data)</label
                                ><input
                                    type="date"
                                    bind:value={campingData.camper_payment_link}
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Data Pgto Campista</label
                                ><input
                                    type="date"
                                    bind:value={campingData.camper_payment_date}
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>

                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Início Registro Servo</label
                                ><input
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
                                    >Fim Registro Servo</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.servant_registration_end_date
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Link Pgto Servo (Data)</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.servant_payment_link
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-bold text-text-secondary mb-2"
                                    >Data Pgto Servo</label
                                ><input
                                    type="date"
                                    bind:value={
                                        campingData.servant_payment_date
                                    }
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </section>

        <div class="pt-8 border-t border-border-ui flex justify-end gap-4">
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
                {loading ? "Salvando..." : "Salvar Evento"}
            </button>
        </div>
    </form>
</div>
