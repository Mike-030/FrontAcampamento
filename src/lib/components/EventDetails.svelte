<script>
    let { event, onSubscribe, onBack } = $props();

    let endDate = $derived.by(() => {
        let date = event.start_date ? new Date(event.start_date) : null;
        if (date && event.duration_days) {
            date.setDate(date.getDate() + event.duration_days);
        }
        return date;
    });

    let subscriptionTypeText = $derived.by(() => {
        let text = "Inscrições Abertas";
        if (event.eventable) {
            const now = new Date();
            const camperStart = event.eventable.camper_registration_start_date
                ? new Date(event.eventable.camper_registration_start_date)
                : null;
            const camperEnd = event.eventable.camper_registration_end_date
                ? new Date(event.eventable.camper_registration_end_date)
                : null;

            const servantStart = event.eventable.servant_registration_start_date
                ? new Date(event.eventable.servant_registration_start_date)
                : null;
            const servantEnd = event.eventable.servant_registration_end_date
                ? new Date(event.eventable.servant_registration_end_date)
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
                <div class="flex flex-row items-center gap-4 md:gap-6 flex-1">
                    <h2
                        class="text-3xl font-black text-text-primary leading-tight"
                    >
                        {event.name}
                    </h2>
                </div>
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

            <!-- Botões Inferiores -->
            <div
                class="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-border-ui"
            >
                <div class="flex flex-row flex-wrap gap-4 w-full md:w-auto">
                    {#if event.eventable?.notice}
                        <a
                            href={event.eventable.notice}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 md:flex-none text-center px-6 py-4 bg-bg-primary border border-border-ui text-text-primary rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all shadow-sm"
                        >
                            Edital
                        </a>
                    {/if}
                    {#if event.eventable?.term}
                        <a
                            href={event.eventable.term}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 md:flex-none text-center px-6 py-4 bg-bg-primary border border-border-ui text-text-primary rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all shadow-sm"
                        >
                            Termos
                        </a>
                    {/if}
                </div>

                <button
                    onclick={() => onSubscribe(event.id)}
                    class="w-full md:w-auto px-10 py-5 bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:-translate-y-1 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Se Inscrever
                </button>
            </div>
        </div>
    </div>
</div>
