<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    let { onLogout } = $props();

    /** @type {any[]} */
    let festivals = $state([]);
    let loading = $state(true);
    let userData = $state(JSON.parse(localStorage.getItem('user_data') || '{}'));

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('auth_token');

    // Fallback para imagem caso o usuário não tenha uma
    const defaultAvatar = "https://ui-avatars.com/api/?name=" + (userData.name || 'User') + "&background=DE6E27&color=fff";

    $effect(() => {
        fetchFestivals();
    });

    async function fetchFestivals() {
        try {
            const response = await fetch(`${API_URL}/v1/festivals`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                festivals = data.data || [];
            }
        } catch (err) {
            console.error("Erro ao buscar festivais:", err);
        } finally {
            loading = false;
        }
    }

    function handleLogout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        onLogout();
    }
</script>

<div class="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 font-['Inter']">
    <!-- Sidebar -->
    <aside class="w-64 bg-bg-secondary border-r border-border-ui flex flex-col p-6 fixed h-full shadow-lg z-10 transition-colors duration-300">
        <div class="flex items-center gap-3 mb-10 overflow-hidden">
            <img src={logo} alt="Logo" class="h-10 w-auto object-contain" />
            <span class="font-bold text-sm leading-tight text-forest dark:text-cream">S. Miguel Arcanjo</span>
        </div>
        
        <nav class="flex-grow">
            <ul class="space-y-2">
                <li class="flex items-center gap-3 p-3 rounded-xl bg-brand text-white shadow-lg shadow-brand/20 cursor-pointer">
                    <span class="text-xl">⛺</span> 
                    <span class="font-medium">Festivais</span>
                </li>
                <li class="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                    <span class="text-xl">👤</span> 
                    <span>Usuários</span>
                </li>
                <li class="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/5 dark:hover:bg-cream/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                    <span class="text-xl">📅</span> 
                    <span>Eventos</span>
                </li>
            </ul>
        </nav>

        <!-- Perfil na Sidebar -->
        <div class="pt-6 border-t border-border-ui space-y-4">
            <div class="flex items-center gap-3 px-2">
                <img 
                    src={userData.picture && userData.picture.startsWith('http') ? userData.picture : defaultAvatar} 
                    alt="Avatar" 
                    class="w-10 h-10 rounded-full object-cover border-2 border-brand"
                />
                <div class="flex flex-col overflow-hidden">
                    <span class="font-bold text-sm truncate">{userData.name || 'Visitante'}</span>
                    <span class="text-[10px] text-brand uppercase tracking-widest font-black mt-0.5">Admin</span>
                </div>
            </div>
            <button onclick={handleLogout} class="w-full border border-forest/20 dark:border-cream/20 text-text-primary p-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                Sair
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-grow p-10">
        <header class="flex justify-between items-start mb-12">
            <div>
                <div class="flex items-center gap-4 mb-2">
                    <h2 class="text-4xl font-black text-forest dark:text-cream">Painel Geral</h2>
                    <span class="bg-forest/10 dark:bg-cream/10 px-3 py-1 rounded-full text-[10px] font-bold text-brand uppercase tracking-tighter self-center">Versão 1.0</span>
                </div>
                <p class="text-text-secondary text-sm">Bem-vindo de volta, <span class="text-forest dark:text-cream font-bold">{userData.name}</span>!</p>
            </div>
            
            <div class="flex items-center gap-4">
                <!-- Foto de Perfil Grande com Dropdown Placeholder -->
                <div class="flex flex-col items-end mr-2">
                    <span class="text-xs font-bold opacity-50 uppercase tracking-widest">Acesso Rápido</span>
                    <span class="text-[10px] text-emerald-500 font-bold">● ONLINE</span>
                </div>
                <div class="relative group">
                    <img 
                        src={userData.picture && userData.picture.startsWith('http') ? userData.picture : defaultAvatar} 
                        alt="Profile" 
                        class="w-14 h-14 rounded-full object-cover border-[3px] border-bg-secondary shadow-xl group-hover:border-brand transition-all cursor-pointer"
                    />
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-brand rounded-full border-4 border-bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                        +
                    </div>
                </div>
            </div>
        </header>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm group hover:border-brand transition-all">
                <p class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Total Festivais</p>
                <p class="text-4xl font-black text-text-primary">{festivals.length}</p>
            </div>
            <div class="bg-bg-secondary p-6 rounded-3xl border border-border-ui shadow-sm">
                <p class="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Sua Inscrição</p>
                <p class="text-4xl font-black text-text-primary">Confirmada</p>
            </div>
            <button class="bg-brand group hover:opacity-90 p-6 rounded-3xl shadow-xl shadow-brand/20 transition-all text-left">
                <p class="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Ação Rápida</p>
                <p class="text-xl font-black text-white">+ Novo Acampamento</p>
            </button>
        </div>

        {#if loading}
            <div class="flex flex-col items-center justify-center py-20 text-text-secondary">
                <div class="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="animate-pulse">Buscando festivais...</p>
            </div>
        {:else if festivals.length === 0}
            <div class="text-center py-24 bg-bg-secondary/30 rounded-[3rem] border-2 border-dashed border-border-ui uppercase tracking-widest">
                <p class="text-text-secondary text-xs font-bold mb-6">Nenhum festival encontrado</p>
                <button class="bg-forest text-cream px-6 py-2 rounded-full text-[10px] font-bold">Sincronizar</button>
            </div>
        {:else}
            <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 text-forest dark:text-stone">
                {#each festivals as festival}
                    <div class="bg-bg-secondary border border-border-ui p-8 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full"></div>
                        
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-2xl font-black group-hover:text-brand transition-colors line-clamp-1">{festival.name || 'Festival'}</h3>
                            <div class="w-3 h-3 bg-brand rounded-full shadow-[0_0_10px_rgba(222,110,39,0.5)]"></div>
                        </div>
                        <p class="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80">
                            {festival.description || 'Nenhuma descrição disponível para este acampamento.'}
                        </p>
                        <div class="flex justify-between items-center pt-8 border-t border-border-ui">
                            <span class="text-[10px] font-black uppercase opacity-40">Campanha 2026</span>
                            <button class="px-5 py-2 bg-text-primary text-bg-primary rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all">
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </main>
</div>
