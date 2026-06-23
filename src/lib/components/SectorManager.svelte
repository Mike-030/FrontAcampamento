<script>
    import { onMount } from "svelte";

    let { token } = $props();

    /** @type {any[]} */
    let sectors = $state([]);
    /** @type {any[]} */
    let categories = $state([]);
    let loading = $state(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    // Formulário de Setor
    let sectorForm = $state({
        id: null,
        name: "",
        place: "Interno",
    });

    // Estado da vinculação
    let selectedCategoryId = $state("");

    // Formulário de Vínculo
    let linkForm = $state({
        sector_id: "",
        base_vacancies: 0,
    });

    /** @type {{ show: boolean, type: string, message: string }} */
    let notification = $state({ show: false, type: "", message: "" });

    onMount(async () => {
        await fetchData();
    });

    async function fetchData() {
        loading = true;
        try {
            const [sectorsRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/v1/sectors`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/v1/categories`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (sectorsRes.ok) {
                const sectorsData = await sectorsRes.json();
                sectors = sectorsData.data || [];
            }
            if (categoriesRes.ok) {
                categories = await categoriesRes.json();
            }
        } catch (error) {
            showNotification("error", "Erro ao carregar dados.");
        } finally {
            loading = false;
        }
    }

    async function saveSector() {
        try {
            const isEditing = !!sectorForm.id;
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${API_URL}/v1/sectors/${sectorForm.id}`
                : `${API_URL}/v1/sectors`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sectorForm),
            });

            if (res.ok) {
                showNotification(
                    "success",
                    `Setor ${isEditing ? "atualizado" : "criado"} com sucesso!`,
                );
                sectorForm = { id: null, name: "", place: "Interno" };
                await fetchData();
            } else {
                showNotification("error", "Erro ao salvar setor.");
            }
        } catch (error) {
            showNotification("error", "Erro de conexão.");
        }
    }

    /** @param {any} sector */
    function editSector(sector) {
        sectorForm = { ...sector };
    }

    /** @param {number} id */
    async function deleteSector(id) {
        if (!confirm("Tem certeza que deseja excluir este setor?")) return;

        try {
            const res = await fetch(`${API_URL}/v1/sectors/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showNotification("success", "Setor excluído com sucesso!");
                await fetchData();
            } else {
                showNotification("error", "Erro ao excluir setor.");
            }
        } catch (error) {
            showNotification("error", "Erro de conexão.");
        }
    }

    async function linkSectorToCategory() {
        if (!selectedCategoryId || !linkForm.sector_id) {
            showNotification("error", "Selecione a categoria e o setor.");
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/v1/categories/${selectedCategoryId}/sectors`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        sector_id: linkForm.sector_id,
                        base_vacancies: linkForm.base_vacancies,
                        raffle_vacancies: linkForm.base_vacancies,
                    }),
                },
            );

            if (res.ok) {
                showNotification("success", "Setor vinculado com sucesso!");
                linkForm = { sector_id: "", base_vacancies: 0 };
                await fetchData();
            } else {
                const errData = await res.json();
                showNotification(
                    "error",
                    errData.message || "Erro ao vincular setor.",
                );
            }
        } catch (error) {
            showNotification("error", "Erro de conexão.");
        }
    }

    /** @param {number} sectorId */
    async function unlinkSector(sectorId) {
        if (!selectedCategoryId) return;
        if (
            !confirm(
                "Tem certeza que deseja desvincular este setor desta categoria?",
            )
        )
            return;

        try {
            const res = await fetch(
                `${API_URL}/v1/categories/${selectedCategoryId}/sectors/${sectorId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.ok) {
                showNotification("success", "Setor desvinculado com sucesso!");
                await fetchData();
            } else {
                showNotification("error", "Erro ao desvincular setor.");
            }
        } catch (error) {
            showNotification("error", "Erro de conexão.");
        }
    }

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
</script>

<div class="space-y-8">
    <div>
        <h2 class="text-3xl font-black mb-6">Gerenciamento Setores</h2>
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Coluna Esquerda: Gerenciamento de Setores -->
        <div class="space-y-6">
            <div
                class="bg-bg-secondary border border-border-ui rounded-[2rem] p-6 shadow-xl"
            >
                <h3 class="text-xl font-bold mb-4">
                    {sectorForm.id ? "Editar Setor" : "Novo Setor"}
                </h3>

                <form
                    onsubmit={(e) => {
                        e.preventDefault();
                        saveSector();
                    }}
                    class="space-y-4"
                >
                    <div>
                        <label
                            for="name"
                            class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                            >Nome do Setor</label
                        >
                        <input
                            type="text"
                            id="name"
                            bind:value={sectorForm.name}
                            required
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                            placeholder="Ex: Cozinha, Liturgia..."
                        />
                    </div>
                    <div>
                        <label
                            for="place"
                            class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                            >Local de Atuação</label
                        >
                        <select
                            id="place"
                            bind:value={sectorForm.place}
                            class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                        >
                            <option value="Interno">Interno</option>
                            <option value="Externo">Externo</option>
                        </select>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button
                            type="submit"
                            class="flex-1 bg-brand text-white py-3 rounded-xl font-bold hover:brightness-110 transition-all"
                        >
                            {sectorForm.id ? "Atualizar Setor" : "Criar Setor"}
                        </button>
                        {#if sectorForm.id}
                            <button
                                type="button"
                                onclick={() =>
                                    (sectorForm = {
                                        id: null,
                                        name: "",
                                        place: "Interno",
                                    })}
                                class="px-6 bg-text-primary/5 text-text-secondary rounded-xl font-bold hover:bg-text-primary/10 transition-all"
                            >
                                Cancelar
                            </button>
                        {/if}
                    </div>
                </form>
            </div>

            <div
                class="bg-bg-secondary border border-border-ui rounded-[2rem] p-6 shadow-xl"
            >
                <h3 class="text-xl font-bold mb-4">Setores Cadastrados</h3>
                {#if loading}
                    <p class="text-text-secondary text-sm">Carregando...</p>
                {:else if sectors.length === 0}
                    <p class="text-text-secondary text-sm">
                        Nenhum setor cadastrado.
                    </p>
                {:else}
                    <ul class="space-y-3">
                        {#each sectors as sector}
                            <li
                                class="flex items-center justify-between p-3 bg-bg-primary/50 border border-border-ui rounded-xl"
                            >
                                <div>
                                    <p class="font-bold text-text-primary">
                                        {sector.name}
                                    </p>
                                    <p class="text-xs text-text-secondary">
                                        {sector.place}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        onclick={() => editSector(sector)}
                                        class="p-2 bg-text-primary/5 text-brand rounded-lg hover:bg-brand/10 transition-colors"
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
                                        onclick={() => deleteSector(sector.id)}
                                        class="p-2 bg-text-primary/5 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
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
                    Vincular Setores a Categoria
                </h3>

                <div class="mb-6">
                    <label
                        for="category"
                        class="block text-sm font-bold text-text-secondary mb-1 uppercase tracking-wider"
                        >Selecione a Categoria (Acampamento)</label
                    >
                    <select
                        id="category"
                        bind:value={selectedCategoryId}
                        class="w-full bg-bg-primary border border-border-ui rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
                    >
                        <option value="">Selecione...</option>
                        {#each categories.filter((c) => c.type === "Acampamento") as category}
                            <option value={category.id}>{category.name}</option>
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
                            linkSectorToCategory();
                        }}
                        class="flex items-end gap-3 mb-6 p-4 bg-brand/5 border border-brand/10 rounded-xl"
                    >
                        <div class="flex-1">
                            <label
                                for="linkSector"
                                class="block text-xs font-bold text-text-secondary mb-1 uppercase"
                                >Setor</label
                            >
                            <select
                                id="linkSector"
                                bind:value={linkForm.sector_id}
                                required
                                class="w-full bg-bg-primary border border-border-ui rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                            >
                                <option value="">Selecione...</option>
                                {#each sectors as sector}
                                    <option value={sector.id}
                                        >{sector.name}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="w-24">
                            <label
                                for="baseVacancies"
                                class="block text-xs font-bold text-text-secondary mb-1 uppercase"
                                >Vagas</label
                            >
                            <input
                                type="number"
                                id="baseVacancies"
                                bind:value={linkForm.base_vacancies}
                                min="0"
                                required
                                class="w-full bg-bg-primary border border-border-ui rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
                            />
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
                            Setores Vinculados
                        </h4>
                        {#if currentCategory?.sectors && currentCategory.sectors.length > 0}
                            <ul class="space-y-2">
                                {#each currentCategory.sectors as sector}
                                    <li
                                        class="flex items-center justify-between p-3 bg-bg-primary/50 border border-border-ui rounded-xl"
                                    >
                                        <div>
                                            <p
                                                class="font-bold text-sm text-text-primary"
                                            >
                                                {sector.name}
                                            </p>
                                            <p
                                                class="text-[10px] text-text-secondary uppercase"
                                            >
                                                Vagas Padrão: {sector.pivot
                                                    .base_vacancies}
                                            </p>
                                        </div>
                                        <button
                                            onclick={() =>
                                                unlinkSector(sector.id)}
                                            class="p-1.5 bg-text-primary/5 text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                                            title="Desvincular"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><path d="M18 6 6 18" /><path
                                                    d="m6 6 12 12"
                                                /></svg
                                            >
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {:else}
                            <p class="text-text-secondary text-sm">
                                Nenhum setor vinculado a esta categoria.
                            </p>
                        {/if}
                    </div>
                {:else}
                    <div
                        class="text-center p-6 border border-dashed border-border-ui rounded-xl"
                    >
                        <p class="text-text-secondary text-sm">
                            Selecione uma categoria para gerenciar seus setores.
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
