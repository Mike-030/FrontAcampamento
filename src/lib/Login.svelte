<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    import bgHero from "../assets/SaoMiguelArcanjo.png";
    
    /** @type {{ onLoginSuccess: Function, onGoToRegister: Function }} */
    let { onLoginSuccess, onGoToRegister } = $props();

    let email = $state("");
    let password = $state("");
    let loading = $state(false);
    let error = $state("");

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @param {Event} e */
    async function handleSubmit(e) {
        if (e) e.preventDefault();
        loading = true;
        error = "";

        try {
            const response = await fetch(`${API_URL}/v1/login`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json" 
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                onLoginSuccess(data.token, data.data);
            } else {
                error = data.message || "E-mail ou senha incorretos.";
            }
        } catch (err) {
            error = "Sem conexão com o servidor.";
        } finally {
            loading = false;
        }
    }
</script>

<!-- Centralização Vertical Total -->
<div class="fixed inset-0 w-full h-full flex items-center justify-center bg-bg-primary overflow-y-auto overflow-x-hidden">
    
    <!-- Box Centralizado Híbrido -->
    <div class="w-full max-w-6xl md:h-[90vh] md:max-h-[850px] flex flex-col md:flex-row 
                bg-transparent md:bg-bg-secondary 
                border-none md:border md:border-border-ui 
                shadow-none md:shadow-2xl 
                md:rounded-[3rem] overflow-hidden transition-all duration-500">
        
        <!-- Lado da Imagem (Desktop) -->
        <div class="hidden md:block md:w-1/2 relative bg-forest/10">
            <img 
                src={bgHero} 
                alt="São Miguel Arcanjo" 
                class="absolute inset-0 w-full h-full object-cover" 
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div class="relative z-10 p-12 flex flex-col justify-end h-full text-white">
                <h2 class="text-4xl lg:text-5xl font-black mb-4 leading-tight italic">
                    Quem como Deus?<br><span class="text-brand">Ninguém!</span>
                </h2>
                <p class="text-white/80 text-base lg:text-lg max-w-sm">
                    Portal destinado aos servos e campistas da Comunidade São Miguel Arcanjo.
                </p>
            </div>
        </div>

        <!-- Lado do Formulário -->
        <div class="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center items-center py-12">
            
            <header class="text-center w-full mb-0 relative">
                <!-- Logo com mais respiro no topo -->
                <div class="relative -mt-6 md:-mt-10 lg:-mt-12">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        class="h-64 md:h-[35vh] lg:h-[45vh] max-h-[420px] max-w-[85vw] mx-auto -mb-8 md:-mb-12 lg:-mb-16 drop-shadow-[0_0_30px_rgba(222,110,39,0.3)] object-contain transition-all" 
                    />
                </div>
                <div class="relative z-10 mt-2">
                    <h1 class="text-text-primary text-4xl sm:text-5xl font-black mb-1">Acesso</h1>
                    <p class="text-text-secondary text-[10px] md:text-sm font-bold opacity-60 uppercase tracking-widest leading-none">Portal Comunidade São Miguel</p>
                </div>
            </header>

            <form onsubmit={handleSubmit} class="w-full max-w-sm space-y-5 mt-8 px-4">
                <div class="space-y-1.5 text-left w-full">
                    <label for="email" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                        id="email" 
                        bind:value={email} 
                        type="email" 
                        required 
                        class="w-full bg-bg-secondary/40 md:bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm" 
                        placeholder="seu@email.com"
                    />
                </div>

                <div class="space-y-1.5 text-left w-full">
                    <label for="password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Senha</label>
                    <input 
                        id="password" 
                        bind:value={password} 
                        type="password" 
                        required 
                        class="w-full bg-bg-secondary/40 md:bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60 shadow-sm" 
                        placeholder="••••••••"
                    />
                </div>

                {#if error}
                    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs text-center border-dashed">
                        {error}
                    </div>
                {/if}

                <div class="pt-2"> <!-- Espaçamento extra para o botão -->
                    <button 
                        type="submit" 
                        disabled={loading} 
                        class="w-full bg-brand text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand/30"
                    >
                        {loading ? "Entrando..." : "Entrar agora"}
                    </button>
                </div>
            </form>

            <footer class="mt-10 text-center">
                <button onclick={() => onGoToRegister()} class="text-text-secondary text-sm hover:text-text-primary transition-all">
                    Novo por aqui? <span class="text-brand font-black hover:underline">Crie sua conta</span>
                </button>
            </footer>
        </div>
    </div>
</div>

<style>
    :global(html, body) {
        overflow-x: hidden !important;
        position: fixed;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
