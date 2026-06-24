<script>
    import { onMount } from "svelte";

    let { selectedMessage = $bindable(null) } = $props();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    let token = "";

    let messages = $state([]);
    let loading = $state(false);

    let viewingMessage = $state(null);

    $effect(() => {
        if (selectedMessage) {
            viewingMessage = selectedMessage;
        }
    });

    onMount(() => {
        token = localStorage.getItem("auth_token") || "";
        fetchMessages();
    });

    async function fetchMessages() {
        if (!token) return;
        loading = true;
        try {
            const res = await fetch(`${API_URL}/v1/inbox-messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                messages = data.data || [];
            }
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function markAsRead(id) {
        try {
            const res = await fetch(`${API_URL}/v1/inbox-messages/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                messages = messages.map((m) =>
                    m.id === id ? { ...m, is_read: true } : m,
                );
            }
        } catch (err) {}
    }

    async function deleteMessage(id) {
        if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
        try {
            const res = await fetch(`${API_URL}/v1/inbox-messages/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                messages = messages.filter((m) => m.id !== id);
            }
        } catch (err) {}
    }

    function openMessage(msg) {
        if (!msg.is_read) {
            markAsRead(msg.id);
            msg.is_read = true; // Optimistic update
        }
        viewingMessage = msg;
    }

    function closeMessage() {
        viewingMessage = null;
        selectedMessage = null;
    }
</script>

{#if viewingMessage}
<div class="space-y-6 animate-in fade-in duration-300">
    <!-- Action bar -->
    <div class="flex items-center gap-4 border-b border-border-ui pb-4">
        <button onclick={closeMessage} aria-label="Voltar" class="flex items-center gap-2 px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all font-medium text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar para a lista
        </button>
        <div class="flex-1"></div>
        <button onclick={() => { deleteMessage(viewingMessage.id); closeMessage(); }} aria-label="Excluir" class="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            Excluir
        </button>
    </div>

    <!-- Message Content -->
    <div class="bg-bg-secondary rounded-3xl border border-border-ui p-8 shadow-sm">
        <h2 class="text-3xl font-black mb-4 text-text-primary">{viewingMessage.title}</h2>
        <div class="flex items-center gap-2 text-sm text-text-secondary mb-8 pb-6 border-b border-border-ui/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Recebida em: {new Date(viewingMessage.created_at).toLocaleDateString("pt-BR")} às {new Date(viewingMessage.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        
        <div class="prose prose-sm max-w-none text-text-primary whitespace-pre-wrap leading-relaxed">
            {viewingMessage.content}
        </div>
    </div>
</div>
{:else}
<div class="space-y-8 animate-in fade-in duration-300">
    <div class="flex justify-between items-end">
        <div>
            <h2 class="text-3xl font-black mb-2">Caixa de Entrada</h2>
            <p class="text-text-secondary">
                Visualize e gerencie suas notificações
            </p>
        </div>
    </div>

    <div
        class="bg-bg-secondary rounded-3xl border border-border-ui overflow-hidden shadow-sm"
    >
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-border-ui bg-bg-primary/50 text-text-secondary uppercase text-xs tracking-wider"
                    >
                        <th class="p-4 font-bold w-48">Data</th>
                        <th class="p-4 font-bold">Título</th>
                        <th class="p-4 font-bold text-center w-32">Status</th>
                        <th class="p-4 font-bold text-center w-32">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {#if loading}
                        <tr>
                            <td
                                colspan="4"
                                class="p-8 text-center text-text-secondary font-medium animate-pulse"
                                >Carregando mensagens...</td
                            >
                        </tr>
                    {:else if messages.length === 0}
                        <tr>
                            <td
                                colspan="4"
                                class="p-8 text-center text-text-secondary font-medium"
                                >Você não possui nenhuma mensagem na caixa de
                                entrada.</td
                            >
                        </tr>
                    {:else}
                        {#each messages as msg}
                            <tr
                                class="border-b border-border-ui/50 hover:bg-bg-primary/30 transition-colors {msg.is_read
                                    ? 'opacity-60 text-text-secondary bg-bg-primary/10'
                                    : 'font-semibold text-text-primary'}"
                            >
                                <td class="p-4 whitespace-nowrap text-sm">
                                    {new Date(
                                        msg.created_at,
                                    ).toLocaleDateString("pt-BR")}
                                    <span class="text-xs opacity-70 ml-1"
                                        >{new Date(
                                            msg.created_at,
                                        ).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}</span
                                    >
                                </td>
                                <td
                                    class="p-4 cursor-pointer {msg.is_read
                                        ? ''
                                        : 'text-brand'} hover:underline group"
                                    onclick={() => openMessage(msg)}
                                >
                                    <div class="flex items-center gap-2">
                                        {#if !msg.is_read}
                                            <div
                                                class="w-2 h-2 rounded-full bg-brand flex-shrink-0"
                                            ></div>
                                        {/if}
                                        {msg.title}
                                    </div>
                                </td>
                                <td class="p-4 text-center">
                                    {#if msg.is_read}
                                        <span
                                            class="inline-block px-3 py-1 bg-text-secondary/10 text-text-secondary rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            >Lida</span
                                        >
                                    {:else}
                                        <span
                                            class="inline-block px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse"
                                            >Nova</span
                                        >
                                    {/if}
                                </td>
                                <td class="p-4 text-center">
                                    <div
                                        class="flex items-center justify-center gap-2"
                                    >
                                        <button
                                            onclick={() => openMessage(msg)}
                                            class="p-2 rounded-xl text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors"
                                            title="Ver Mensagem"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><path
                                                    d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                                                /><circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                /></svg
                                            >
                                        </button>
                                        <button
                                            onclick={() =>
                                                deleteMessage(msg.id)}
                                            class="p-2 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            title="Excluir"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><path d="M3 6h18" /><path
                                                    d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                                                /><path
                                                    d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                                /><line
                                                    x1="10"
                                                    x2="10"
                                                    y1="11"
                                                    y2="17"
                                                /><line
                                                    x1="14"
                                                    x2="14"
                                                    y1="11"
                                                    y2="17"
                                                /></svg
                                            >
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
{/if}
