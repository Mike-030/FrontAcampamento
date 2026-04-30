<script>
    let { modalState = {}, closeModal } = $props();
</script>

{#if modalState.isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
    >
        <div
            class="bg-bg-primary border border-border-ui p-8 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all animate-in fade-in zoom-in-95 duration-200"
        >
            <div class="flex flex-col items-center text-center">
                {#if modalState.type === "error"}
                    <div
                        class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 border border-red-500/20"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-red-500 mb-3">
                        Ops, algo falhou!
                    </h3>
                {:else if modalState.type === "success"}
                    <div
                        class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 border border-green-500/20"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="3"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-green-500 mb-3">
                        Sucesso!
                    </h3>
                {:else if modalState.type === "confirm"}
                    <div
                        class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-500 border border-yellow-500/20"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-yellow-500 mb-3">
                        Atenção
                    </h3>
                {/if}

                <p
                    class="text-text-secondary text-sm font-medium leading-relaxed mb-8"
                >
                    {modalState.message}
                </p>

                {#if modalState.type === "confirm"}
                    <div class="flex gap-4 w-full">
                        <button
                            onclick={closeModal}
                            class="w-1/2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-bg-secondary text-text-secondary border border-border-ui hover:border-brand hover:text-text-primary transition-all"
                        >
                            Voltar
                        </button>
                        <button
                            onclick={modalState.onConfirm}
                            class="w-1/2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all"
                        >
                            Confirmar
                        </button>
                    </div>
                {:else}
                    <button
                        onclick={closeModal}
                        class="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all {modalState.type ===
                        'error'
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'}"
                    >
                        Entendi
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}
