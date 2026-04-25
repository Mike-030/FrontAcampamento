<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    
    /** @type {{ onBackToLogin: Function }} */
    let { onBackToLogin } = $props();

    let formData = $state({
        name: "", email: "", password: "",
        cpf: "", phone: "", birthday: "",
        sex: "M", is_counselor: false,
        document: "", picture: "", marital_status_id: 1
    });

    let maritalStatuses = $state([
        { id: 1, name: "Solteiro(a)" },
        { id: 2, name: "Casado(a)" },
        { id: 3, name: "Divorciado(a)" },
        { id: 4, name: "Viúvo(a)" }
    ]);
    
    let loading = $state(false);
    let error = $state("");
    let success = $state(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @param {Event} e */
    async function handleRegister(e) {
        if (e) e.preventDefault();
        loading = true;
        error = "";

        try {
            const response = await fetch(`${API_URL}/v1/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    is_counselor: formData.is_counselor ? 1 : 0
                }),
            });

            const data = await response.json();

            if (response.ok) {
                success = true;
                setTimeout(() => onBackToLogin(), 2500);
            } else {
                if (data.errors) {
                    error = Object.values(data.errors).flat()[0];
                } else {
                    error = data.message || "Erro ao cadastrar.";
                }
            }
        } catch (err) {
            error = "Erro técnico de conexão.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center p-4 py-20 bg-bg-primary transition-colors duration-300">
    <div class="w-full max-w-2xl bg-bg-secondary/50 backdrop-blur-2xl border border-border-ui p-10 rounded-[3rem] shadow-2xl">
        
        <header class="text-center mb-10">
            <img src={logo} alt="Logo" class="h-28 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(222,110,39,0.1)]" />
            <h1 class="text-text-primary text-3xl font-bold mb-2">Cadastre-se</h1>
            <p class="text-text-secondary text-sm">Crie seu perfil para os festivais</p>
        </header>

        {#if success}
            <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-10 rounded-3xl text-center">
                <p class="text-5xl mb-4">✨</p>
                <h3 class="font-bold text-xl mb-1 text-emerald-600 dark:text-emerald-400">Tudo pronto!</h3>
                <p class="text-sm opacity-70">Cadastro efetuado com sucesso.</p>
            </div>
        {:else}
            <form onsubmit={handleRegister} class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="name" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Nome Completo</label>
                        <input id="name" bind:value={formData.name} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="reg-email" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">E-mail</label>
                        <input id="reg-email" bind:value={formData.email} type="email" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="cpf" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">CPF (apenas números)</label>
                        <input id="cpf" bind:value={formData.cpf} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="phone" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Whatsapp</label>
                        <input id="phone" bind:value={formData.phone} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="birthday" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Data de Nascimento</label>
                        <input id="birthday" bind:value={formData.birthday} type="date" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="sex" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Gênero</label>
                        <select id="sex" bind:value={formData.sex} class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary outline-none focus:border-brand transition-all">
                            <option value="M" class="bg-bg-primary">Masculino</option>
                            <option value="F" class="bg-bg-primary">Feminino</option>
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="marital_status" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Estado Civil</label>
                        <select id="marital_status" bind:value={formData.marital_status_id} class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary outline-none focus:border-brand transition-all">
                            {#each maritalStatuses as status}
                                <option value={status.id} class="bg-bg-primary">{status.name}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="document" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Número RG</label>
                        <input id="document" bind:value={formData.document} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5 md:col-span-2">
                        <label for="picture" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Link para sua foto de perfil</label>
                        <input id="picture" bind:value={formData.picture} type="text" placeholder="https://..." required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>

                    <div class="space-y-1.5 md:col-span-2">
                        <label for="reg-password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Crie sua senha</label>
                        <input id="reg-password" bind:value={formData.password} type="password" minlength="8" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all" />
                    </div>
                </div>

                <div class="flex items-center gap-3 bg-bg-primary/30 p-4 rounded-2xl border border-border-ui">
                    <input bind:checked={formData.is_counselor} type="checkbox" id="counselor" class="w-5 h-5 accent-brand" />
                    <label for="counselor" class="text-text-secondary text-sm cursor-pointer">Sou conselheiro(a) oficial</label>
                </div>

                {#if error}
                    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs text-center border-dashed">⚠️ {error}</div>
                {/if}

                <button type="submit" disabled={loading} class="w-full bg-brand text-white p-5 rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-brand/20 disabled:opacity-50">
                    {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                </button>
            </form>
        {/if}

        <footer class="mt-8 text-center">
            <button onclick={() => onBackToLogin()} class="text-text-secondary text-sm hover:text-text-primary transition-colors hover:underline">
                Já tem cadastro? <span class="text-brand font-bold">Voltar para Login</span>
            </button>
        </footer>
    </div>
</div>
