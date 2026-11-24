<script>
    import { isDarkMode, toggleTheme } from "$lib/stores/theme.js";

    let {
        userData = $bindable({}),
        updateProfile,
        defaultAvatar = "",
        showModal,
        closeModal,
        onBack = () => {},
    } = $props();

    // Campos bloqueados por padrão até confirmação no modal de edição
    let isEditing = $state(false);

    function handleEditOrSave() {
        if (!isEditing) {
            showModal("confirm", "Deseja editar suas informações? ", () => {
                closeModal();
                isEditing = true;
            });
        } else {
            updateProfile(() => {
                isEditing = false;
            });
        }
    }

    /** @param {string} raw */
    function formatPhone(raw) {
        let v = String(raw || "").replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
        return v;
    }

    /** @param {string} raw */
    function formatCpf(raw) {
        let cpf = String(raw || "").replace(/\D/g, "");
        if (cpf.length === 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
        return cpf;
    }
</script>

<div class="max-w-4xl space-y-6">
    <!-- Cabeçalho fora do card: botão de retorno + título -->
    <div class="flex flex-col gap-4">
        <button
            type="button"
            onclick={onBack}
            class="self-start inline-flex items-center gap-2 text-text-secondary hover:text-brand transition-colors font-bold text-sm uppercase tracking-wider cursor-pointer"
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
            Voltar
        </button>

        <h2
            class="text-3xl sm:text-4xl font-black text-text-primary tracking-tight"
        >
            Configurações de Perfil
        </h2>
    </div>

    <!-- Card com as informações do usuário -->
    <div
        class="bg-bg-secondary p-8 sm:p-10 rounded-[3rem] border border-border-ui shadow-sm"
    >
        <!-- Ícone do usuário + nome ao lado -->
        <div class="flex items-center gap-6 mb-10">
            <img
                src={userData.picture && userData.picture.startsWith("http")
                    ? userData.picture
                    : defaultAvatar}
                alt="Avatar"
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-brand object-cover flex-shrink-0"
            />
            <div class="min-w-0">
                <h3
                    class="text-2xl sm:text-3xl font-black text-text-primary truncate"
                >
                    {userData.name || "Usuário"}
                </h3>
            </div>
        </div>

        <!-- Campos de informações -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
                <label
                    for="profile-name"
                    class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >
                    Nome Completo
                </label>
                <input
                    id="profile-name"
                    type="text"
                    bind:value={userData.name}
                    readonly={!isEditing}
                    class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm {!isEditing
                        ? 'opacity-60 cursor-not-allowed'
                        : ''}"
                />
            </div>

            <div class="space-y-2">
                <label
                    for="profile-email"
                    class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >
                    Email
                </label>
                <input
                    id="profile-email"
                    type="email"
                    bind:value={userData.email}
                    readonly={!isEditing}
                    class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm {!isEditing
                        ? 'opacity-60 cursor-not-allowed'
                        : ''}"
                />
            </div>

            <div class="space-y-2">
                <label
                    for="profile-phone"
                    class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >
                    Telefone / Celular
                </label>
                <input
                    id="profile-phone"
                    type="text"
                    value={formatPhone(userData.phone)}
                    oninput={(e) => {
                        if (!isEditing) return;
                        const input = /** @type {HTMLInputElement} */ (
                            e.currentTarget
                        );
                        const formatted = formatPhone(input.value);
                        userData.phone = formatted;
                        input.value = formatted;
                    }}
                    readonly={!isEditing}
                    maxlength="15"
                    placeholder="(00) 00000-0000"
                    class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm {!isEditing
                        ? 'opacity-60 cursor-not-allowed'
                        : ''}"
                />
            </div>

            <div class="space-y-2">
                <label
                    for="profile-cpf"
                    class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >
                    Documento (CPF)
                </label>
                <input
                    id="profile-cpf"
                    type="text"
                    value={formatCpf(userData.cpf || userData.document)}
                    class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none transition-all shadow-sm opacity-60 cursor-not-allowed"
                    readonly
                />
            </div>
        </div>

        <!-- Rodapé do Card: Tema no canto inferior esquerdo + Ação de Editar/Salvar à direita -->
        <div
            class="pt-8 mt-10 border-t border-border-ui flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
            <!-- Canto inferior esquerdo: Título"Tema" + Botão Claro/Escuro -->
            <div class="flex flex-col items-start gap-2">
                <span
                    class="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1"
                >
                    Tema
                </span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={$isDarkMode}
                    onclick={toggleTheme}
                    aria-label="Trocar Tema"
                    class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-primary border border-border-ui text-text-primary hover:border-brand hover:text-brand active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                    {#if $isDarkMode}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                        <span
                            class="text-xs font-black uppercase tracking-wider"
                        >
                            Escuro
                        </span>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                        <span
                            class="text-xs font-black uppercase tracking-wider"
                        >
                            Claro
                        </span>
                    {/if}
                    <div
                        class="w-10 h-5 rounded-full p-0.5 transition-colors duration-300 {$isDarkMode
                            ? 'bg-brand'
                            : 'bg-border-ui'}"
                    >
                        <div
                            class="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 {$isDarkMode
                                ? 'translate-x-5'
                                : 'translate-x-0'}"
                        ></div>
                    </div>
                </button>
            </div>

            <!-- Botão Editar Informações / Salvar Alterações -->
            <button
                type="button"
                onclick={handleEditOrSave}
                class="bg-brand text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-brand/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
                {isEditing ? "Salvar Alterações" : "Editar Informações"}
            </button>
        </div>
    </div>
</div>
