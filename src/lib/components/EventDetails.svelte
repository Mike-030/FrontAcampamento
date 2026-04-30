<script>
    let { event, onSubscribe, onBack } = $props();
</script>

<div class="flex flex-col gap-6 w-full max-w-5xl mx-auto">


    <div
        class="bg-bg-secondary border border-border-ui p-8 md:p-12 lg:p-16 rounded-[3rem] shadow-xl relative overflow-hidden"
    >
        <div
            class="absolute bottom-0 left-0 w-32 h-32 bg-text-primary/5 rounded-tr-full pointer-events-none"
        ></div>

        <div
            class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-border-ui pb-8"
        >
            <div class="flex flex-row items-center gap-4 md:gap-6 flex-1">
                <button
                    onclick={onBack}
                    class="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center bg-bg-primary/50 border border-border-ui rounded-full text-text-secondary hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm"
                    aria-label="Voltar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h2
                    class="text-3xl md:text-5xl font-black text-text-primary leading-tight"
                >
                    {event.name}
                </h2>
            </div>
            <div
                class="px-6 py-3 bg-brand/10 border border-brand/20 text-brand rounded-2xl"
            >
                <span class="text-xs font-black uppercase tracking-widest"
                    >Inscrições Abertas</span
                >
            </div>
        </div>

        <div class="space-y-10 relative z-10">
            <div>
                <p
                    class="text-text-primary/80 leading-relaxed font-medium text-base md:text-lg"
                >
                    {event.description ||
                        "Nenhuma descrição detalhada disponível para este evento."}
                </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    class="p-6 bg-bg-primary/50 rounded-3xl border border-border-ui"
                >
                    <p
                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2"
                    >
                        Início
                    </p>
                    <p class="text-text-primary font-black text-lg">
                        {event.start_date
                            ? new Date(event.start_date).toLocaleDateString(
                                  "pt-BR",
                              )
                            : "Não definida"}
                    </p>
                </div>
                <div
                    class="p-6 bg-bg-primary/50 rounded-3xl border border-border-ui"
                >
                    <p
                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2"
                    >
                        Término
                    </p>
                    <p class="text-text-primary font-black text-lg">
                        {event.end_date
                            ? new Date(event.end_date).toLocaleDateString(
                                  "pt-BR",
                              )
                            : "Não definida"}
                    </p>
                </div>
                <div
                    class="p-6 bg-bg-primary/50 rounded-3xl border border-border-ui"
                >
                    <p
                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2"
                    >
                        Valor
                    </p>
                    <p class="text-brand font-black text-2xl">
                        {event.fee
                            ? `R$ ${parseFloat(event.fee).toFixed(2).replace(".", ",")}`
                            : "Gratuito"}
                    </p>
                </div>
                <div
                    class="p-6 bg-bg-primary/50 rounded-3xl border border-border-ui"
                >
                    <p
                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2"
                    >
                        Vagas
                    </p>
                    <p class="text-text-primary font-black text-lg">
                        {event.capacity || "Ilimitadas"}
                    </p>
                </div>
            </div>

            <div
                class="pt-10 flex flex-col sm:flex-row justify-end items-center gap-4"
            >
                <p class="text-xs text-text-secondary font-medium px-4">
                    Ao confirmar, você será redirecionado para suas inscrições.
                </p>
                <button
                    onclick={() => onSubscribe(event.id)}
                    class="w-full sm:w-auto px-10 py-5 bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:-translate-y-1 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Confirmar Inscrição
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
                    >
                </button>
            </div>
        </div>
    </div>
</div>
