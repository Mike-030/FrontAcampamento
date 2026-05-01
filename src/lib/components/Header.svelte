<script>
    import logo from "../../assets/LogoComunidadeSaoMiguel.png";
    let {
        userData = {},
        defaultAvatar = "",
        activeTab = $bindable(""),
        handleLogout,
    } = $props();
    let isProfileMenuOpen = $state(false);
</script>

<header class="flex justify-between items-start mb-12">
    <div>
        <div class="mb-4">
            <img
                src={logo}
                alt="Logo"
                class="h-35 w-auto object-contain drop-shadow-[0_0_15px_rgba(222,110,39,0.15)]"
            />
        </div>
        <p class="text-text-secondary text-sm">
            Bem-vindo de volta, <span class="text-text-primary font-bold"
                >{userData.name}</span
            >!
        </p>
    </div>

    <div class="flex items-center gap-4 relative">
        <div class="flex flex-col items-end mr-2">
            <span class="text-xs font-bold opacity-50 uppercase tracking-widest"
                >Acesso Rápido</span
            >
            <span class="text-[10px] text-emerald-500 font-bold">● ONLINE</span>
        </div>
        <div class="relative">
            <button
                onclick={() => (isProfileMenuOpen = !isProfileMenuOpen)}
                class="relative block group text-left"
            >
                <img
                    src={userData.picture && userData.picture.startsWith("http")
                        ? userData.picture
                        : defaultAvatar}
                    alt="Profile"
                    class="w-14 h-14 rounded-full object-cover border-[3px] border-bg-secondary shadow-xl group-hover:border-brand transition-all cursor-pointer"
                />
                <div
                    class="absolute -bottom-1 -right-1 w-5 h-5 bg-brand rounded-full border-4 border-bg-primary flex items-center justify-center text-[10px] text-white font-bold"
                >
                    +
                </div>
            </button>

            <!-- Dropdown Menu -->
            {#if isProfileMenuOpen}
                <div
                    class="absolute right-0 mt-4 w-64 bg-bg-secondary border border-border-ui rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div class="p-5 border-b border-border-ui bg-bg-primary/50">
                        <p
                            class="font-black text-sm text-text-primary line-clamp-1"
                        >
                            {userData.name}
                        </p>
                        <p
                            class="text-[11px] text-text-secondary mt-1 line-clamp-1 opacity-70 font-medium"
                        >
                            {userData.email || ""}
                        </p>
                    </div>
                    <ul class="p-3 space-y-1">
                        <li>
                            <button
                                onclick={() => {
                                    activeTab = "profile";
                                    isProfileMenuOpen = false;
                                }}
                                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand hover:text-white rounded-xl transition-all text-left text-text-secondary"
                            >
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
                                    <path
                                        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                    />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                Configurações de Perfil
                            </button>
                        </li>
                        <li>
                            <button
                                onclick={handleLogout}
                                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left"
                            >
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
                                    <path
                                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                    />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" x2="9" y1="12" y2="12" />
                                </svg>
                                Sair da Conta
                            </button>
                        </li>
                    </ul>
                </div>
            {/if}
        </div>
    </div>
</header>
