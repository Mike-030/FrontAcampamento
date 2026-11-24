<script>
    import { onMount } from "svelte";

    let { token, showModal, closeModal } = $props();

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @type {any[]} */
    let products = $state([]);
    let loading = $state(true);
    let saving = $state(false);
    let uploadingImage = $state(false);
    let searchQuery = $state("");

    /** @type {HTMLInputElement | null} */
    let fileInputRef = $state(null);

    // Formulário de criação / edição
    let form = $state({
        id: /** @type {number | null} */ (null),
        name: "",
        image: "",
        price: "",
    });

    /** @type {Record<string, boolean>} */
    let failedImages = $state({});
    let previewFailed = $state(false);

    $effect(() => {
        const _url = form.image;
        previewFailed = false;
    });

    let previewSrc = $derived.by(() => {
        const raw = form.image.trim();
        if (
            !previewFailed &&
            raw &&
            (raw.startsWith("http://") ||
                raw.startsWith("https://") ||
                raw.startsWith("/") ||
                raw.startsWith("data:image/"))
        ) {
            return raw;
        }
        return "";
    });

    let filteredProducts = $derived(
        products.filter((p) =>
            String(p.name || "")
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase()),
        ),
    );

    onMount(() => {
        fetchProducts();
    });

    async function fetchProducts() {
        try {
            loading = true;
            const res = await fetch(`${API_URL}/v1/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                const payload = await res.json();
                products = payload.data || [];
            } else {
                showModal("error", "Erro ao carregar a lista de produtos.");
            }
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        } finally {
            loading = false;
        }
    }

    /** @param {Event} e */
    async function handleImageFileChange(e) {
        const input = /** @type {HTMLInputElement} */ (e.currentTarget);
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showModal("error", "Selecione um arquivo de imagem válido.");
            input.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showModal("error", "A imagem deve ter no máximo 5 MB.");
            input.value = "";
            return;
        }

        uploadingImage = true;
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch(`${API_URL}/v1/products/upload-image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                form.image = data.url || "";
            } else {
                const errData = await res.json().catch(() => ({}));
                const firstErr = errData.errors
                    ? Object.values(errData.errors)[0]?.[0]
                    : errData.message;
                showModal(
                    "error",
                    firstErr || "Não foi possível enviar a imagem.",
                );
            }
        } catch (err) {
            console.error("Erro ao fazer upload de imagem:", err);
            showModal("error", "Erro de conexão ao enviar a imagem.");
        } finally {
            uploadingImage = false;
            input.value = "";
        }
    }

    /** @param {SubmitEvent} e */
    async function handleSave(e) {
        e.preventDefault();

        const normalizedPrice = String(form.price).replace(",", ".").trim();
        const numericPrice = Number(normalizedPrice);

        if (!form.name.trim()) {
            showModal("error", "Informe o nome do produto.");
            return;
        }

        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            showModal("error", "Informe um preço válido maior ou igual a zero.");
            return;
        }

        saving = true;
        try {
            const isEditing = Boolean(form.id);
            const url = isEditing
                ? `${API_URL}/v1/products/${form.id}`
                : `${API_URL}/v1/products`;
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    image: form.image.trim(),
                    price: numericPrice,
                }),
            });

            if (res.ok) {
                showModal(
                    "success",
                    isEditing
                        ? "Produto atualizado com sucesso!"
                        : "Produto cadastrado com sucesso!",
                );
                resetForm();
                await fetchProducts();
            } else {
                const errData = await res.json().catch(() => ({}));
                const firstErr = errData.errors
                    ? Object.values(errData.errors)[0]?.[0]
                    : errData.message;
                showModal("error", firstErr || "Erro ao salvar o produto.");
            }
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        } finally {
            saving = false;
        }
    }

    /** @param {any} product */
    function startEdit(product) {
        form = {
            id: product.id,
            name: product.name || "",
            image: product.image || "",
            price:
                product.price !== undefined && product.price !== null
                    ? Number(product.price).toFixed(2)
                    : "",
        };
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        form = {
            id: null,
            name: "",
            image: "",
            price: "",
        };
    }

    /** @param {any} product */
    function requestDelete(product) {
        showModal(
            "confirm",
            `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`,
            () => {
                closeModal();
                performDelete(product.id);
            },
        );
    }

    /** @param {number} id */
    async function performDelete(id) {
        try {
            const res = await fetch(`${API_URL}/v1/products/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (res.ok || res.status === 204) {
                if (form.id === id) {
                    resetForm();
                }
                showModal("success", "Produto excluído com sucesso!");
                await fetchProducts();
            } else {
                const errData = await res.json().catch(() => ({}));
                showModal("error", errData.message || "Erro ao excluir o produto.");
            }
        } catch (err) {
            console.error("Erro ao excluir produto:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        }
    }

    /** @param {number | string} value */
    function formatPrice(value) {
        const num = Number(value) || 0;
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    /** @param {any} product */
    function resolveImage(product) {
        const key = String(product.id ?? product.name);
        const raw = typeof product.image === "string" ? product.image.trim() : "";
        if (
            !failedImages[key] &&
            raw &&
            (raw.startsWith("http://") ||
                raw.startsWith("https://") ||
                raw.startsWith("/") ||
                raw.startsWith("data:image/"))
        ) {
            return raw;
        }
        return "";
    }

    /** @param {any} product */
    function markImageFailed(product) {
        const key = String(product.id ?? product.name);
        if (!failedImages[key]) {
            failedImages = { ...failedImages, [key]: true };
        }
    }
</script>

<div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h2 class="text-3xl font-black text-text-primary">
                Gerenciar Produtos
            </h2>
            <p class="text-sm text-text-secondary mt-1">
                Cadastre, edite e remova os produtos exibidos na loja da landing
                page.
            </p>
        </div>
        <span
            class="self-start sm:self-auto px-4 py-2 rounded-2xl bg-bg-secondary border border-border-ui text-xs font-black uppercase tracking-widest text-text-secondary"
        >
            {products.length} {products.length === 1 ? "produto" : "produtos"}
        </span>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <!-- Formulário de Produto -->
        <div
            class="xl:col-span-4 bg-bg-secondary border border-border-ui rounded-[2.5rem] p-6 sm:p-8 shadow-xl"
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-black text-text-primary">
                    {form.id ? "Editar Produto" : "Novo Produto"}
                </h3>
                {#if form.id}
                    <button
                        type="button"
                        onclick={resetForm}
                        class="text-xs font-bold text-text-secondary hover:text-brand transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                {/if}
            </div>

            <form onsubmit={handleSave} class="space-y-5">
                <div class="space-y-1.5">
                    <label
                        for="product-name"
                        class="block text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1"
                    >
                        Nome do Produto *
                    </label>
                    <input
                        id="product-name"
                        type="text"
                        bind:value={form.name}
                        required
                        maxlength="255"
                        placeholder="Ex: Camiseta Comunidade São Miguel"
                        class="w-full bg-bg-primary border border-border-ui rounded-2xl px-4 py-3.5 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/50"
                    />
                </div>

                <div class="space-y-1.5">
                    <label
                        for="product-price"
                        class="block text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1"
                    >
                        Preço (R$) *
                    </label>
                    <input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        bind:value={form.price}
                        required
                        placeholder="0.00"
                        class="w-full bg-bg-primary border border-border-ui rounded-2xl px-4 py-3.5 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/50"
                    />
                </div>

                <div class="space-y-2">
                    <label
                        for="product-image"
                        class="block text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1"
                    >
                        Imagem (Link ou Upload)
                    </label>
                    <div class="flex gap-2">
                        <input
                            id="product-image"
                            type="text"
                            bind:value={form.image}
                            placeholder="https://exemplo.com/produto.jpg"
                            class="flex-1 min-w-0 bg-bg-primary border border-border-ui rounded-2xl px-4 py-3.5 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/50"
                        />

                        <input
                            bind:this={fileInputRef}
                            type="file"
                            accept="image/*"
                            onchange={handleImageFileChange}
                            class="hidden"
                        />

                        <button
                            type="button"
                            disabled={uploadingImage}
                            onclick={() => fileInputRef?.click()}
                            title="Fazer upload de imagem"
                            class="px-4 py-3.5 rounded-2xl bg-bg-primary border border-border-ui text-text-primary hover:border-brand hover:text-brand active:scale-95 transition-all cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-wider flex-shrink-0 disabled:opacity-50"
                        >
                            {#if uploadingImage}
                                <span
                                    class="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"
                                ></span>
                            {:else}
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
                                >
                                    <path
                                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                    />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                            {/if}
                            <span class="hidden sm:inline">Upload</span>
                        </button>
                    </div>
                </div>

                <!-- Pré-visualização (imagem vazia caso não informada) -->
                <div
                    class="rounded-2xl border border-border-ui bg-bg-primary/60 p-3 flex items-center gap-4"
                >
                    <div
                        class="w-16 h-16 rounded-xl overflow-hidden bg-bg-secondary border border-border-ui flex-shrink-0"
                    >
                        {#if previewSrc}
                            <img
                                src={previewSrc}
                                alt="Prévia do produto"
                                onerror={() => (previewFailed = true)}
                                class="w-full h-full object-cover"
                            />
                        {/if}
                    </div>
                    <div class="min-w-0 flex-1">
                        <p
                            class="text-xs font-black text-text-primary truncate"
                        >
                            {form.name.trim() || "Prévia do Produto"}
                        </p>
                        <p class="text-sm font-black text-brand mt-0.5">
                            {formatPrice(form.price)}
                        </p>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving || uploadingImage}
                        class="flex-1 py-4 rounded-2xl bg-brand text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {#if saving}
                            Salvando...
                        {:else if form.id}
                            Salvar Alterações
                        {:else}
                            Cadastrar Produto
                        {/if}
                    </button>
                </div>
            </form>
        </div>

        <!-- Lista de Produtos -->
        <div class="xl:col-span-8 space-y-5">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Pesquisar produto por nome..."
                class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary px-5 py-3.5 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/15 outline-none transition-all"
            />

            {#if loading}
                <div
                    class="flex flex-col items-center justify-center py-20 text-text-secondary bg-bg-secondary/50 rounded-[2.5rem] border border-border-ui"
                >
                    <div
                        class="w-9 h-9 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-3"
                    ></div>
                    <p class="text-xs font-bold uppercase tracking-widest">
                        Carregando produtos...
                    </p>
                </div>
            {:else if filteredProducts.length === 0}
                <div
                    class="text-center py-20 px-6 bg-bg-secondary/40 rounded-[2.5rem] border-2 border-dashed border-border-ui"
                >
                    <p
                        class="text-xs font-black uppercase tracking-widest text-text-secondary"
                    >
                        {products.length === 0
                            ? "Nenhum produto cadastrado ainda."
                            : "Nenhum produto encontrado para essa pesquisa."}
                    </p>
                </div>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {#each filteredProducts as product (product.id)}
                        {@const imgSrc = resolveImage(product)}
                        <div
                            class="bg-bg-secondary border border-border-ui rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col
                                   {form.id === product.id ? 'ring-2 ring-brand' : ''}"
                        >
                            <div
                                class="h-40 w-full bg-bg-primary/50 border-b border-border-ui/40 overflow-hidden relative"
                            >
                                {#if imgSrc}
                                    <img
                                        src={imgSrc}
                                        alt={product.name}
                                        onerror={() => markImageFailed(product)}
                                        class="w-full h-full object-cover"
                                    />
                                {/if}
                            </div>

                            <div class="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div>
                                    <h4
                                        class="text-base font-black text-text-primary line-clamp-2 leading-snug"
                                    >
                                        {product.name}
                                    </h4>
                                    <p class="text-lg font-black text-brand mt-1.5">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>

                                <div
                                    class="flex items-center gap-2 pt-3 border-t border-border-ui"
                                >
                                    <button
                                        type="button"
                                        onclick={() => startEdit(product)}
                                        class="flex-1 py-2.5 rounded-xl bg-bg-primary border border-border-ui text-text-primary text-xs font-bold hover:border-brand hover:text-brand transition-all cursor-pointer"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onclick={() => requestDelete(product)}
                                        class="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
