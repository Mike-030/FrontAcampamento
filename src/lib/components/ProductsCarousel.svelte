<script>
    /**
     * Carrossel infinito de cards pequenos de produtos vendidos pela igreja,
     * com setas laterais, arrasto (drag) e rotação automática.
     *
     * @type {{
     *   products?: any[],
     *   loading?: boolean,
     *   autoPlayMs?: number
     * }}
     */
    let { products = [], loading = false, autoPlayMs = 4000 } = $props();

    /** @type {HTMLDivElement | null} */
    let trackRef = $state(null);

    /** @type {Record<string, boolean>} */
    let failedImages = $state({});

    // Estados de interação e reprodução automática
    let isHovered = $state(false);
    let isManuallyPaused = $state(false);
    let isDragging = $state(false);
    let isPaused = $derived(isHovered || isManuallyPaused || isDragging);
    let timerVersion = $state(0);
    let activeProductIndex = $state(0);

    // Animação suave via requestAnimationFrame (evita conflito com normalização instantânea)
    /** @type {number | null} */
    let animFrameId = null;

    let canLoop = $derived(products.length > 1);

    // Garante que cada bloco lógico cubra bem a largura da tela para wrap invisível
    let copiesPerBlock = $derived(
        canLoop ? Math.max(1, Math.ceil(6 / products.length)) : 1,
    );
    let blockSize = $derived(products.length * copiesPerBlock);

    // Renderiza 3 blocos idênticos (buffer esquerdo, bloco central, buffer direito) quando canLoop
    let renderedItems = $derived.by(() => {
        if (!canLoop) {
            return products.map((product, idx) => ({
                product,
                originalIndex: idx,
                renderKey: `single-${product.id ?? idx}`,
            }));
        }

        const totalCopies = copiesPerBlock * 3;
        /** @type {{ product: any, originalIndex: number, renderKey: string }[]} */
        const items = [];
        for (let copy = 0; copy < totalCopies; copy++) {
            for (let i = 0; i < products.length; i++) {
                items.push({
                    product: products[i],
                    originalIndex: i,
                    renderKey: `c${copy}-i${i}-${products[i].id ?? i}`,
                });
            }
        }
        return items;
    });

    function getStepPx() {
        if (!trackRef || trackRef.children.length < 2) return 241;
        const first = /** @type {HTMLElement} */ (trackRef.children[0]);
        const second = /** @type {HTMLElement} */ (trackRef.children[1]);
        const diff = second.offsetLeft - first.offsetLeft;
        return diff > 0 ? diff : first.offsetWidth + 16;
    }

    function getBlockWidth() {
        return blockSize * getStepPx();
    }

    function cancelAnimation() {
        if (animFrameId !== null) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    function updateActiveIndexFromScroll() {
        if (!trackRef || products.length === 0) {
            activeProductIndex = 0;
            return;
        }
        const step = getStepPx();
        const rawIdx = Math.round(trackRef.scrollLeft / step);
        activeProductIndex =
            ((rawIdx % products.length) + products.length) % products.length;
    }

    /**
     * Reposiciona scrollLeft para o bloco central sem nenhum salto visual
     * @returns {number} deslocamento aplicado
     */
    function normalizeScrollPosition() {
        if (!trackRef || !canLoop) return 0;
        const blockW = getBlockWidth();
        if (blockW <= 0) return 0;

        let shift = 0;
        if (trackRef.scrollLeft < blockW * 0.5) {
            shift = blockW;
            trackRef.scrollLeft += blockW;
        } else if (trackRef.scrollLeft >= blockW * 1.5) {
            shift = -blockW;
            trackRef.scrollLeft -= blockW;
        }
        return shift;
    }

    /**
     * Anima scrollLeft suavemente até targetLeft e normaliza ao concluir
     * @param {number} targetLeft
     * @param {number} duration
     */
    function animateScrollTo(targetLeft, duration = 420) {
        if (!trackRef) return;
        cancelAnimation();

        const startLeft = trackRef.scrollLeft;
        const distance = targetLeft - startLeft;
        if (Math.abs(distance) < 0.5) {
            trackRef.scrollLeft = targetLeft;
            normalizeScrollPosition();
            updateActiveIndexFromScroll();
            return;
        }

        const startTime = performance.now();

        /** @param {number} now */
        const tick = (now) => {
            if (!trackRef) {
                animFrameId = null;
                return;
            }
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            trackRef.scrollLeft = startLeft + distance * eased;

            if (t < 1) {
                animFrameId = requestAnimationFrame(tick);
            } else {
                animFrameId = null;
                normalizeScrollPosition();
                updateActiveIndexFromScroll();
            }
        };

        animFrameId = requestAnimationFrame(tick);
    }

    /**
     * Avança ou volta 1 card no carrossel infinito
     * @param {1 | -1} direction
     * @param {boolean} resetTimer
     */
    function stepCard(direction, resetTimer = true) {
        if (!trackRef || !canLoop) return;
        cancelAnimation();
        normalizeScrollPosition();

        const step = getStepPx();
        const currentCard = Math.round(trackRef.scrollLeft / step);
        const targetLeft = (currentCard + direction) * step;

        animateScrollTo(targetLeft, 420);

        if (resetTimer) {
            timerVersion += 1;
        }
    }

    /** @param {number} targetIdx */
    function goToProduct(targetIdx) {
        if (!trackRef || !canLoop || products.length === 0) return;
        cancelAnimation();
        normalizeScrollPosition();

        const step = getStepPx();
        const currentCard = Math.round(trackRef.scrollLeft / step);
        const currentMod =
            ((currentCard % products.length) + products.length) %
            products.length;

        let delta = targetIdx - currentMod;
        if (delta > products.length / 2) delta -= products.length;
        if (delta < -products.length / 2) delta += products.length;

        animateScrollTo((currentCard + delta) * step, 420);
        timerVersion += 1;
    }

    // Posiciona o carrossel no início do bloco central quando os produtos carregam
    $effect(() => {
        const _len = products.length;
        const _loading = loading;
        if (!trackRef || _loading || !canLoop) return;

        const frame = requestAnimationFrame(() => {
            if (!trackRef) return;
            cancelAnimation();
            trackRef.scrollLeft = getBlockWidth();
            updateActiveIndexFromScroll();
        });

        return () => cancelAnimationFrame(frame);
    });

    // Rotação automática (pausa ao passar o mouse, arrastar ou pausar manualmente)
    $effect(() => {
        const _version = timerVersion;
        if (isPaused || !canLoop || loading) return;

        const intervalId = setInterval(() => {
            stepCard(1, false);
        }, autoPlayMs);

        return () => clearInterval(intervalId);
    });

    // Arrastar com mouse (click + drag) com wrap infinito contínuo
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    /** @param {MouseEvent} e */
    function handleMouseDown(e) {
        if (!trackRef || !canLoop || e.button !== 0) return;
        cancelAnimation();
        normalizeScrollPosition();

        isDragging = true;
        dragStartX = e.clientX;
        dragStartScrollLeft = trackRef.scrollLeft;
        e.preventDefault();
    }

    /** @param {MouseEvent} e */
    function handleWindowMouseMove(e) {
        if (!isDragging || !trackRef) return;
        const deltaX = e.clientX - dragStartX;
        trackRef.scrollLeft = dragStartScrollLeft - deltaX;

        // Mantém o arrasto infinito sem nunca encostar nas extremidades
        const shift = normalizeScrollPosition();
        if (shift !== 0) {
            dragStartScrollLeft += shift;
        }
        updateActiveIndexFromScroll();
    }

    function handleWindowMouseUp() {
        if (!isDragging || !trackRef) return;
        isDragging = false;

        const step = getStepPx();
        const nearestCard = Math.round(trackRef.scrollLeft / step);
        animateScrollTo(nearestCard * step, 260);
        timerVersion += 1;
    }

    // Suporte a swipe/scroll nativo (touchpad / celular) mantendo o loop infinito
    /** @type {ReturnType<typeof setTimeout> | null} */
    let scrollSettleTimer = null;

    function handleNativeScroll() {
        if (!trackRef || isDragging || animFrameId !== null) return;
        normalizeScrollPosition();
        updateActiveIndexFromScroll();

        if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
        scrollSettleTimer = setTimeout(() => {
            if (!trackRef || isDragging || animFrameId !== null) return;
            normalizeScrollPosition();
            updateActiveIndexFromScroll();
        }, 120);
    }

    $effect(() => {
        return () => {
            cancelAnimation();
            if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
        };
    });

    /** @param {any} product */
    function resolveImage(product) {
        const key = String(product?.id ?? product?.name ?? "");
        const raw =
            typeof product?.image === "string" ? product.image.trim() : "";

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

    /** @param {any} product */
    function handleImageError(product) {
        const key = String(product?.id ?? product?.name ?? "");
        if (!failedImages[key]) {
            failedImages = { ...failedImages, [key]: true };
        }
    }

    /** @param {number | string} value */
    function formatPrice(value) {
        const num = Number(value) || 0;
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }
</script>

<svelte:window
    onmousemove={handleWindowMouseMove}
    onmouseup={handleWindowMouseUp}
    onresize={() => {
        if (trackRef && canLoop) {
            normalizeScrollPosition();
            updateActiveIndexFromScroll();
        }
    }}
/>

<div class="w-full space-y-6">
    <!-- Cabeçalho da Seção de Produtos -->
    <div
        class="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
        <div>
            <div class="flex items-center gap-3 mb-2">
                <span class="inline-block w-8 h-1 rounded-full bg-brand"></span>
                <span
                    class="text-[11px] font-black uppercase tracking-[0.22em] text-brand"
                >
                    Lojinha da Comunidade
                </span>
            </div>
            <h2
                class="text-3xl sm:text-4xl font-black text-text-primary tracking-tight"
            >
                Nossos Produtos
            </h2>
            <p class="text-sm sm:text-base text-text-secondary mt-1">
                Itens exclusivos vendidos pela igreja para apoiar nossa missão.
            </p>
        </div>

        {#if !loading && canLoop}
            <div class="flex items-center gap-3 self-start sm:self-auto">
                <span class="text-xs font-bold text-text-secondary tabular-nums">
                    {activeProductIndex + 1} / {products.length}
                </span>
                <button
                    type="button"
                    onclick={() => (isManuallyPaused = !isManuallyPaused)}
                    aria-label={isManuallyPaused
                        ? "Retomar rotação automática"
                        : "Pausar rotação automática"}
                    title={isManuallyPaused
                        ? "Retomar rotação automática"
                        : "Pausar rotação automática"}
                    class="w-9 h-9 rounded-xl bg-bg-secondary border border-border-ui text-text-secondary hover:text-brand hover:border-brand flex items-center justify-center transition-all cursor-pointer"
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
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    {/if}
                </button>
            </div>
        {/if}
    </div>

    <!-- Conteúdo do Carrossel Infinito de Cards Pequenos -->
    {#if loading}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each [1, 2, 3, 4] as _skeleton}
                <div
                    class="rounded-3xl bg-bg-secondary/70 border border-border-ui p-3 space-y-3 animate-pulse"
                >
                    <div class="h-36 rounded-2xl bg-bg-primary/60"></div>
                    <div class="h-4 w-3/4 rounded bg-bg-primary/60"></div>
                    <div class="h-5 w-1/2 rounded bg-bg-primary/60"></div>
                </div>
            {/each}
        </div>
    {:else if products.length === 0}
        <div
            class="w-full py-14 px-6 rounded-[2rem] bg-bg-secondary/50 border-2 border-dashed border-border-ui text-center"
        >
            <p
                class="text-xs font-black uppercase tracking-widest text-text-secondary mb-1.5"
            >
                Nenhum produto disponível no momento
            </p>
            <p class="text-xs text-text-secondary/70">
                Em breve novos itens da lojinha da comunidade serão exibidos por
                aqui.
            </p>
        </div>
    {:else}
        <!-- Container Interativo com Setas Laterais + Drag + Auto-Play -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            onmouseenter={() => (isHovered = true)}
            onmouseleave={() => (isHovered = false)}
            class="relative flex items-center gap-2 sm:gap-3"
        >
            <!-- Seta Esquerda (ao lado do carrossel) -->
            {#if canLoop}
                <button
                    type="button"
                    onclick={() => stepCard(-1, true)}
                    aria-label="Produto anterior"
                    class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl
                           bg-bg-secondary/95 backdrop-blur-md border border-border-ui
                           text-text-primary hover:bg-brand hover:text-white hover:border-brand
                           shadow-lg active:scale-90 transition-all
                           flex items-center justify-center cursor-pointer z-10"
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
                </button>
            {/if}

            <!-- Trilha Arrastável do Carrossel Infinito -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                bind:this={trackRef}
                onmousedown={handleMouseDown}
                onscroll={handleNativeScroll}
                class="flex-1 min-w-0 flex gap-4 overflow-x-auto pb-3 pt-1 px-1 select-none products-no-scrollbar
                       {canLoop
                    ? isDragging
                        ? 'cursor-grabbing'
                        : 'cursor-grab'
                    : ''}"
            >
                {#each renderedItems as entry (entry.renderKey)}
                    {@const product = entry.product}
                    {@const imgSrc = resolveImage(product)}
                    <article
                        class="w-[200px] sm:w-[225px] flex-shrink-0 text-left
                               bg-bg-secondary/90 backdrop-blur-md border border-border-ui
                               rounded-3xl overflow-hidden shadow-lg hover:shadow-xl
                               transition-shadow duration-300 flex flex-col"
                    >
                        <!-- Imagem do Produto (vazia caso não haja imagem) -->
                        <div
                            class="w-full h-36 sm:h-40 bg-bg-primary/50 border-b border-border-ui/40 overflow-hidden relative"
                        >
                            {#if imgSrc}
                                <img
                                    src={imgSrc}
                                    alt={product.name}
                                    draggable="false"
                                    onerror={() => handleImageError(product)}
                                    class="w-full h-full object-cover pointer-events-none"
                                />
                            {/if}
                        </div>

                        <!-- Nome e Preço -->
                        <div
                            class="p-4 flex-1 flex flex-col justify-between gap-2"
                        >
                            <h3
                                class="text-sm font-black text-text-primary line-clamp-2 leading-snug"
                            >
                                {product.name}
                            </h3>
                            <p class="text-base font-black text-brand">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </article>
                {/each}
            </div>

            <!-- Seta Direita (ao lado do carrossel) -->
            {#if canLoop}
                <button
                    type="button"
                    onclick={() => stepCard(1, true)}
                    aria-label="Próximo produto"
                    class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl
                           bg-bg-secondary/95 backdrop-blur-md border border-border-ui
                           text-text-primary hover:bg-brand hover:text-white hover:border-brand
                           shadow-lg active:scale-90 transition-all
                           flex items-center justify-center cursor-pointer z-10"
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
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            {/if}
        </div>

        <!-- Indicadores Inferiores -->
        {#if canLoop}
            <div class="flex items-center justify-center gap-2 flex-wrap pt-1">
                {#each products as product, idx (product.id ?? idx)}
                    <button
                        type="button"
                        onclick={() => goToProduct(idx)}
                        aria-label="Ir para {product.name}"
                        title={product.name}
                        class="h-2.5 rounded-full transition-all duration-300 cursor-pointer
                               {activeProductIndex === idx
                            ? 'w-7 bg-brand'
                            : 'w-2.5 bg-border-ui hover:bg-text-secondary'}"
                    ></button>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    .products-no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .products-no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
