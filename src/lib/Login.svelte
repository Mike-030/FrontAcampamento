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

<div class="min-h-screen flex items-center justify-center bg-bg-primary p-0 md:p-6 transition-colors duration-300">
    <!-- Container Split Principal -->
    <div class="w-full max-w-6xl min-h-[700px] bg-bg-secondary border border-border-ui shadow-2xl overflow-hidden flex flex-col md:flex-row md:rounded-[3rem] transition-all">
        
        <!-- Lado da Imagem (Escondido no Mobile para priorizar login) -->
        <div class="hidden md:block md:w-1/2 relative">
            <img 
                src={bgHero} 
                alt="São Miguel Arcanjo" 
                class="absolute inset-0 w-full h-full object-cover" 
            />
            <!-- Fade preto sólido na base para legibilidade máxima -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div class="relative z-10 p-12 flex flex-col justify-end h-full text-white">
                <h2 class="text-5xl font-black mb-4 leading-tight italic">
                    Quem como Deus?<br><span class="text-brand">Ninguém!</span>
                </h2>
                <p class="text-white/80 text-lg max-w-sm">
                    Portal destinado aos servos e campistas da Comunidade São Miguel Arcanjo.
                </p>
            </div>
        </div>

        <!-- Lado do Formulário -->
        <div class="w-full md:w-1/2 p-8 sm:p-16 sm:pt-4 flex flex-col justify-center items-center">
            
            <header class="text-center w-full mb-0 relative">
                <!-- Logo Gigante com Brilho Dinâmico -->
                <div class="relative group">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        class="h-80 sm:h-[450px] mx-auto -mb-20 sm:-mb-32 drop-shadow-[0_0_30px_rgba(222,110,39,0.3)] transition-all duration-700 group-hover:drop-shadow-[0_0_50px_rgba(222,110,39,0.5)]" 
                    />
                </div>
                <div class="relative z-10">
                    <h1 class="text-text-primary text-5xl font-black mb-1">Acesso</h1>
                    <p class="text-text-secondary text-sm font-medium opacity-60">Portal Comunidade São Miguel</p>
                </div>
            </header>

            <form onsubmit={handleSubmit} class="w-full max-w-sm space-y-5">
                <div class="space-y-1.5">
                    <label for="email" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                        id="email" 
                        bind:value={email} 
                        type="email" 
                        required 
                        class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:opacity-20" 
                        placeholder="seu@email.com"
                    />
                </div>

                <div class="space-y-1.5">
                    <label for="password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Senha</label>
                    <input 
                        id="password" 
                        bind:value={password} 
                        type="password" 
                        required 
                        class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all placeholder:opacity-20" 
                        placeholder="••••••••"
                    />
                </div>

                {#if error}
                    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center border-dashed">
                        {error}
                    </div>
                {/if}

                <button 
                    type="submit" 
                    disabled={loading} 
                    class="w-full bg-brand text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-brand/20"
                >
                    {loading ? "Entrando..." : "Entrar agora"}
                </button>
            </form>

            <footer class="mt-10 text-center">
                <button onclick={() => onGoToRegister()} class="text-text-secondary text-sm hover:text-text-primary transition-all group">
                    Novo por aqui? <span class="text-brand font-black group-hover:underline">Crie sua conta</span>
                </button>
            </footer>
        </div>
    </div>
</div>

<style>
    :global(body) {
        overflow-x: hidden;
    }
</style>
