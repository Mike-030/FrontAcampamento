<script>
    let { event, onSubscribe, onBack, showModal = null } = $props();

    let endDate = $derived.by(() => {
        let date = event.start_date ? new Date(event.start_date) : null;
        if (date && event.duration_days) {
            date.setDate(date.getDate() + event.duration_days);
        }
        return date;
    });

    // Calcula o valor com base no tipo de atividade (Acampamento ou Evento)
    let eventFee = $derived(
        event.activitable?.camper_fee || event.activitable?.ticket_price || 0,
    );

    let isCamping = $derived(event.activitable_type === "App\\Models\\Camping");

    let subscriptionTypeText = $derived.by(() => {
        let text = "Inscrições Abertas";
        if (isCamping && event.activitable) {
            const now = new Date();
            const camperStart = event.activitable.camper_registration_start_date
                ? new Date(event.activitable.camper_registration_start_date)
                : null;
            const camperEnd = event.activitable.camper_registration_end_date
                ? new Date(event.activitable.camper_registration_end_date)
                : null;

            const servantStart = event.activitable
                .servant_registration_start_date
                ? new Date(event.activitable.servant_registration_start_date)
                : null;
            const servantEnd = event.activitable.servant_registration_end_date
                ? new Date(event.activitable.servant_registration_end_date)
                : null;

            if (
                camperStart &&
                camperEnd &&
                now >= camperStart &&
                now <= camperEnd
            ) {
                text = "Inscrições Abertas - Campista";
            } else if (
                servantStart &&
                servantEnd &&
                now >= servantStart &&
                now <= servantEnd
            ) {
                text = "Inscrições Abertas - Servo";
            }
        }
        return text;
    });

    let isServo = $derived(subscriptionTypeText.includes("Servo"));
    let sector1 = $state("");

    let isCoupleSubscription = $state(false);
    let spouseCpf = $state("");

    // Formatar CPF enquanto digita
    function handleCpfInput(e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            spouseCpf = value;
        }
    }

    let showCoupleCpf = $derived(
        event.category?.name === "Acampamento Casais" || 
        (event.category?.name === "Acampamento Sênior" && isCoupleSubscription)
    );

    function handleSubscribeClick() {
        if (showCoupleCpf && spouseCpf.replace(/\D/g, "").length !== 11) {
            if (showModal) {
                showModal("error", "Por favor, preencha o CPF do cônjuge corretamente.");
            } else {
                alert("Por favor, preencha o CPF do cônjuge corretamente.");
            }
            return;
        }

        onSubscribe(
            event.id,
            isServo ? "Servo" : "Campista",
            sector1 === "none" ? null : sector1,
            null,
            eventFee,
            showCoupleCpf ? spouseCpf : null
        );
    }
</script>

<div class="flex flex-col gap-6">
    <button
        onclick={onBack}
        class="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-bold text-sm uppercase tracking-wider"
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
            stroke-linejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
        Voltar para lista
    </button>
    <div
        class="bg-bg-secondary border border-border-ui p-8 rounded-[3rem] shadow-xl relative overflow-hidden"
    >
        <div
            class="absolute bottom-0 left-0 w-32 h-32 bg-text-primary/5 rounded-tr-full pointer-events-none"
        ></div>

        <div
            class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-border-ui pb-8"
        >
            <div class="flex flex-row items-center gap-4 md:gap-6 flex-1">
                <div class="flex flex-col gap-2 flex-1">
                    <h2
                        class="text-3xl font-black text-text-primary leading-tight"
                    >
                        {event.name}
                    </h2>
                    {#if event.category}
                        <span class="text-xs font-bold text-text-secondary"
                            >{event.category.name}</span
                        >
                    {/if}
                </div>
                <div class="flex flex-col items-end gap-2">
                    <div
                        class="px-6 py-3 bg-brand/10 border border-brand/20 text-brand rounded-2xl"
                    >
                        <span
                            class="text-[10px] md:text-xs font-black uppercase tracking-widest text-center block"
                            >{subscriptionTypeText}</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 relative z-10">
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Lista de Detalhes -->
                <ul class="flex-1 space-y-4">
                    <li
                        class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                    >
                        <span
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                            >Local</span
                        >
                        <span
                            class="text-text-primary font-black text-sm md:text-base text-right max-w-[60%] leading-tight"
                            >{event.place || "Não informado"}</span
                        >
                    </li>
                    <li
                        class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                    >
                        <span
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                            >Início</span
                        >
                        <span
                            class="text-text-primary font-black text-sm md:text-base"
                            >{event.start_date
                                ? new Date(event.start_date).toLocaleDateString(
                                      "pt-BR",
                                  )
                                : "Não definida"}</span
                        >
                    </li>
                    <li
                        class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                    >
                        <span
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                            >Término</span
                        >
                        <span
                            class="text-text-primary font-black text-sm md:text-base"
                            >{endDate
                                ? endDate.toLocaleDateString("pt-BR")
                                : "Não definida"}</span
                        >
                    </li>
                    {#if !isCamping}
                        <li
                            class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                        >
                            <span
                                class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                                >Vagas</span
                            >
                            <span
                                class="text-text-primary font-black text-sm md:text-base"
                                >{event.total_vacancies || "Ilimitadas"}</span
                            >
                        </li>
                    {/if}
                    <li
                        class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                    >
                        <span
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                            >Valor</span
                        >
                        <span class="text-brand font-black text-lg md:text-xl"
                            >{eventFee > 0
                                ? `R$ ${parseFloat(eventFee).toFixed(2).replace(".", ",")}`
                                : "Gratuito"}</span
                        >
                    </li>
                    {#if isCamping && event.activitable}
                        <li
                            class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                        >
                            <span
                                class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                                >Idade</span
                            >
                            <span
                                class="text-text-primary font-black text-sm md:text-base"
                                >{event.activitable.minimal_age} - {event
                                    .activitable.maximal_age} anos</span
                            >
                        </li>
                    {/if}
                    {#if !isCamping && event.activitable?.minimal_age}
                        <li
                            class="flex justify-between items-center p-5 bg-bg-primary/50 rounded-2xl border border-border-ui"
                        >
                            <span
                                class="text-[10px] text-text-secondary uppercase tracking-widest font-bold"
                                >Idade Mínima</span
                            >
                            <span
                                class="text-text-primary font-black text-sm md:text-base"
                                >{event.activitable.minimal_age} anos</span
                            >
                        </li>
                    {/if}
                </ul>

                <!-- Caixa da Imagem -->
                {#if event.image}
                    <div class="w-full md:w-2/5 flex-shrink-0">
                        <div
                            class="w-full h-full min-h-[240px] rounded-3xl overflow-hidden border border-border-ui shadow-lg"
                        >
                            <img
                                src={event.image}
                                alt={event.name}
                                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                {:else}
                    <div class="w-full md:w-2/5 flex-shrink-0">
                        <div
                            class="w-full h-full min-h-[240px] bg-bg-primary/30 rounded-3xl flex items-center justify-center border border-border-ui border-dashed"
                        >
                            <span
                                class="text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-50"
                                >Sem Imagem</span
                            >
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Setores (apenas para servos) -->
            {#if isServo && event.category?.sectors && event.category.sectors.length > 0}
                <div class="pt-8 border-t border-border-ui space-y-4">
                    <h3
                        class="text-sm font-bold uppercase tracking-wider text-text-secondary"
                    >
                        Preferência de Setor
                    </h3>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <label
                                for="sector1"
                                class="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider"
                                >Opção de Setor <span class="text-brand">*</span
                                ></label
                            >
                            <select
                                id="sector1"
                                bind:value={sector1}
                                required
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                            >
                                <option value="">Selecione...</option>
                                <option value="none"
                                    >Sem setor de preferência</option
                                >
                                {#each event.category.sectors as sector}
                                    <option value={sector.id}
                                        >{sector.name}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Inscrição como Casal -->
            {#if event.category?.name === "Acampamento Sênior" || event.category?.name === "Acampamento Casais"}
                <div class="pt-8 border-t border-border-ui space-y-4">
                    {#if event.category?.name === "Acampamento Sênior"}
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={isCoupleSubscription}
                                class="w-5 h-5 rounded border-border-ui text-brand focus:ring-brand"
                            />
                            <span class="text-sm font-bold text-text-primary uppercase tracking-wider">
                                Inscrição como casal
                            </span>
                        </label>
                    {/if}

                    {#if showCoupleCpf}
                        <div class="mt-4">
                            <h3 class="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">
                                Dados do Cônjuge
                            </h3>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex-1">
                                    <label
                                        for="spouseCpf"
                                        class="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider"
                                        >CPF do Cônjuge <span class="text-brand">*</span></label
                                    >
                                    <input
                                        id="spouseCpf"
                                        type="text"
                                        placeholder="000.000.000-00"
                                        bind:value={spouseCpf}
                                        oninput={handleCpfInput}
                                        maxlength="14"
                                        required
                                        class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            <!-- Botões Inferiores -->
            <div
                class="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-border-ui"
            >
                <div class="flex flex-row flex-wrap gap-4 w-full md:w-auto">
                    {#if event.activitable?.notice}
                        <a
                            href={event.activitable.notice}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 md:flex-none text-center px-6 py-4 bg-bg-primary border border-border-ui text-text-primary rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all shadow-sm"
                        >
                            Edital
                        </a>
                    {/if}
                    {#if event.activitable?.term}
                        <a
                            href={event.activitable.term}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 md:flex-none text-center px-6 py-4 bg-bg-primary border border-border-ui text-text-primary rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all shadow-sm"
                        >
                            Termos
                        </a>
                    {/if}
                </div>

                <button
                    onclick={handleSubscribeClick}
                    disabled={isServo && !sector1}
                    class="w-full md:w-auto px-10 py-5 bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:-translate-y-1 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100"
                >
                    Se Inscrever
                </button>
            </div>
        </div>
    </div>
</div>
