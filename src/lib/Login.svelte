<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    import bgHero from "../assets/SaoMiguelArcanjo.png";
    import Modal from "./components/Modal.svelte";

    import { setLogin } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    /**
     * Props do Modal de Login
     * @type {{ isOpen?: boolean, onClose?: () => void, onSuccess?: () => void }}
     */
    let {
        isOpen = false,
        onClose = () => {},
        onSuccess = () => goto("/dashboard"),
    } = $props();

    // Estados do formulário de login
    let cpf = $state("");
    let password = $state("");
    let loading = $state(false);
    let showPassword = $state(false);
    let rememberMe = $state(false);

    // Estado do Modal de avisos/erros
    /** @type {{ isOpen: boolean, type: string, message: string, onConfirm: (() => void) | null }} */
    let modalState = $state({
        isOpen: false,
        type: "error",
        message: "",
        onConfirm: null,
    });

    /**
     * @param {string} type
     * @param {string} message
     * @param {(() => void) | null} onConfirm
     */
    function showModal(type, message, onConfirm = null) {
        modalState = { isOpen: true, type, message, onConfirm };
    }

    function closeModal() {
        modalState.isOpen = false;
    }

    // Bloqueio de scroll no body enquanto o modal estiver aberto
    $effect(() => {
        if (typeof document === "undefined") return;
        if (isOpen) {
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = previousOverflow;
            };
        }
    });

    // Função para aplicar máscara de CPF no input
    /** @param {Event} e */
    function handleCpfInput(e) {
        let value = /** @type {HTMLInputElement} */ (e.target).value.replace(
            /\D/g,
            "",
        );
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 9) {
            value = value.replace(
                /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
                "$1.$2.$3-$4",
            );
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        }

        cpf = value;
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        if (e.key === "Escape" && isOpen && !modalState.isOpen) {
            handleClose();
        }
    }

    function handleClose() {
        if (loading) return;
        onClose();
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    // Função que lida com o envio do formulário de login
    /** @param {Event} e */
    async function handleSubmit(e) {
        if (e) e.preventDefault();
        loading = true;

        try {
            const response = await fetch(`${API_URL}/v1/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    cpf: cpf.replace(/\D/g, ""),
                    password,
                    remember: rememberMe,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setLogin(data.token, data.data, rememberMe);
                password = "";
                onClose();
                onSuccess();
            } else {
                showModal(
                    "error",
                    data.message || "CPF ou senha incorretos.",
                );
            }
        } catch (err) {
            showModal("error", "Sem conexão com o servidor.");
        } finally {
            loading = false;
        }
    }

    function goToRegister() {
        onClose();
        goto("/register");
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <!-- Backdrop do Modal de Login -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onclick={handleClose}
        tabindex="-1"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
    >
        <!-- Container do Modal -->
        <div
            onclick={(e) => e.stopPropagation()}
            class="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col md:flex-row
                   bg-bg-secondary border border-border-ui shadow-2xl
                   rounded-[2.5rem] login-modal-enter"
        >
            <!-- Botão Fechar -->
            <button
                type="button"
                onclick={handleClose}
                disabled={loading}
                aria-label="Fechar login"
                class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full
                       bg-bg-primary/80 backdrop-blur-sm border border-border-ui
                       text-text-secondary hover:text-text-primary hover:border-brand
                       flex items-center justify-center transition-all cursor-pointer
                       active:scale-90 disabled:opacity-50"
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>

            <!-- Metade Esquerda: Imagem de Destaque -->
            <div class="hidden md:block md:w-5/12 relative bg-forest/10 min-h-[540px]">
                <img
                    src={bgHero}
                    alt="São Miguel Arcanjo"
                    class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"
                ></div>
                <div
                    class="relative z-10 p-8 lg:p-10 flex flex-col justify-end h-full text-white"
                >
                    <h2 class="text-2xl lg:text-3xl font-black mb-3 leading-tight italic">
                        Quem como Deus?<br />
                        <span class="text-3xl lg:text-4xl text-brand">
                            Ninguém como Deus!
                        </span>
                    </h2>
                    <p class="text-white/80 text-sm lg:text-base max-w-xs">
                        Portal destinado aos servos e campistas da Comunidade
                        São Miguel Arcanjo.
                    </p>
                </div>
            </div>

            <!-- Metade Direita: Formulário de Login -->
            <div
                class="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-center"
            >
                <header class="text-center w-full mb-2">
                    <div class="w-full flex justify-center mb-2">
                        <img
                            src={logo}
                            alt="Logo Comunidade São Miguel"
                            class="h-24 md:h-28 max-w-full drop-shadow-[0_0_25px_rgba(196,152,42,0.3)] object-contain"
                        />
                    </div>
                    <h1
                        id="login-modal-title"
                        class="text-text-primary text-2xl sm:text-3xl font-black mb-1"
                    >
                        Acesso
                    </h1>
                    <p
                        class="text-text-secondary text-[10px] md:text-xs font-bold opacity-60 uppercase tracking-widest leading-none"
                    >
                        Portal Comunidade São Miguel
                    </p>
                </header>

                <form
                    onsubmit={handleSubmit}
                    class="w-full max-w-sm space-y-4 mt-5"
                >
                    <!-- Campo: CPF -->
                    <div class="space-y-1.5 text-left w-full">
                        <label
                            for="login-cpf"
                            class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1"
                        >
                            CPF
                        </label>
                        <input
                            id="login-cpf"
                            value={cpf}
                            oninput={handleCpfInput}
                            type="text"
                            required
                            maxlength="14"
                            class="w-full bg-bg-primary/60 border border-border-ui rounded-2xl p-3.5 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm"
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <!-- Campo: Senha -->
                    <div class="space-y-1.5 text-left w-full">
                        <label
                            for="login-password"
                            class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1"
                        >
                            Senha
                        </label>
                        <div class="relative w-full">
                            <input
                                id="login-password"
                                bind:value={password}
                                type={showPassword ? "text" : "password"}
                                required
                                class="w-full bg-bg-primary/60 border border-border-ui rounded-2xl p-3.5 pr-12 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onclick={() => (showPassword = !showPassword)}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none transition-colors cursor-pointer"
                            >
                                {#if showPassword}
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
                                        <path
                                            d="M10.733 5.076a10.744 10.744 0 0 1 1.267-.076c7.02 0 10 7 10 7a18.16 18.16 0 0 1-2.062 2.805M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                                        />
                                        <line x1="2" x2="22" y1="2" y2="22" />
                                    </svg>
                                {:else}
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
                                        <path
                                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                                        />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                {/if}
                            </button>
                        </div>
                    </div>

                    <!-- Checkbox: Lembrar de Mim -->
                    <div class="flex items-center gap-2 mt-1 ml-1">
                        <input
                            type="checkbox"
                            id="login-remember"
                            bind:checked={rememberMe}
                            class="w-4 h-4 rounded border-border-ui text-brand focus:ring-brand accent-brand cursor-pointer"
                        />
                        <label
                            for="login-remember"
                            class="text-text-secondary text-xs font-medium cursor-pointer select-none"
                        >
                            Lembrar de mim
                        </label>
                    </div>

                    <!-- Botão de Entrar -->
                    <div class="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            class="w-full bg-brand text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand/30 cursor-pointer disabled:opacity-60"
                        >
                            {loading ? "Entrando..." : "Entrar agora"}
                        </button>
                    </div>
                </form>

                <footer class="mt-6 text-center w-full">
                    <button
                        type="button"
                        onclick={goToRegister}
                        class="text-text-secondary text-sm hover:text-text-primary transition-all cursor-pointer"
                    >
                        Novo por aqui?
                        <span class="text-brand font-black hover:underline">
                            Crie sua conta
                        </span>
                    </button>
                </footer>
            </div>
        </div>
    </div>
{/if}

<Modal {modalState} {closeModal} />

<style>
    .login-modal-enter {
        animation: modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPopIn {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
</style>
