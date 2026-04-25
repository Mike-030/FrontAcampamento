<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    
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

<div class="min-h-screen flex items-center justify-center p-4 bg-bg-primary transition-colors duration-300">
    <div class="w-full max-w-md bg-bg-secondary/50 backdrop-blur-xl border border-border-ui p-10 rounded-[2.5rem] shadow-2xl transition-all duration-300">
        <div class="text-center mb-6 relative z-10">
            <!-- Logo Master - Bem grande e centralizada -->
            <img src={logo} alt="Logo" class="h-64 sm:h-80 mx-auto mb-0 drop-shadow-[0_0_20px_rgba(222,110,39,0.25)]" />
            <div class="-mt-10 sm:-mt-14 relative z-20">
                <h1 class="text-text-primary text-3xl font-bold mb-1">Acesso</h1>
                <p class="text-text-secondary text-sm">Portal Comunidade São Miguel</p>
            </div>
        </div>

        <form onsubmit={handleSubmit} class="space-y-5">
            <div class="space-y-2">
                <label for="email" class="text-text-secondary text-xs font-bold uppercase ml-1">E-mail</label>
                <input 
                    id="email" 
                    bind:value={email} 
                    type="email" 
                    required 
                    class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all placeholder:opacity-30" 
                    placeholder="seu@email.com"
                />
            </div>

            <div class="space-y-2">
                <label for="password" class="text-text-secondary text-xs font-bold uppercase ml-1">Senha</label>
                <input 
                    id="password" 
                    bind:value={password} 
                    type="password" 
                    required 
                    class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all placeholder:opacity-30" 
                    placeholder="••••••••"
                />
            </div>

            {#if error}
                <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center animate-shake">
                    ⚠️ {error}
                </div>
            {/if}

            <button 
                type="submit" 
                disabled={loading} 
                class="w-full bg-brand text-white p-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand/20"
            >
                {loading ? "Entrando..." : "Entrar no Sistema"}
            </button>
        </form>

        <footer class="mt-8 text-center">
            <button onclick={() => onGoToRegister()} class="text-text-secondary text-sm hover:text-text-primary transition-colors group">
                Novo por aqui? <span class="text-brand font-bold group-hover:underline">Crie sua conta</span>
            </button>
        </footer>
    </div>
</div>

<style>
    :global(.animate-shake) {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
</style>
