<script>
    let { isAdmin = false, eventsCount = 0, activeTab = $bindable("") } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {#if isAdmin}
        <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm group hover:border-brand transition-all">
            <p class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Total Eventos</p>
            <p class="text-4xl font-black text-text-primary">{eventsCount}</p>
        </div>
        <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm">
            <p class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Usuários Ativos</p>
            <p class="text-4xl font-black text-text-primary">--</p>
        </div>
        <button class="bg-brand group hover:opacity-90 p-6 rounded-3xl shadow-xl shadow-brand/20 transition-all text-left">
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Ação Rápida</p>
            <p class="text-xl font-black text-white">+ Novo Acampamento</p>
        </button>
    {:else}
        <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm group hover:border-brand transition-all">
            <p class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Eventos Disponíveis</p>
            <p class="text-4xl font-black text-text-primary">{eventsCount}</p>
        </div>
        <button
            onclick={() => (activeTab = "subscriptions")}
            class="bg-brand group hover:opacity-90 p-6 rounded-3xl shadow-xl shadow-brand/20 transition-all text-left"
        >
            <p class="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Ação Rápida</p>
            <p class="text-xl text-white">Ver Inscrições</p>
        </button>
    {/if}
</div>
