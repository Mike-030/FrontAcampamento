<script>
    /**
     * Carrossel de Carrosséis por Período (Passados -> Atuais -> Futuros -> Passados)
     *
     * @type {{
     *   id?: string,
     *   title: string,
     *   subtitle?: string,
     *   itemLabelPlural: string,
     *   pastItems?: any[],
     *   currentItems?: any[],
     *   futureItems?: any[],
     *   loading?: boolean,
     *   autoPlayMs?: number,
     *   accentVariant?: 'camping' | 'event'
     * }}
     */
    let {
        id = "",
        title = "Acampamentos",
        subtitle = "",
        itemLabelPlural = "Acampamentos",
        pastItems = [],
        currentItems = [],
        futureItems = [],
        loading = false,
        autoPlayMs = 4500,
        accentVariant = "camping",
    } = $props();

    // Monta os períodos disponíveis na ordem exata: Passados (máx 3) -> Atuais (todos) -> Futuros (todos)
    let periods = $derived.by(() => {
        /** @type {{ key: 'past' | 'current' | 'future', label: string, shortLabel: string, badge: string, items: any[] }[]} */
        const list = [];

        if (pastItems.length > 0) {
            list.push({
                key: "past",
                label: `${itemLabelPlural} Passados`,
                shortLabel: "Passados",
                badge: "Realizados",
                items: pastItems.slice(0, 3),
            });
        }

        if (currentItems.length > 0) {
            list.push({
                key: "current",
                label: `${itemLabelPlural} Atuais`,
                shortLabel: "Atuais",
                badge: "Acontecendo Agora",
                items: currentItems,
            });
        }

        if (futureItems.length > 0) {
            list.push({
                key: "future",
                label: `${itemLabelPlural} Futuros`,
                shortLabel: "Futuros",
                badge: "Em Breve",
                items: futureItems,
            });
        }

        return list;
    });

    let totalCardsCount = $derived(
        periods.reduce((acc, p) => acc + p.items.length, 0),
    );

    // Índice do carrossel externo (qual período está ativo)
    let activePeriodIndex = $state(0);

    // Índice do card ativo dentro de cada período (evita pulo visual ao trocar de período)
    /** @type {Record<string, number>} */
    let cardIndexByPeriod = $state({
        past: 0,
        current: 0,
        future: 0,
    });

    // Controle de pausa e reset do timer automático
    let isHovered = $state(false);
    let isManuallyPaused = $state(false);
    let isPaused = $derived(isHovered || isManuallyPaused);
    let timerVersion = $state(0);

    // Registro de imagens com erro de carregamento para aplicar fallback
    /** @type {Record<string, boolean>} */
    let failedImages = $state({});

    // Garante índices válidos quando os dados carregam ou mudam
    $effect(() => {
        if (periods.length === 0) {
            activePeriodIndex = 0;
            return;
        }
        if (activePeriodIndex >= periods.length) {
            activePeriodIndex = 0;
        }
        for (const period of periods) {
            const currentIdx = cardIndexByPeriod[period.key] ?? 0;
            if (currentIdx >= period.items.length) {
                cardIndexByPeriod[period.key] = 0;
            }
        }
    });

    let activePeriod = $derived(periods[activePeriodIndex] ?? null);
    let activeCardIndex = $derived(
        activePeriod ? (cardIndexByPeriod[activePeriod.key] ?? 0) : 0,
    );

    // Avança para o próximo card; ao terminar o período, segue para o próximo carrossel
    function nextCard(resetTimer = true) {
        if (periods.length === 0) return;

        const currentPeriod = periods[activePeriodIndex];
        const currentIdx = cardIndexByPeriod[currentPeriod.key] ?? 0;

        if (currentIdx < currentPeriod.items.length - 1) {
            cardIndexByPeriod[currentPeriod.key] = currentIdx + 1;
        } else {
            const nextPeriodIdx = (activePeriodIndex + 1) % periods.length;
            const nextPeriod = periods[nextPeriodIdx];
            cardIndexByPeriod[nextPeriod.key] = 0;
            activePeriodIndex = nextPeriodIdx;
        }

        if (resetTimer) {
            timerVersion += 1;
        }
    }

    // Volta para o card anterior; no primeiro card do período, volta ao último card do período anterior
    function prevCard(resetTimer = true) {
        if (periods.length === 0) return;

        const currentPeriod = periods[activePeriodIndex];
        const currentIdx = cardIndexByPeriod[currentPeriod.key] ?? 0;

        if (currentIdx > 0) {
            cardIndexByPeriod[currentPeriod.key] = currentIdx - 1;
        } else {
            const prevPeriodIdx =
                (activePeriodIndex - 1 + periods.length) % periods.length;
            const prevPeriod = periods[prevPeriodIdx];
            cardIndexByPeriod[prevPeriod.key] = Math.max(
                0,
                prevPeriod.items.length - 1,
            );
            activePeriodIndex = prevPeriodIdx;
        }

        if (resetTimer) {
            timerVersion += 1;
        }
    }

    /** @param {number} periodIdx */
    function selectPeriod(periodIdx) {
        if (periodIdx < 0 || periodIdx >= periods.length) return;
        const targetPeriod = periods[periodIdx];
        cardIndexByPeriod[targetPeriod.key] = 0;
        activePeriodIndex = periodIdx;
        timerVersion += 1;
    }

    /** @param {number} cardIdx */
    function selectCard(cardIdx) {
        if (!activePeriod) return;
        if (cardIdx < 0 || cardIdx >= activePeriod.items.length) return;
        cardIndexByPeriod[activePeriod.key] = cardIdx;
        timerVersion += 1;
    }

    // Avanço automático dos cards e carrosséis
    $effect(() => {
        // Dependência explícita de timerVersion para reiniciar a contagem após clique manual
        const _version = timerVersion;
        if (isPaused || totalCardsCount <= 1 || loading) return;

        const intervalId = setInterval(() => {
            nextCard(false);
        }, autoPlayMs);

        return () => clearInterval(intervalId);
    });

    /**
     * Retorna a URL válida da imagem ou vazio caso o acampamento/evento não possua imagem
     * @param {any} item
     */
    function resolveImage(item) {
        const key = String(item?.id ?? item?.name ?? "");
        const raw = typeof item?.image === "string" ? item.image.trim() : "";

        if (
            !failedImages[key] &&
            raw &&
            (raw.startsWith("http://") ||
                raw.startsWith("https://") ||
                raw.startsWith("/") ||
                raw.startsWith("data:image/"))
        ) {
            return raw;
        }

        return "";
    }

    /** @param {any} item */
    function handleImageError(item) {
        const key = String(item?.id ?? item?.name ?? "");
        if (!failedImages[key]) {
            failedImages = { ...failedImages, [key]: true };
        }
    }

    /**
     * Formata o intervalo de datas de uma atividade em pt-BR
     * @param {string} startDateStr
     * @param {number} durationDays
     */
    function formatDateRange(startDateStr, durationDays = 1) {
        if (!startDateStr) return "";
        const datePart = String(startDateStr).slice(0, 10);
        const [y, m, d] = datePart.split("-").map(Number);
        if (!y || !m || !d) return "";

        const start = new Date(y, m - 1, d);
        const days = Math.max(1, Number(durationDays) || 1);
        const end = new Date(y, m - 1, d + days - 1);

        const opts = /** @type {Intl.DateTimeFormatOptions} */ ({
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        if (days <= 1) {
            return start.toLocaleDateString("pt-BR", opts);
        }

        const startShort = start.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
        });
        const endFull = end.toLocaleDateString("pt-BR", opts);
        return `${startShort} – ${endFull}`;
    }

    /** @param {'past' | 'current' | 'future'} key */
    function getPeriodBadgeStyle(key) {
        if (key === "current") {
            return "bg-emerald-500/90 text-white border-emerald-400/50";
        }
        if (key === "future") {
            return "bg-brand/95 text-white border-brand/60";
        }
        return "bg-black/65 text-white/90 border-white/20";
    }
</script>

<section {id} class="w-full">
    <!-- Cabeçalho da Seção + Abas de Período -->
    <div
        class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6"
    >
        <div>
            <div class="flex items-center gap-3 mb-2">
                <span
                    class="inline-block w-8 h-1 rounded-full bg-brand"
                ></span>
                <span
                    class="text-[11px] font-black uppercase tracking-[0.22em] text-brand"
                >
                    {accentVariant === "camping" ? "Vivências" : "Programação"}
                </span>
            </div>
            <h2
                class="text-3xl sm:text-4xl font-black text-text-primary tracking-tight"
            >
                {title}
            </h2>
            {#if subtitle}
                <p class="text-sm sm:text-base text-text-secondary mt-1.5">
                    {subtitle}
                </p>
            {/if}
        </div>

        <!-- Seletor de Períodos (Indicador do Carrossel Externo) -->
        {#if !loading && periods.length > 0}
            <div
                class="flex flex-wrap items-center gap-2 bg-bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl border border-border-ui self-start lg:self-auto"
                role="tablist"
                aria-label="Períodos de {title}"
            >
                {#each periods as period, pIdx}
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activePeriodIndex === pIdx}
                        onclick={() => selectPeriod(pIdx)}
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                               {activePeriodIndex === pIdx
                            ? 'bg-brand text-white shadow-lg shadow-brand/25'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/60'}"
                    >
                        {#if period.key === "current"}
                            <span
                                class="w-2 h-2 rounded-full {activePeriodIndex ===
                                pIdx
                                    ? 'bg-white'
                                    : 'bg-emerald-500'} animate-pulse"
                            ></span>
                        {/if}
                        <span>{period.shortLabel}</span>
                        <span
                            class="px-1.5 py-0.5 rounded-md text-[10px] font-black
                                   {activePeriodIndex === pIdx
                                ? 'bg-white/20 text-white'
                                : 'bg-bg-primary text-text-secondary'}"
                        >
                            {period.items.length}
                        </span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Corpo do Carrossel de Carrosséis -->
    {#if loading}
        <div
            class="w-full h-[380px] sm:h-[440px] rounded-[2.5rem] bg-bg-secondary/70 border border-border-ui flex flex-col items-center justify-center gap-4 animate-pulse"
        >
            <div
                class="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin"
            ></div>
            <p
                class="text-xs font-bold uppercase tracking-widest text-text-secondary"
            >
                Carregando {itemLabelPlural.toLowerCase()}...
            </p>
        </div>
    {:else if periods.length === 0}
        <div
            class="w-full py-20 px-6 rounded-[2.5rem] bg-bg-secondary/50 border-2 border-dashed border-border-ui text-center"
        >
            <p
                class="text-sm font-black uppercase tracking-widest text-text-secondary mb-2"
            >
                Nenhum {accentVariant === "camping" ? "acampamento" : "evento"} cadastrado
                no momento
            </p>
            <p class="text-xs text-text-secondary/70">
                Em breve novas datas e programações estarão disponíveis por aqui.
            </p>
        </div>
    {:else}
        <!-- Container Interativo (pausa auto-play ao passar o mouse) -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            onmouseenter={() => (isHovered = true)}
            onmouseleave={() => (isHovered = false)}
            class="relative bg-bg-secondary/75 backdrop-blur-md border border-border-ui rounded-[2.5rem] p-4 sm:p-6 shadow-2xl overflow-hidden"
        >
            <!-- Barra de Status do Período Ativo -->
            {#if activePeriod}
                <div
                    class="flex flex-wrap items-center justify-between gap-3 mb-4 px-1"
                >
                    <div class="flex items-center gap-3">
                        <span
                            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border {getPeriodBadgeStyle(
                                activePeriod.key,
                            )}"
                        >
                            {#if activePeriod.key === "current"}
                                <span
                                    class="w-1.5 h-1.5 rounded-full bg-white animate-ping"
                                ></span>
                            {/if}
                            {activePeriod.badge}
                        </span>
                        <h3
                            class="text-base sm:text-lg font-black text-text-primary"
                        >
                            {activePeriod.label}
                        </h3>
                    </div>

                    <div class="flex items-center gap-3">
                        <span
                            class="text-xs font-bold text-text-secondary tabular-nums"
                        >
                            Card {activeCardIndex + 1} de {activePeriod.items
                                .length}
                        </span>

                        {#if totalCardsCount > 1}
                            <button
                                type="button"
                                onclick={() =>
                                    (isManuallyPaused = !isManuallyPaused)}
                                aria-label={isManuallyPaused
                                    ? "Retomar reprodução automática"
                                    : "Pausar reprodução automática"}
                                title={isManuallyPaused
                                    ? "Retomar rotação automática"
                                    : "Pausar rotação automática"}
                                class="w-8 h-8 rounded-xl bg-bg-primary/80 border border-border-ui text-text-secondary hover:text-brand hover:border-brand flex items-center justify-center transition-all cursor-pointer"
                            >
                                {#if isManuallyPaused}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <polygon points="6 4 20 12 6 20 6 4" />
                                    </svg>
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <rect
                                            x="6"
                                            y="4"
                                            width="4"
                                            height="16"
                                            rx="1"
                                        />
                                        <rect
                                            x="14"
                                            y="4"
                                            width="4"
                                            height="16"
                                            rx="1"
                                        />
                                    </svg>
                                {/if}
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Viewport do Carrossel Externo (alterna entre os carrosséis de períodos) -->
            <div class="relative overflow-hidden rounded-[2rem]">
                <div
                    class="flex transition-transform duration-700 ease-out"
                    style="transform: translateX(-{activePeriodIndex * 100}%);"
                >
                    {#each periods as period (period.key)}
                        <!-- Slide do Carrossel Externo = Carrossel Interno do Período -->
                        <div class="w-full flex-shrink-0 overflow-hidden">
                            <div
                                class="flex transition-transform duration-500 ease-out"
                                style="transform: translateX(-{(cardIndexByPeriod[
                                    period.key
                                ] ?? 0) * 100}%);"
                            >
                                {#each period.items as item, idx (item.id ?? `${period.key}-${idx}`)}
                                    {@const imgSrc = resolveImage(item)}
                                    <figure
                                        class="w-full flex-shrink-0 relative h-[320px] sm:h-[400px] lg:h-[440px] m-0 overflow-hidden bg-bg-primary/70 group"
                                    >
                                        <!-- Imagem do Card (vazia caso não haja imagem) -->
                                        {#if imgSrc}
                                            <img
                                                src={imgSrc}
                                                alt={item.name}
                                                onerror={() =>
                                                    handleImageError(item)}
                                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />

                                            <!-- Gradiente para Legibilidade da Legenda -->
                                            <div
                                                class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
                                            ></div>
                                        {/if}

                                        <!-- Selo Superior Esquerdo (Categoria) -->
                                        {#if item.category?.name}
                                            <div
                                                class="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                                            >
                                                <span
                                                    class="px-3.5 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-bold uppercase tracking-widest
                                                           {imgSrc
                                                        ? 'bg-black/50 border-white/15 text-white/95'
                                                        : 'bg-bg-secondary/90 border-border-ui text-text-secondary'}"
                                                >
                                                    {item.category.name}
                                                </span>
                                            </div>
                                        {/if}

                                        <!-- Legenda com o Título + Detalhes -->
                                        <figcaption
                                            class="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10 {imgSrc
                                                ? 'text-white'
                                                : 'text-text-primary border-t border-border-ui/50 bg-bg-secondary/50'}"
                                        >
                                            <h4
                                                class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight {imgSrc
                                                    ? 'drop-shadow-md'
                                                    : ''}"
                                            >
                                                {item.name}
                                            </h4>

                                            <div
                                                class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs sm:text-sm font-medium {imgSrc
                                                    ? 'text-white/80'
                                                    : 'text-text-secondary'}"
                                            >
                                                {#if item.start_date}
                                                    <span
                                                        class="inline-flex items-center gap-1.5"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            class="text-brand"
                                                        >
                                                            <rect
                                                                width="18"
                                                                height="18"
                                                                x="3"
                                                                y="4"
                                                                rx="2"
                                                                ry="2"
                                                            />
                                                            <line
                                                                x1="16"
                                                                x2="16"
                                                                y1="2"
                                                                y2="6"
                                                            />
                                                            <line
                                                                x1="8"
                                                                x2="8"
                                                                y1="2"
                                                                y2="6"
                                                            />
                                                            <line
                                                                x1="3"
                                                                x2="21"
                                                                y1="10"
                                                                y2="10"
                                                            />
                                                        </svg>
                                                        {formatDateRange(
                                                            item.start_date,
                                                            item.duration_days,
                                                        )}
                                                    </span>
                                                {/if}

                                                {#if item.place}
                                                    <span
                                                        class="inline-flex items-center gap-1.5"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            class="text-brand"
                                                        >
                                                            <path
                                                                d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                                                            />
                                                            <circle
                                                                cx="12"
                                                                cy="10"
                                                                r="3"
                                                            />
                                                        </svg>
                                                        {item.place}
                                                    </span>
                                                {/if}
                                            </div>
                                        </figcaption>
                                    </figure>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Botões de Navegação: Voltar / Avançar Cards -->
                {#if totalCardsCount > 1}
                    <button
                        type="button"
                        onclick={() => prevCard(true)}
                        aria-label="Card anterior"
                        class="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                               w-11 h-11 sm:w-12 sm:h-12 rounded-2xl
                               bg-black/45 hover:bg-brand text-white backdrop-blur-md
                               border border-white/20 shadow-xl
                               flex items-center justify-center transition-all
                               active:scale-90 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onclick={() => nextCard(true)}
                        aria-label="Próximo card"
                        class="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                               w-11 h-11 sm:w-12 sm:h-12 rounded-2xl
                               bg-black/45 hover:bg-brand text-white backdrop-blur-md
                               border border-white/20 shadow-xl
                               flex items-center justify-center transition-all
                               active:scale-90 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                {/if}
            </div>

            <!-- Indicadores Inferiores (Cards do Período Atual + Progresso dos Períodos) -->
            {#if activePeriod}
                <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2"
                >
                    <!-- Pontos de navegação dos cards do período atual -->
                    <div
                        class="flex items-center gap-2 flex-wrap justify-center"
                    >
                        {#each activePeriod.items as item, cIdx}
                            <button
                                type="button"
                                onclick={() => selectCard(cIdx)}
                                aria-label="Ir para {item.name}"
                                title={item.name}
                                class="h-2.5 rounded-full transition-all duration-300 cursor-pointer
                                       {activeCardIndex === cIdx
                                    ? 'w-8 bg-brand'
                                    : 'w-2.5 bg-border-ui hover:bg-text-secondary'}"
                            ></button>
                        {/each}
                    </div>

                    <!-- Indicação do próximo período na sequência -->
                    {#if periods.length > 1}
                        {@const nextPeriod =
                            periods[(activePeriodIndex + 1) % periods.length]}
                        <button
                            type="button"
                            onclick={() =>
                                selectPeriod(
                                    (activePeriodIndex + 1) % periods.length,
                                )}
                            class="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-secondary hover:text-brand transition-colors cursor-pointer"
                        >
                            <span>A seguir: {nextPeriod.label}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</section>

