<script>
    import { onMount } from 'svelte';

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    let token = "";

    let activities = $state([]);
    let selectedActivityId = $state("");
    
    let reviews = $state([]);
    let loading = $state(false);
    
    let selectedReview = $state(null); // The one currently being viewed in detail

    onMount(() => {
        if (typeof window !== "undefined") {
            token = sessionStorage.getItem("token") || localStorage.getItem("token");
            fetchActivities();
        }
    });

    async function fetchActivities() {
        try {
            const res = await fetch(`${API_URL}/v1/activities`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            const data = await res.json();
            activities = data.data || [];
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchReviews() {
        if (!selectedActivityId) {
            reviews = [];
            return;
        }
        try {
            loading = true;
            const res = await fetch(`${API_URL}/v1/reviews?activity_id=${selectedActivityId}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            const data = await res.json();
            reviews = data.data || [];
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function approveRegistration(id) {
        if (!confirm("Confirmar a inscrição deste campista?")) return;
        try {
            const res = await fetch(`${API_URL}/v1/reviews/${id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            if (res.ok) {
                selectedReview = null;
                await fetchReviews();
            } else {
                alert("Erro ao aprovar a inscrição.");
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function rejectRegistration(id) {
        if (!confirm("Tem certeza que deseja REJEITAR a inscrição deste campista? Esta ação é irreversível.")) return;
        try {
            const res = await fetch(`${API_URL}/v1/reviews/${id}/reject`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            if (res.ok) {
                selectedReview = null;
                await fetchReviews();
            } else {
                alert("Erro ao rejeitar a inscrição.");
            }
        } catch (err) {
            console.error(err);
        }
    }

    $effect(() => {
        fetchReviews(); // Re-fetch when selectedActivityId changes
    });
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 class="text-3xl font-black">Avaliar Inscrições</h2>
    </div>

    {#if !selectedActivityId}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {#each activities as act}
                <div 
                    class="bg-bg-secondary p-8 rounded-[2.5rem] border border-border-ui shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
                    onclick={() => selectedActivityId = act.id}
                >
                    <h3 class="text-xl font-black mb-2 group-hover:text-brand transition-colors">{act.name}</h3>
                    <p class="text-text-secondary text-sm font-bold uppercase tracking-widest">{act.category?.name || 'Sem categoria'}</p>
                    <div class="mt-6 flex justify-end">
                        <span class="text-brand font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">Ver Inscrições →</span>
                    </div>
                </div>
            {/each}
            {#if activities.length === 0}
                <div class="col-span-full text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
                    <p class="text-text-secondary text-xs font-bold">Nenhuma atividade disponível.</p>
                </div>
            {/if}
        </div>
    {:else}
        <div class="mb-6">
            <button
                onclick={() => selectedActivityId = ""}
                class="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-bold text-sm uppercase tracking-wider"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Voltar aos Acampamentos
            </button>
        </div>

        {#if loading}
            <div class="flex justify-center items-center py-24">
                <div class="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        {:else if reviews.length === 0}
            <div class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
                <p class="text-text-secondary text-xs font-bold">Nenhum campista aguardando avaliação no momento.</p>
            </div>
        {:else}
            <div class="space-y-4">
                {#each reviews as review}
                    <div 
                        class="bg-bg-secondary border border-border-ui p-6 rounded-[2rem] hover:shadow-xl hover:border-brand transition-all group relative cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4" 
                        onclick={() => selectedReview = review}
                    >
                        <div>
                            <h3 class="text-xl font-black group-hover:text-brand transition-colors">
                                {review.user?.name || "Usuário Desconhecido"}
                            </h3>
                            <p class="text-text-secondary text-sm mt-1">
                                {review.user?.email} • {review.user?.phone || 'Telefone não informado'}
                            </p>
                        </div>
                        <button class="px-6 py-3 bg-bg-primary text-brand font-black text-xs uppercase tracking-widest rounded-xl border border-border-ui group-hover:bg-brand group-hover:text-white transition-colors">
                            Ver Respostas
                        </button>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>

{#if selectedReview}
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-bg-primary border border-border-ui w-full max-w-3xl rounded-[3rem] p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            <div class="flex justify-between items-start border-b border-border-ui pb-6 mb-6">
                <div>
                    <h3 class="text-2xl font-black mb-1">{selectedReview.user?.name}</h3>
                    <p class="text-text-secondary text-sm font-bold uppercase tracking-widest">Avaliação de Anamnese</p>
                </div>
                <button onclick={() => selectedReview = null} class="text-text-secondary hover:text-brand transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div class="space-y-6 mb-8">
                {#each selectedReview.answers as ans}
                    <div class="bg-bg-secondary p-5 rounded-2xl border border-border-ui">
                        <p class="text-xs text-text-secondary uppercase tracking-widest font-bold mb-2">Pergunta</p>
                        <p class="text-lg font-black mb-4">{ans.question?.text || 'Pergunta não encontrada'}</p>
                        <div class="bg-bg-primary p-4 rounded-xl border border-border-ui">
                            <p class="text-text-primary whitespace-pre-wrap">{ans.answer || 'Nenhuma resposta'}</p>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-ui">
                <button
                    onclick={() => approveRegistration(selectedReview.id)}
                    class="flex-1 px-6 py-4 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    Aprovar Inscrição
                </button>
                <button
                    onclick={() => rejectRegistration(selectedReview.id)}
                    class="flex-1 px-6 py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    Rejeitar
                </button>
                <button
                    onclick={() => selectedReview = null}
                    class="px-8 py-4 bg-bg-secondary text-text-primary font-black uppercase tracking-widest rounded-2xl border border-border-ui hover:bg-border-ui transition-all"
                >
                    Voltar
                </button>
            </div>

        </div>
    </div>
{/if}
