<script>
    import { onMount } from "svelte";
    import Modal from "./Modal.svelte";

    let { token } = $props();

    const API_URL = import.meta.env.VITE_API_URL;

    let users = $state([]);
    let loadingUsers = $state(true);
    let searchQuery = $state("");

    let selectedUser = $state(null);
    let userSubscriptions = $state([]);
    let loadingSubscriptions = $state(false);
    let subSearchQuery = $state("");

    let editingSubscription = $state(null);

    let modalState = $state({
        isOpen: false,
        type: "error",
        message: "",
        onConfirm: null,
    });

    function showModal(type, message, onConfirm = null) {
        modalState = { isOpen: true, type, message, onConfirm };
    }

    function closeModal() {
        modalState.isOpen = false;
    }

    let filteredUsers = $derived(
        users.filter(
            (u) =>
                (u.name &&
                    u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (u.email &&
                    u.email
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                (u.cpf && u.cpf.includes(searchQuery)),
        ),
    );

    let filteredSubscriptions = $derived(
        userSubscriptions.filter(
            (s) =>
                (s.event?.name &&
                    s.event.name
                        .toLowerCase()
                        .includes(subSearchQuery.toLowerCase())) ||
                (s.subscription_type &&
                    s.subscription_type
                        .toLowerCase()
                        .includes(subSearchQuery.toLowerCase())),
        ),
    );

    onMount(() => {
        fetchUsers();
    });

    async function fetchUsers() {
        try {
            loadingUsers = true;
            const response = await fetch(`${API_URL}/v1/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                users = data.data || [];
            } else {
                console.error("Erro ao buscar usuários:", data);
            }
        } catch (err) {
            console.error("Erro de conexão:", err);
        } finally {
            loadingUsers = false;
        }
    }

    async function fetchSubscriptions(userId) {
        try {
            loadingSubscriptions = true;
            const response = await fetch(
                `${API_URL}/v1/subscriptions?user_id=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                },
            );
            const data = await response.json();
            if (response.ok) {
                userSubscriptions = data.data || [];
            } else {
                console.error("Erro ao buscar inscrições:", data);
            }
        } catch (err) {
            console.error("Erro de conexão:", err);
        } finally {
            loadingSubscriptions = false;
        }
    }

    function viewUserProfile(user) {
        selectedUser = user;
        fetchSubscriptions(user.id);
    }

    function backToList() {
        selectedUser = null;
        userSubscriptions = [];
        subSearchQuery = "";
        editingSubscription = null;
    }

    function editSubscription(sub) {
        editingSubscription = { ...sub };
    }

    function cancelEditSubscription() {
        editingSubscription = null;
    }

    async function saveSubscription() {
        try {
            const response = await fetch(
                `${API_URL}/v1/subscriptions/${editingSubscription.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(editingSubscription),
                },
            );

            if (response.ok) {
                showModal("success", "Inscrição atualizada com sucesso!");
                fetchSubscriptions(selectedUser.id);
                editingSubscription = null;
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.errors
                    ? Object.values(errorData.errors)[0][0]
                    : errorData.message;
                showModal(
                    "error",
                    errorMessage || "Erro ao atualizar inscrição.",
                );
            }
        } catch (err) {
            console.error("Erro de conexão ao salvar:", err);
            showModal("error", "Não foi possível conectar com o servidor.");
        }
    }

    function formatCPF(cpf) {
        if (!cpf) return "-";
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatPhone(phone) {
        if (!phone) return "-";
        const cleaned = String(phone).replace(/\D/g, "");
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone;
    }
</script>

<div class="space-y-8 animate-fade-in">
    {#if !selectedUser}
        <div>
            <h2 class="text-3xl font-black mb-6">Controle de Usuários</h2>
            <div class="mb-6 flex gap-4 items-center">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Pesquisar por nome, email ou CPF..."
                    class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                />
            </div>

            {#if loadingUsers}
                <div
                    class="flex flex-col items-center justify-center py-20 text-text-secondary"
                >
                    <div
                        class="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-4"
                    ></div>
                    <p class="animate-pulse">Carregando usuários...</p>
                </div>
            {:else if filteredUsers.length === 0}
                <div
                    class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
                >
                    <p class="text-text-secondary text-xs font-bold mb-6">
                        Nenhum usuário encontrado
                    </p>
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 gap-8 text-text-primary"
                >
                    {#each filteredUsers as user}
                        <div
                            class="bg-bg-secondary border border-border-ui p-6 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group"
                        >
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3
                                        class="text-xl font-black group-hover:text-brand transition-colors"
                                    >
                                        {user.name}
                                    </h3>
                                    <p class="text-text-secondary text-sm mt-1">
                                        {user.email}
                                    </p>
                                </div>
                                <div
                                    class="px-3 py-1 bg-text-primary/5 text-text-secondary rounded-full text-[10px] font-bold uppercase tracking-wider"
                                >
                                    {formatCPF(user.cpf) || "Sem CPF"}
                                </div>
                            </div>
                            <div
                                class="flex justify-end pt-4 border-t border-border-ui"
                            >
                                <button
                                    onclick={() => viewUserProfile(user)}
                                    class="px-5 py-2 bg-brand text-white rounded-full text-xs font-bold hover:shadow-lg hover:shadow-brand/30 transition-all"
                                >
                                    Ver Perfil
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {:else}
        <div>
            <button
                onclick={backToList}
                class="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors mb-6 font-bold text-sm uppercase tracking-wider"
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
                class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] mb-8"
            >
                <h2 class="text-2xl font-black mb-6">Informações do Usuário</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                        >
                            Nome
                        </p>
                        <p class="font-medium">{selectedUser.name || "-"}</p>
                    </div>
                    <div>
                        <p
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                        >
                            Email
                        </p>
                        <p class="font-medium">{selectedUser.email || "-"}</p>
                    </div>
                    <div>
                        <p
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                        >
                            CPF
                        </p>
                        <p class="font-medium">{formatCPF(selectedUser.cpf)}</p>
                    </div>
                    <div>
                        <p
                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                        >
                            Telefone
                        </p>
                        <p class="font-medium">
                            {formatPhone(selectedUser.phone)}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black">Inscrições do Usuário</h2>
                <div class="w-1/2">
                    <input
                        type="text"
                        bind:value={subSearchQuery}
                        placeholder="Pesquisar inscrições..."
                        class="w-full bg-bg-secondary border-2 border-border-ui text-text-primary p-3 rounded-xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                    />
                </div>
            </div>

            {#if loadingSubscriptions}
                <div
                    class="flex flex-col items-center justify-center py-10 text-text-secondary"
                >
                    <div
                        class="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-4"
                    ></div>
                    <p class="animate-pulse text-sm">
                        Carregando inscrições...
                    </p>
                </div>
            {:else if filteredSubscriptions.length === 0}
                <div
                    class="text-center py-12 bg-bg-secondary/30 rounded-[2rem] border-2 border-dashed border-border-ui uppercase tracking-widest"
                >
                    <p class="text-text-secondary text-xs font-bold">
                        Nenhuma inscrição encontrada
                    </p>
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 xl:grid-cols-2 gap-8 text-text-primary"
                >
                    {#each filteredSubscriptions as sub}
                        <div
                            class="bg-bg-secondary border border-border-ui p-6 rounded-[2rem] relative"
                        >
                            <h3 class="text-xl font-black mb-4">
                                {sub.event?.name || "Inscrição"}
                            </h3>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p
                                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                    >
                                        Status de Pagamento
                                    </p>
                                    <p class="font-medium text-sm">
                                        {sub.paid_the_fee
                                            ? "Confirmado"
                                            : "Pendente"}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                    >
                                        Tipo
                                    </p>
                                    <p class="font-medium text-sm">
                                        {sub.subscription_type || "-"}
                                    </p>
                                </div>
                                {#if sub.event?.eventable_type !== "App\\Models\\Festival"}
                                    <div>
                                        <p
                                            class="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1"
                                        >
                                            Sorteado
                                        </p>
                                        <p class="font-medium text-sm">
                                            <span
                                                class="px-2 py-0.5 rounded text-xs font-bold {sub.was_selected
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'}"
                                            >
                                                {sub.was_selected
                                                    ? "Sim"
                                                    : "Não"}
                                            </span>
                                        </p>
                                    </div>
                                {/if}
                            </div>
                            <div
                                class="flex justify-end pt-4 border-t border-border-ui"
                            >
                                <button
                                    onclick={() => editSubscription(sub)}
                                    class="px-4 py-2 bg-text-primary text-bg-primary rounded-xl text-xs font-bold hover:bg-brand hover:text-white transition-all"
                                >
                                    Editar Inscrição
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if editingSubscription}
    <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
        <div
            class="bg-bg-secondary w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-ui transform transition-all"
        >
            <div class="p-8">
                <h3 class="text-2xl font-black mb-6">Editar Inscrição</h3>

                <div class="space-y-6">
                    {#if editingSubscription.event?.eventable_type === "App\\Models\\Festival"}
                        <div>
                            <label
                                class="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2"
                                for="subscription_type"
                            >
                                Tipo de Inscrição (Festival)
                            </label>
                            <select
                                id="subscription_type"
                                bind:value={
                                    editingSubscription.subscription_type
                                }
                                class="w-full bg-bg-primary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                            >
                                <option value="Campista">Campista</option>
                                <option value="Servo">Servo</option>
                                <option value="Participante"
                                    >Participante</option
                                >
                            </select>
                        </div>

                        <div
                            class="flex items-center gap-4 p-4 bg-bg-primary border-2 border-border-ui rounded-2xl"
                        >
                            <input
                                id="paid_the_fee"
                                type="checkbox"
                                bind:checked={editingSubscription.paid_the_fee}
                                class="w-5 h-5 accent-brand rounded"
                            />
                            <label
                                class="text-sm font-bold cursor-pointer select-none flex-grow"
                                for="paid_the_fee"
                            >
                                Taxa Paga?
                            </label>
                        </div>
                    {:else}
                        <div>
                            <label
                                class="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2"
                                for="subscription_type"
                            >
                                Tipo de Inscrição (Acampamento)
                            </label>
                            <select
                                id="subscription_type"
                                bind:value={
                                    editingSubscription.subscription_type
                                }
                                class="w-full bg-bg-primary border-2 border-border-ui text-text-primary p-4 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                            >
                                <option value="Campista">Campista</option>
                                <option value="Servo">Servo</option>
                            </select>
                        </div>

                        <div
                            class="flex items-center gap-4 p-4 bg-bg-primary border-2 border-border-ui rounded-2xl"
                        >
                            <input
                                id="was_selected"
                                type="checkbox"
                                bind:checked={editingSubscription.was_selected}
                                class="w-5 h-5 accent-brand rounded"
                            />
                            <label
                                class="text-sm font-bold cursor-pointer select-none flex-grow"
                                for="was_selected"
                            >
                                Sorteado (Foi selecionado?)
                            </label>
                        </div>

                        <div
                            class="flex items-center gap-4 p-4 bg-bg-primary border-2 border-border-ui rounded-2xl"
                        >
                            <input
                                id="paid_the_fee"
                                type="checkbox"
                                bind:checked={editingSubscription.paid_the_fee}
                                class="w-5 h-5 accent-brand rounded"
                            />
                            <label
                                class="text-sm font-bold cursor-pointer select-none flex-grow"
                                for="paid_the_fee"
                            >
                                Inscrição Paga
                            </label>
                        </div>
                    {/if}
                </div>

                <div class="flex gap-4 mt-8">
                    <button
                        onclick={cancelEditSubscription}
                        class="flex-1 py-4 border-2 border-border-ui text-text-primary rounded-2xl font-bold hover:bg-text-primary/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onclick={saveSubscription}
                        class="flex-1 py-4 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<Modal {modalState} {closeModal} />
