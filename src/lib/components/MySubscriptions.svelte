<script>
    let {
        subscriptions = [],
        onGoToEvents,
        requestCancelSubscription
    } = $props();

    let mySubSearchQuery = $state("");
    let filteredMySubscriptions = $derived(
        subscriptions.filter(
            (sub) =>
                sub.event?.name &&
                sub.event.name.toLowerCase().includes(mySubSearchQuery.toLowerCase()),
        ),
    );
</script>

<div class="mb-6">
    <h2 class="text-3xl font-black mb-6">Minhas Inscrições</h2>
    <input
        type="text"
        bind:value={mySubSearchQuery}
        placeholder="Pesquisar inscrições por nome do evento..."
        class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
    />
</div>
{#if subscriptions.length === 0}
    <div class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
        <p class="text-text-secondary text-xs font-bold mb-6">
            Nenhuma inscrição encontrada
        </p>
        <button
            onclick={onGoToEvents}
            class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
        >Ver Eventos</button>
    </div>
{:else if filteredMySubscriptions.length === 0}
    <div class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
        <p class="text-text-secondary text-xs font-bold mb-6">Nenhuma inscrição corresponde à pesquisa.</p>
    </div>
{:else}
    <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-text-primary">
        {#each filteredMySubscriptions as sub}
            <div class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1">
                        {sub.event?.name || "Inscrição"}
                    </h3>
                    <div class="flex items-center gap-2">
                        <div class="px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full">
                            <span class="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                {sub.event?.eventable_type === "App\\Models\\Festival" ? "Festival" : "Acampamento"}
                            </span>
                        </div>
                    </div>
                </div>
                <p class="text-text-secondary text-sm leading-relaxed mb-4">
                    <strong>Status:</strong>
                    {sub.paid_the_fee ? "Confirmado" : "Pagamento pendente"} <br />
                    <strong>Tipo:</strong>
                    {sub.subscription_type} <br />
                    <strong>Sorteado:</strong>
                    {sub.was_selected ? "Sim" : "Não"}
                </p>
                <div class="flex justify-end items-center pt-6 border-t border-border-ui mt-4">
                    <button
                        onclick={() => requestCancelSubscription(sub.id)}
                        class="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider"
                    >
                        Cancelar Inscrição
                    </button>
                </div>
            </div>
        {/each}
    </div>
{/if}
