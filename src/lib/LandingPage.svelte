<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { token } from "$lib/stores/auth.js";

    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    import bgHero from "../assets/SaoMiguelArcanjo.png";
    import Login from "./Login.svelte";
    import Navbar from "./components/Navbar.svelte";
    import PeriodCarouselGroup from "./components/PeriodCarouselGroup.svelte";
    import ProductsCarousel from "./components/ProductsCarousel.svelte";
    import WhatsAppModal from "./components/WhatsAppModal.svelte";

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @type {any[]} */
    let activities = $state([]);
    let loading = $state(true);
    let fetchError = $state("");

    /** @type {any[]} */
    let products = $state([]);
    let loadingProducts = $state(true);

    let isLoginModalOpen = $state(false);
    let isWhatsAppModalOpen = $state(false);

    let isLoggedIn = $derived(Boolean($token));

    /**
     * Converte start_date + duration_days em intervalo local seguro (sem shift de fuso UTC)
     * @param {any} activity
     */
    function getActivityDateBounds(activity) {
        if (!activity?.start_date) return null;
        const datePart = String(activity.start_date).slice(0, 10);
        const [y, m, d] = datePart.split("-").map(Number);
        if (!y || !m || !d) return null;

        const duration = Math.max(1, Number(activity.duration_days) || 1);
        const start = new Date(y, m - 1, d, 0, 0, 0, 0);
        const end = new Date(y, m - 1, d + duration - 1, 23, 59, 59, 999);

        return { start, end };
    }

    /**
     * Classifica uma lista de atividades em passadas (máx 3 mais recentes), atuais e futuras
     * @param {any[]} list
     */
    function partitionByPeriod(list) {
        const now = new Date();
        /** @type {{ item: any, startMs: number }[]} */
        const past = [];
        /** @type {{ item: any, startMs: number }[]} */
        const current = [];
        /** @type {{ item: any, startMs: number }[]} */
        const future = [];

        for (const item of list) {
            const bounds = getActivityDateBounds(item);
            if (!bounds) continue;

            const entry = { item, startMs: bounds.start.getTime() };
            if (bounds.end < now) {
                past.push(entry);
            } else if (bounds.start <= now && now <= bounds.end) {
                current.push(entry);
            } else {
                future.push(entry);
            }
        }

        // Passados: mais recentes primeiro, no máximo 3 cards
        past.sort((a, b) => b.startMs - a.startMs);
        // Atuais e Futuros: mais próximos primeiro, exibindo todos os disponíveis
        current.sort((a, b) => a.startMs - b.startMs);
        future.sort((a, b) => a.startMs - b.startMs);

        return {
            past: past.slice(0, 3).map((e) => e.item),
            current: current.map((e) => e.item),
            future: future.map((e) => e.item),
        };
    }

    let campings = $derived(
        partitionByPeriod(
            activities.filter((a) =>
                String(a.activitable_type || "").endsWith("Camping"),
            ),
        ),
    );

    let events = $derived(
        partitionByPeriod(
            activities.filter((a) =>
                String(a.activitable_type || "").endsWith("Event"),
            ),
        ),
    );

    async function fetchPublicActivities() {
        try {
            loading = true;
            fetchError = "";
            const response = await fetch(`${API_URL}/v1/public/activities`, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Não foi possível carregar as atividades.");
            }

            const payload = await response.json();
            activities = payload.data || [];
        } catch (err) {
            console.error("Erro ao carregar atividades públicas:", err);
            fetchError =
                "Não foi possível conectar ao servidor para exibir a programação.";
        } finally {
            loading = false;
        }
    }

    async function fetchPublicProducts() {
        try {
            loadingProducts = true;
            const response = await fetch(`${API_URL}/v1/public/products`, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                const payload = await response.json();
                products = payload.data || [];
            }
        } catch (err) {
            console.error("Erro ao carregar produtos públicos:", err);
        } finally {
            loadingProducts = false;
        }
    }

    onMount(() => {
        fetchPublicActivities();
        fetchPublicProducts();

        // Se chegou via ?login=true e não está autenticado, abre o modal de login
        if ($page.url.searchParams.get("login") === "true") {
            if (!$token) {
                isLoginModalOpen = true;
            }
            goto("/", { replaceState: true });
        }
    });

    function handleInterestedClick() {
        if ($token) {
            goto("/dashboard");
        } else {
            isLoginModalOpen = true;
        }
    }

    function handleLoginSuccess() {
        isLoginModalOpen = false;
        goto("/dashboard");
    }

    /** @param {string} sectionId */
    function scrollToSection(sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
</script>

<!-- NAVBAR UNIFICADA -->
<Navbar onOpenLogin={() => (isLoginModalOpen = true)} />

<!-- CONTEÚDO PRINCIPAL DA LANDING PAGE -->
<div
    class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20"
>
    <!-- HERO BANNER -->
    <section
        class="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border border-border-ui shadow-2xl min-h-[340px] sm:min-h-[420px] flex items-end"
    >
        <img
            src={bgHero}
            alt="São Miguel Arcanjo"
            class="absolute inset-0 w-full h-full object-cover"
        />
        <div
            class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30"
        ></div>

        <div
            class="relative z-10 w-full p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-white"
        >
            <div class="max-w-2xl space-y-4">
                <span
                    class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/20 border border-brand/50 text-brand text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-sm"
                >
                    Comunidade São Miguel Arcanjo
                </span>
                <h1
                    class="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight italic"
                >
                    Quem como Deus?<br />
                    <span class="text-brand">Ninguém como Deus!</span>
                </h1>
                <p
                    class="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed"
                >
                    Conheça nossos acampamentos e eventos — reviva momentos
                    marcantes, acompanhe o que está acontecendo agora e
                    prepare-se para as próximas experiências em comunidade.
                </p>

                <div class="flex flex-wrap items-center gap-3 pt-2">
                    <button
                        type="button"
                        onclick={() => scrollToSection("acampamentos")}
                        class="px-6 py-3 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all active:scale-95 cursor-pointer shadow-lg"
                    >
                        Ver Acampamentos
                    </button>
                    <button
                        type="button"
                        onclick={() => scrollToSection("eventos")}
                        class="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                    >
                        Ver Eventos
                    </button>
                </div>
            </div>

            <div class="hidden lg:flex flex-col items-end gap-3">
                <img
                    src={logo}
                    alt="Brasão Comunidade São Miguel"
                    class="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(196,152,42,0.45)]"
                />
            </div>
        </div>
    </section>

    {#if fetchError}
        <div
            class="p-6 rounded-3xl bg-red-500/10 border border-red-500/25 text-red-500 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
            <p class="text-sm font-bold text-center sm:text-left">
                {fetchError}
            </p>
            <button
                type="button"
                onclick={fetchPublicActivities}
                class="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all cursor-pointer flex-shrink-0"
            >
                Tentar novamente
            </button>
        </div>
    {/if}

    <!-- CARROSSEL DE CARROSSÉIS: ACAMPAMENTOS -->
    <PeriodCarouselGroup
        id="acampamentos"
        title="Acampamentos"
        subtitle="Acompanhe os acampamentos realizados, em andamento e as próximas edições."
        itemLabelPlural="Acampamentos"
        pastItems={campings.past}
        currentItems={campings.current}
        futureItems={campings.future}
        {loading}
        accentVariant="camping"
    />

    <!-- CARROSSEL DE CARROSSÉIS: EVENTOS -->
    <PeriodCarouselGroup
        id="eventos"
        title="Eventos"
        subtitle="Encontros, celebrações e festivais promovidos pela nossa comunidade."
        itemLabelPlural="Eventos"
        pastItems={events.past}
        currentItems={events.current}
        futureItems={events.future}
        {loading}
        accentVariant="event"
    />

    <!-- CHAMADA PARA AÇÃO ABAIXO DOS CARROSSÉIS -->
    <section
        class="relative rounded-[2.5rem] sm:rounded-[3rem] bg-bg-secondary/85 backdrop-blur-md border border-border-ui p-8 sm:p-14 text-center shadow-2xl overflow-hidden"
    >
        <div
            class="absolute -top-20 -left-20 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
            class="absolute -bottom-20 -right-20 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative z-10 max-w-2xl mx-auto space-y-5">
            <span
                class="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-brand"
            >
                Faça Parte
            </span>
            <h2
                class="text-2xl sm:text-4xl font-black text-text-primary tracking-tight"
            >
                Pronto para viver essa experiência?
            </h2>
            <p class="text-sm sm:text-base text-text-secondary leading-relaxed">
                {#if isLoggedIn}
                    Acesse a área de atividades para conferir todos os detalhes
                    e realizar sua inscrição.
                {:else}
                    Faça login ou crie sua conta para visualizar todas as
                    atividades disponíveis e garantir sua participação.
                {/if}
            </p>

            <div class="pt-3">
                <button
                    type="button"
                    onclick={handleInterestedClick}
                    class="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl
                           bg-brand text-white text-sm sm:text-base font-black uppercase tracking-widest
                           shadow-2xl shadow-brand/35 hover:brightness-110 hover:-translate-y-0.5
                           active:scale-95 transition-all cursor-pointer"
                >
                    <span>Interessado? Saiba mais.</span>
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
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    </section>

    <!-- CARROSSEL DE PRODUTOS DA IGREJA + CONTATO WHATSAPP -->
    <section id="produtos" class="space-y-8">
        <ProductsCarousel {products} loading={loadingProducts} />

        <!-- Legenda e Botão do WhatsApp -->
        <div
            class="flex flex-col items-center justify-center text-center gap-4 pt-2"
        >
            <p
                class="text-base sm:text-lg font-bold text-text-primary max-w-xl"
            >
                Gostou de algo? Entre em contato e confira mais.
            </p>

            <button
                type="button"
                onclick={() => (isWhatsAppModalOpen = true)}
                class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl
                       bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-black uppercase tracking-widest
                       shadow-xl shadow-[#25D366]/30 hover:-translate-y-0.5 active:scale-95
                       transition-all cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path
                        d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"
                    />
                </svg>
                <span>Conversar no WhatsApp</span>
            </button>
        </div>
    </section>

    <!-- RODAPÉ -->
    <footer
        class="pt-6 pb-10 border-t border-border-ui/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary"
    >
        <p class="font-bold uppercase tracking-[0.18em] text-[10px]">
            Comunidade São Miguel Arcanjo
        </p>
        <div class="flex items-center gap-6 font-bold">
            <a
                href="https://www.google.com/maps/search/?api=1&query=Av.+Mato+Grosso,+415+-+Primavera+II,+Primavera+do+Leste+-+MT,+78850-000"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-brand transition-colors"
            >
                Onde Estamos
            </a>
            <a
                href="https://www.instagram.com/campistasprimavera/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-brand transition-colors"
            >
                Instagram
            </a>
        </div>
    </footer>
</div>

<!-- MODAL DE LOGIN REFATORADO -->
<Login
    isOpen={isLoginModalOpen}
    onClose={() => (isLoginModalOpen = false)}
    onSuccess={handleLoginSuccess}
/>

<!-- MODAL EXEMPLO DE CONVERSA NO WHATSAPP -->
<WhatsAppModal
    isOpen={isWhatsAppModalOpen}
    onClose={() => (isWhatsAppModalOpen = false)}
/>
