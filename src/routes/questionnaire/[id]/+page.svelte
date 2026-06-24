<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    let token = "";

    let loading = true;
    let submitting = false;
    let error = "";
    
    let preRegistrationId = $page.params.id;
    let preRegistration = null;
    let questions = [];
    
    // Store answers as { question_id: answer_value }
    let formData = {};

    onMount(() => {
        if (typeof window !== "undefined") {
            token = sessionStorage.getItem("token") || localStorage.getItem("token");
            if (!token) {
                goto("/login");
                return;
            }
            fetchData();
        }
    });

    async function fetchData() {
        try {
            loading = true;
            // Fetch subscription details
            const subRes = await fetch(`${API_URL}/v1/subscriptions/${preRegistrationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!subRes.ok) throw new Error("Erro ao buscar detalhes da inscrição.");
            const subData = await subRes.json();
            preRegistration = subData.data;

            if (!preRegistration.event || !preRegistration.event.category) {
                throw new Error("A atividade desta inscrição não possui uma categoria com perguntas.");
            }

            const categoryId = preRegistration.event.category.id;

            // Fetch questions for this category
            const qRes = await fetch(`${API_URL}/v1/questions?category_id=${categoryId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!qRes.ok) throw new Error("Erro ao buscar perguntas.");
            const qData = await qRes.json();
            questions = qData.data || [];
            
            // Initialize formData
            questions.forEach(q => {
                formData[q.id] = q.type === 'checkbox' ? [] : "";
            });

        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            submitting = true;
            error = "";

            const answersArray = questions.map(q => {
                let ans = formData[q.id];
                if (Array.isArray(ans)) {
                    ans = ans.join(', '); // If checkbox, join multiple answers
                }
                return {
                    question_id: q.id,
                    answer: String(ans)
                };
            });

            const res = await fetch(`${API_URL}/v1/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    pre_registration_id: parseInt(preRegistrationId),
                    answers: answersArray
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erro ao enviar respostas.");
            }

            alert("Respostas enviadas com sucesso! Aguarde a avaliação dos conselheiros.");
            goto("/dashboard");
            
        } catch (err) {
            error = err.message;
        } finally {
            submitting = false;
        }
    }

    function handleCheckbox(questionId, value, checked) {
        if (!formData[questionId]) formData[questionId] = [];
        if (checked) {
            formData[questionId] = [...formData[questionId], value];
        } else {
            formData[questionId] = formData[questionId].filter(v => v !== value);
        }
    }
</script>

<div class="min-h-screen bg-bg-primary text-text-primary p-6 lg:p-12 font-sans">
    <div class="max-w-3xl mx-auto">
        <button
            onclick={() => goto("/dashboard")}
            class="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-bold text-sm uppercase tracking-wider mb-8"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Voltar
        </button>

        <h1 class="text-4xl font-black mb-2">Formulário de Inscrição</h1>
        <p class="text-text-secondary font-bold mb-10">Responda o questionário abaixo para prosseguir com a confirmação da sua inscrição.</p>

        {#if loading}
            <div class="flex justify-center items-center py-24">
                <div class="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        {:else if error}
            <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl mb-6 font-bold">
                {error}
            </div>
        {:else if questions.length === 0}
            <div class="bg-bg-secondary p-8 rounded-3xl text-center border-2 border-dashed border-border-ui">
                <p class="text-text-secondary font-bold">Nenhuma pergunta configurada para este acampamento.</p>
                <button
                    onclick={() => goto("/dashboard")}
                    class="mt-4 px-6 py-3 bg-brand text-white font-bold rounded-xl"
                >Voltar</button>
            </div>
        {:else}
            <form onsubmit={handleSubmit} class="space-y-8 bg-bg-secondary p-8 md:p-12 rounded-[3rem] shadow-xl border border-border-ui">
                {#each questions as q}
                    <div class="space-y-3">
                        <label class="block text-lg font-black text-text-primary">
                            {q.text}
                            <span class="text-brand">*</span>
                        </label>

                        <textarea 
                            required 
                            bind:value={formData[q.id]}
                            rows="4"
                            class="w-full bg-bg-primary border-2 border-border-ui rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none transition-colors"
                        ></textarea>
                    </div>
                {/each}

                <div class="pt-6 border-t border-border-ui flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        class="px-8 py-4 bg-brand text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Enviando...' : 'Enviar Respostas'}
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
