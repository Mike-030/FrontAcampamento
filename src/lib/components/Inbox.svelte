<script>
    import { onMount } from "svelte";
    import { token as auth_token } from "$lib/stores/auth.js";

    let {
        activeTab = $bindable(""),
        onOpenMessage = null,
        onViewAll = null,
    } = $props();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    /** @type {any[]} */
    let messages = $state([]);
    let isOpen = $state(false);
    let loading = $state(false);

    let unreadCount = $derived(messages.filter((m) => !m.is_read).length);

    onMount(() => {
        fetchMessages();
    });

    async function fetchMessages() {
        if (!$auth_token) return;
        try {
            loading = true;
            const res = await fetch(`${API_URL}/v1/inbox-messages`, {
                headers: { Authorization: `Bearer ${$auth_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                messages = data.data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar mensagens do inbox", err);
        } finally {
            loading = false;
        }
    }

    /** @param {number} id */
    async function markAsRead(id) {
        try {
            const res = await fetch(`${API_URL}/v1/inbox-messages/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${$auth_token}` },
            });
            if (res.ok) {
                messages = messages.map((m) =>
                    m.id === id ? { ...m, is_read: true } : m,
                );
            }
        } catch (err) {
            console.error("Erro ao marcar mensagem como lida", err);
        }
    }

    /** @param {any} message */
    async function handleMessageClick(message) {
        if (!message.is_read) {
            await markAsRead(message.id);
        }
        isOpen = false;
        activeTab = "inbox";
        if (onOpenMessage) {
            onOpenMessage(message);
        }
    }

    async function markAllAsRead() {
        try {
            const res = await fetch(`${API_URL}/v1/inbox-messages/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${$auth_token}` },
            });
            if (res.ok) {
                messages = messages.map((m) => ({ ...m, is_read: true }));
            }
        } catch (err) {
            console.error("Erro ao marcar todas como lidas", err);
        }
    }

    function toggleInbox() {
        isOpen = !isOpen;
        if (isOpen) {
            fetchMessages();
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative flex items-center" onmouseleave={() => (isOpen = false)}>
    <button
        type="button"
        onclick={toggleInbox}
        class="relative p-2.5 rounded-2xl bg-bg-secondary/80 border border-border-ui text-text-secondary hover:border-brand hover:text-brand transition-all flex-shrink-0 focus:outline-none cursor-pointer"
        title="Caixa de Entrada"
        aria-label="Notificações da Caixa de Entrada"
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        {#if unreadCount > 0}
            <span class="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span
                    class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"
                ></span>
            </span>
        {/if}
    </button>

    {#if isOpen}
        <div class="absolute right-0 top-full pt-3 w-80 z-50">
            <div
                class="bg-bg-secondary border border-border-ui rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-96"
            >
                <div
                    class="p-4 border-b border-border-ui bg-bg-primary/50 flex justify-between items-center sticky top-0 z-10"
                >
                    <h3
                        class="font-black text-sm text-text-primary uppercase tracking-wider"
                    >
                        Notificações
                    </h3>
                    {#if unreadCount > 0}
                        <button
                            type="button"
                            onclick={markAllAsRead}
                            class="text-[10px] text-brand font-bold hover:underline cursor-pointer"
                        >
                            Marcar todas como lidas
                        </button>
                    {/if}
                </div>
                <div
                    class="overflow-y-auto flex-grow p-2 space-y-2 max-h-[280px]"
                >
                    {#if loading && messages.length === 0}
                        <div
                            class="text-center p-4 text-text-secondary text-sm font-medium"
                        >
                            Carregando...
                        </div>
                    {:else if messages.filter((m) => !m.is_read).length === 0}
                        <div
                            class="text-center p-4 text-text-secondary text-sm font-medium"
                        >
                            Nenhuma nova notificação
                        </div>
                    {:else}
                        {#each messages.filter((m) => !m.is_read) as message}
                            <button
                                type="button"
                                onclick={() => handleMessageClick(message)}
                                class="w-full text-left p-3 rounded-xl bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-all group cursor-pointer"
                            >
                                <div class="flex justify-between items-start">
                                    <h4
                                        class="text-xs font-bold text-brand group-hover:underline"
                                    >
                                        {message.title}
                                    </h4>
                                    <div
                                        class="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1"
                                    ></div>
                                </div>
                                <div
                                    class="text-[9px] text-text-secondary mt-2 text-right"
                                >
                                    {new Date(
                                        message.created_at,
                                    ).toLocaleDateString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </button>
                        {/each}
                    {/if}
                </div>

                {#if onViewAll}
                    <div
                        class="p-2.5 border-t border-border-ui bg-bg-primary/40 text-center"
                    >
                        <button
                            type="button"
                            onclick={() => {
                                isOpen = false;
                                onViewAll();
                            }}
                            class="w-full py-2 text-xs font-black uppercase tracking-wider text-brand hover:underline cursor-pointer"
                        >
                            Abrir Caixa de Entrada
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
