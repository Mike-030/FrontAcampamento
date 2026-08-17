<script>
    import { onMount } from "svelte";

    let { token } = $props();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    let categories = $state([]);
    let questions = $state([]);
    let loading = $state(true);

    // Form state
    let isEditing = $state(false);
    let currentQuestionId = $state(null);
    let formText = $state("");
    let formOrder = $state(0);
    let formType = $state("Aberta");
    let formOptions = $state([]);

    // Linking state
    let selectedCategoryId = $state("");
    let linkForm = $state({ question_id: "" });

    /** @type {{ show: boolean, type: string, message: string }} */
    let notification = $state({ show: false, type: "", message: "" });

    /**
     * @param {string} type
     * @param {string} message
     */
    function showNotification(type, message) {
        notification = { show: true, type, message };
        setTimeout(() => {
            notification.show = false;
        }, 3000);
    }

    onMount(() => {
        if (typeof window !== "undefined") {
            fetchData();
        }
    });

    async function fetchData() {
        try {
            loading = true;
            const [catRes, qRes] = await Promise.all([
                fetch(`${API_URL}/v1/categories`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }),
                fetch(`${API_URL}/v1/questions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }),
            ]);

            const catData = await catRes.json();
            const qData = await qRes.json();

            categories = Array.isArray(catData) ? catData : (catData.data || []);
            questions = qData.data || [];
        } catch (err) {
            console.error("Error fetching data:", err);
            showNotification("error", "Erro ao carregar dados.");
        } finally {
            loading = false;
        }
    }

    function editQuestion(q) {
        isEditing = true;
        currentQuestionId = q.id;
        formText = q.text;
        formOrder = q.order;
        formType = q.type || "Aberta";
        formOptions = q.options ? q.options.map(o => ({text: o.text})) : [];
    }

    function resetForm() {
        isEditing = false;
        currentQuestionId = null;
        formText = "";
        formOrder = 0;
        formType = "Aberta";
        formOptions = [];
    }

    function addOption() {
        formOptions = [...formOptions, { text: "" }];
    }

    function removeOption(idx) {
        formOptions = formOptions.filter((_, i) => i !== idx);
    }

    async function saveQuestion(e) {
        e.preventDefault();
        try {
            const url = isEditing
                ? `${API_URL}/v1/questions/${currentQuestionId}`
                : `${API_URL}/v1/questions`;
            const method = isEditing ? "PUT" : "POST";

            const payload = {
                text: formText,
                order: formOrder || 0,
                type: formType,
                section_id: 1, // default section
                options: formType.startsWith('Fechada') ? formOptions : []
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showNotification(
                    "success",
                    `Pergunta ${isEditing ? "atualizada" : "criada"} com sucesso!`,
                );
                await fetchData();
                resetForm();
            } else {
                const errorText = await res.text();
                console.error("Save error:", errorText);
                showNotification(
                    "error",
                    "Erro ao salvar pergunta: " + errorText,
                );
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }

    async function deleteQuestion(id) {
        if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;
        try {
            const res = await fetch(`${API_URL}/v1/questions/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                showNotification("success", "Pergunta excluída com sucesso!");
                await fetchData();
            } else {
                showNotification("error", "Erro ao excluir pergunta.");
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }

    async function linkQuestionToCategory() {
        if (!selectedCategoryId || !linkForm.question_id) {
            showNotification("error", "Selecione a categoria e a pergunta.");
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/v1/categories/${selectedCategoryId}/questions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        question_id: linkForm.question_id,
                    }),
                },
            );

            if (res.ok) {
                showNotification("success", "Pergunta vinculada com sucesso!");
                await fetchData();
                linkForm.question_id = "";
            } else {
                const errData = await res.json();
                showNotification(
                    "error",
                    errData.message || "Erro ao vincular pergunta.",
                );
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }

    async function unlinkQuestionFromCategory(questionId) {
        if (!selectedCategoryId) return;
        if (
            !confirm(
                "Tem certeza que deseja desvincular esta pergunta da categoria atual?",
            )
        )
            return;

        try {
            const res = await fetch(
                `${API_URL}/v1/categories/${selectedCategoryId}/questions/${questionId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.ok) {
                showNotification(
                    "success",
                    "Pergunta desvinculada com sucesso!",
                );
                await fetchData();
            } else {
                showNotification("error", "Erro ao desvincular pergunta.");
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erro de conexão.");
        }
    }
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 class="text-3xl font-black mb-6">Gerenciamento de Perguntas</h2>
    </div>

    {#if notification.show}
        <div
            class="p-4 rounded-xl border font-medium text-sm {notification.type ===
            'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'}"
        >
            {notification.message}
        </div>
    {/if}

    {#if loading}
        <div class="flex justify-center items-center py-24">
            <div
                class="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Coluna Esquerda: Gerenciamento de Perguntas -->
            <div class="space-y-6">
                <div
                    class="bg-bg-secondary border border-border-ui rounded-[2rem] p-6 shadow-xl"
                >
                    <h3 class="text-xl font-bold mb-4">
                        {isEditing ? "Editar Pergunta" : "Nova Pergunta"}
                    </h3>

                    <form onsubmit={saveQuestion} class="space-y-4">
                        <div>
                            <label
                                class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                            >
                                Pergunta
                            </label>
                            <textarea
                                required
                                bind:value={formText}
                                rows="3"
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                            ></textarea>
                        </div>
                        <div>
                            <label
                                class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                            >
                                Ordem
                            </label>
                            <input
                                type="number"
                                bind:value={formOrder}
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                            />
                        </div>
                        <div>
                            <label
                                class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                            >
                                Tipo
                            </label>
                            <select
                                bind:value={formType}
                                class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                            >
                                <option value="Aberta">Aberta</option>
                                <option value="Fechada (Única Escolha)">Fechada (Única Escolha)</option>
                                <option value="Fechada (Múltipla Escolha)">Fechada (Múltipla Escolha)</option>
                            </select>
                        </div>
                        {#if formType.startsWith('Fechada')}
                            <div class="space-y-3 border border-border-ui p-4 rounded-xl bg-bg-primary/50">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-bold text-text-secondary uppercase tracking-wider">
                                        Opções de Resposta
                                    </label>
                                    <button
                                        type="button"
                                        onclick={addOption}
                                        class="text-brand text-sm font-bold bg-brand/10 px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors"
                                    >
                                        + Adicionar Opção
                                    </button>
                                </div>
                                
                                {#if formOptions.length === 0}
                                    <p class="text-xs text-text-secondary text-center py-2">Nenhuma opção cadastrada. Adicione opções para esta pergunta fechada.</p>
                                {/if}
                                
                                {#each formOptions as option, idx}
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="text"
                                            required
                                            bind:value={formOptions[idx].text}
                                            placeholder="Texto da opção..."
                                            class="flex-1 bg-bg-primary border border-border-ui rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onclick={() => removeOption(idx)}
                                            class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                            title="Remover opção"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                        <div class="pt-4 flex gap-3">
                            <button
                                type="submit"
                                class="flex-1 bg-brand text-white font-black uppercase tracking-widest py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all"
                            >
                                {isEditing ? "Salvar" : "Criar"}
                            </button>
                            {#if isEditing}
                                <button
                                    type="button"
                                    onclick={resetForm}
                                    class="px-6 bg-bg-primary text-text-secondary font-black uppercase tracking-widest py-3 rounded-xl border-2 border-border-ui hover:bg-border-ui hover:text-text-primary transition-all"
                                >
                                    Cancelar
                                </button>
                            {/if}
                        </div>
                    </form>
                </div>

                <div class="space-y-4">
                    {#if questions.length === 0}
                        <div
                            class="bg-bg-secondary p-8 rounded-[2rem] border border-border-ui text-center"
                        >
                            <p
                                class="text-text-secondary font-bold uppercase tracking-widest text-sm"
                            >
                                Nenhuma pergunta cadastrada.
                            </p>
                        </div>
                    {:else}
                        <ul class="space-y-3">
                            {#each questions as q}
                                <li
                                    class="flex flex-col gap-2 p-4 bg-bg-primary/50 border border-border-ui rounded-xl"
                                >
                                    <div
                                        class="flex items-start justify-between gap-4"
                                    >
                                        <div class="flex-1">
                                            <p
                                                class="font-bold text-text-primary text-sm"
                                            >
                                                {q.text}
                                            </p>
                                            <p
                                                class="text-[10px] text-text-secondary uppercase tracking-widest mt-1"
                                            >
                                                Ordem: {q.order} | Tipo: {q.type || "Aberta"}
                                            </p>
                                        </div>
                                        <div
                                            class="flex items-center gap-2 flex-shrink-0"
                                        >
                                            <button
                                                onclick={() => editQuestion(q)}
                                                class="p-2 bg-text-primary/5 text-brand rounded-lg hover:bg-brand/10 transition-colors"
                                                title="Editar"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    ><path
                                                        d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                                                    /></svg
                                                >
                                            </button>
                                            <button
                                                onclick={() =>
                                                    deleteQuestion(q.id)}
                                                class="p-2 bg-text-primary/5 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                                title="Excluir"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    ><path d="M3 6h18" /><path
                                                        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                                                    /><path
                                                        d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                                    /></svg
                                                >
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>

            <!-- Coluna Direita: Vinculação por Categoria -->
            <div class="space-y-6">
                <div
                    class="bg-bg-secondary border border-border-ui rounded-[2rem] p-6 shadow-xl"
                >
                    <h3 class="text-xl font-bold mb-4">
                        Vincular Perguntas a Categoria
                    </h3>

                    <div class="mb-6">
                        <label
                            class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                        >
                            Selecione a Categoria (Acampamento)
                        </label>
                        <select
                            bind:value={selectedCategoryId}
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                        >
                            <option value="">Selecione...</option>
                            {#each categories.filter((c) => c.type === "Acampamento") as category}
                                <option value={category.id}
                                    >{category.name}</option
                                >
                            {/each}
                        </select>
                    </div>

                    {#if selectedCategoryId}
                        {@const currentCategory = categories.find(
                            (c) => c.id == selectedCategoryId,
                        )}

                        <form
                            onsubmit={(e) => {
                                e.preventDefault();
                                linkQuestionToCategory();
                            }}
                            class="flex items-end gap-3 mb-6 p-4 bg-brand/5 border border-brand/10 rounded-xl"
                        >
                            <div class="flex-1">
                                <label
                                    class="block text-xs font-bold text-text-secondary mb-1 uppercase"
                                    >Pergunta</label
                                >
                                <select
                                    bind:value={linkForm.question_id}
                                    required
                                    class="w-full bg-bg-primary border border-border-ui rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                                >
                                    <option value="">Selecione...</option>
                                    {#each questions as q}
                                        <option value={q.id}>
                                            {q.text.length > 50
                                                ? q.text.substring(0, 50) +
                                                  "..."
                                                : q.text}
                                        </option>
                                    {/each}
                                </select>
                            </div>
                            <button
                                type="submit"
                                class="bg-brand text-white px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all text-sm h-[38px]"
                            >
                                Vincular
                            </button>
                        </form>

                        <div>
                            <h4
                                class="text-sm font-bold text-text-secondary uppercase tracking-widest mb-3"
                            >
                                Perguntas Vinculadas
                            </h4>
                            {#if currentCategory?.questions && currentCategory.questions.length > 0}
                                <ul class="space-y-3">
                                    {#each currentCategory.questions as lq}
                                        <li
                                            class="flex items-center justify-between p-3 bg-bg-primary/50 border border-border-ui rounded-xl"
                                        >
                                            <div class="flex-1 pr-4">
                                                <p
                                                    class="font-bold text-text-primary text-sm"
                                                >
                                                    {lq.text.length > 50
                                                        ? lq.text.substring(
                                                              0,
                                                              50,
                                                          ) + "..."
                                                        : lq.text}
                                                </p>
                                                <p
                                                    class="text-[10px] text-text-secondary uppercase tracking-widest mt-1"
                                                >
                                                    Ordem: {lq.order} | Tipo: {lq.type || "Aberta"}
                                                </p>
                                            </div>
                                            <button
                                                onclick={() =>
                                                    unlinkQuestionFromCategory(
                                                        lq.id,
                                                    )}
                                                class="p-2 bg-text-primary/5 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                                                title="Desvincular"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    ><path
                                                        d="M18 6 6 18"
                                                    /><path
                                                        d="m6 6 12 12"
                                                    /></svg
                                                >
                                            </button>
                                        </li>
                                    {/each}
                                </ul>
                            {:else}
                                <p class="text-xs text-text-secondary">
                                    Nenhuma pergunta vinculada a esta categoria.
                                </p>
                            {/if}
                        </div>
                    {:else}
                        <div
                            class="text-center p-6 border border-dashed border-border-ui rounded-xl"
                        >
                            <p class="text-text-secondary text-sm">
                                Selecione uma categoria para gerenciar suas
                                perguntas.
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
