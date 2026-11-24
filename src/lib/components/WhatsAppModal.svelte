<script>
    import logo from "../../assets/LogoComunidadeSaoMiguel.png";

    /**
     * Modal com modelo exemplo de conversa no WhatsApp
     * @type {{
     *   isOpen?: boolean,
     *   onClose?: () => void,
     *   selectedProduct?: any | null
     * }}
     */
    let { isOpen = false, onClose = () => {}, selectedProduct = null } = $props();

    let draftMessage = $state("");

    /** @type {{ sender: 'store' | 'user', text: string, time: string }[]} */
    let extraMessages = $state([]);

    // Reseta mensagens simuladas extras sempre que o modal abrir
    $effect(() => {
        if (isOpen) {
            extraMessages = [];
            draftMessage = "";
        }
    });

    // Bloqueia scroll do body enquanto o modal estiver aberto
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

    /** @param {number | string} value */
    function formatPrice(value) {
        const num = Number(value) || 0;
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    let baseMessages = $derived.by(() => {
        const userInterestText = selectedProduct
            ? `Olá! Gostei do produto "${selectedProduct.name}" (${formatPrice(selectedProduct.price)}) no site e gostaria de mais informações.`
            : "Olá! Vi os produtos da lojinha no site da comunidade e gostaria de saber mais detalhes e disponibilidade.";

        return [
            {
                sender: /** @type {'store'} */ ("store"),
                text: "Paz e bem! Seja bem-vindo(a) à Lojinha da Comunidade São Miguel Arcanjo. Como podemos te ajudar hoje?",
                time: "19:30",
            },
            {
                sender: /** @type {'user'} */ ("user"),
                text: userInterestText,
                time: "19:31",
            },
            {
                sender: /** @type {'store'} */ ("store"),
                text: "Que alegria receber sua mensagem! Temos camisetas, terços, livros e outros itens disponíveis para retirada na comunidade. Qual item ou tamanho você procura?",
                time: "19:32",
            },
        ];
    });

    let allMessages = $derived([...baseMessages, ...extraMessages]);

    /** @param {SubmitEvent} e */
    function handleSendPreview(e) {
        e.preventDefault();
        const trimmed = draftMessage.trim();
        if (!trimmed) return;

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        extraMessages = [
            ...extraMessages,
            { sender: "user", text: trimmed, time },
        ];
        draftMessage = "";
    }

    /** @param {KeyboardEvent} e */
    function handleKeydown(e) {
        if (e.key === "Escape" && isOpen) {
            onClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onclick={onClose}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-modal-title"
        class="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
        <!-- Janela Estilo WhatsApp -->
        <div
            onclick={(e) => e.stopPropagation()}
            class="w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[88vh] wa-modal-enter bg-[#ECE5DD] dark:bg-[#0B141A]"
        >
            <!-- Cabeçalho WhatsApp -->
            <div
                class="bg-[#075E54] dark:bg-[#1F2C34] text-white px-4 py-3.5 flex items-center justify-between gap-3"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="w-11 h-11 rounded-full bg-white/95 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden shadow"
                    >
                        <img
                            src={logo}
                            alt="Comunidade São Miguel"
                            class="w-full h-full object-contain"
                        />
                    </div>
                    <div class="min-w-0">
                        <h3
                            id="whatsapp-modal-title"
                            class="text-sm font-bold leading-tight truncate"
                        >
                            Lojinha São Miguel
                        </h3>
                        <p
                            class="text-[11px] text-emerald-200/90 flex items-center gap-1.5 mt-0.5"
                        >
                            <span
                                class="w-2 h-2 rounded-full bg-emerald-400 inline-block"
                            ></span>
                            online • atendimento da comunidade
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onclick={onClose}
                    aria-label="Fechar conversa de exemplo"
                    class="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
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
            </div>

            <!-- Banner Informativo -->
            <div
                class="bg-[#FFF8DC] dark:bg-[#182229] text-[#54656F] dark:text-[#8696A0] text-[11px] font-semibold text-center px-4 py-2 border-b border-black/5 dark:border-white/5"
            >
                Modelo exemplo de conversa no WhatsApp
            </div>

            <!-- Área de Mensagens -->
            <div
                class="flex-1 overflow-y-auto p-4 space-y-3 wa-chat-bg"
            >
                <div class="flex justify-center mb-1">
                    <span
                        class="px-3 py-1 rounded-lg bg-white/85 dark:bg-[#182229] text-[10px] font-bold uppercase tracking-wider text-[#54656F] dark:text-[#8696A0] shadow-xs"
                    >
                        Hoje
                    </span>
                </div>

                {#each allMessages as msg, i (i)}
                    <div
                        class="flex {msg.sender === 'user'
                            ? 'justify-end'
                            : 'justify-start'}"
                    >
                        <div
                            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm leading-relaxed relative
                                   {msg.sender === 'user'
                                ? 'bg-[#DCF8C6] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] rounded-tr-sm'
                                : 'bg-white dark:bg-[#202C33] text-[#111B21] dark:text-[#E9EDEF] rounded-tl-sm'}"
                        >
                            <p class="whitespace-pre-wrap break-words">
                                {msg.text}
                            </p>
                            <div
                                class="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781] dark:text-[#8696A0]"
                            >
                                <span>{msg.time}</span>
                                {#if msg.sender === "user"}
                                    <!-- Ícone de mensagem lida (double-check azul) -->
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#53BDEB"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M18 6 7 17l-5-5" />
                                        <path d="m22 10-7.5 7.5L13 16" />
                                    </svg>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Barra Inferior Simulada de Digitação -->
            <form
                onsubmit={handleSendPreview}
                class="bg-[#F0F2F5] dark:bg-[#202C33] px-3 py-3 flex items-center gap-2 border-t border-black/5 dark:border-white/5"
            >
                <input
                    type="text"
                    bind:value={draftMessage}
                    placeholder="Digite uma mensagem de exemplo..."
                    class="flex-1 bg-white dark:bg-[#2A3942] text-[#111B21] dark:text-[#E9EDEF] placeholder:text-[#667781] dark:placeholder:text-[#8696A0] text-sm rounded-full px-4 py-2.5 outline-none border border-black/5 dark:border-white/5 focus:border-[#25D366]"
                />
                <button
                    type="submit"
                    aria-label="Enviar mensagem de exemplo"
                    class="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer flex-shrink-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
{/if}

<style>
    .wa-modal-enter {
        animation: waPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes waPop {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .wa-chat-bg {
        background-image: radial-gradient(
            rgba(0, 0, 0, 0.06) 1px,
            transparent 1px
        );
        background-size: 18px 18px;
    }
</style>

