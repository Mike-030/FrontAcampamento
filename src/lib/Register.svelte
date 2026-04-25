<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    
    /** @type {{ onBackToLogin: Function }} */
    let { onBackToLogin } = $props();

    // Estados dos formulários (Raw data para o banco)
    let formData = $state({
        name: "", email: "", password: "",
        cpf: "", phone: "", birthday: "",
        sex: "M", is_counselor: false,
        document: "", picture: "", marital_status_id: 1
    });

    // Estados de exibição (Com máscara)
    let maskedCpf = $state("");
    let maskedPhone = $state("");
    let maskedDocument = $state("");

    let loading = $state(false);
    let error = $state("");
    let success = $state(false);

    // Controle do Date Picker Personalizado
    let showDatePicker = $state(false);
    let tempDay = $state(new Date().getDate());
    let tempMonth = $state(new Date().getMonth() + 1);
    let tempYear = $state(new Date().getFullYear() - 20);

    const days = Array.from({length: 31}, (_, i) => i + 1);
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @param {string} val */
    function applyCpfMask(val) {
        let clean = val.replace(/\D/g, "");
        formData.cpf = clean;
        return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    }

    /** @param {string} val */
    function applyPhoneMask(val) {
        let clean = val.replace(/\D/g, "");
        formData.phone = clean;
        if (clean.length <= 10) {
            return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3").substring(0, 14);
        }
        return clean.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4").substring(0, 16);
    }

    /** @param {string} val */
    function applyRgMask(val) {
        let clean = val.replace(/\D/g, "");
        formData.document = clean;
        return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4").substring(0, 12);
    }

    function confirmDate() {
        const monthStr = tempMonth.toString().padStart(2, '0');
        const dayStr = tempDay.toString().padStart(2, '0');
        formData.birthday = `${tempYear}-${monthStr}-${dayStr}`;
        showDatePicker = false;
    }

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
                error = data.errors ? Object.values(data.errors).flat()[0] : data.message;
            }
        } catch (err) {
            error = "Erro técnico de conexão.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center p-4 py-20 bg-bg-primary transition-colors duration-300">
    <div class="w-full max-w-2xl bg-bg-secondary/50 backdrop-blur-2xl border border-border-ui p-10 rounded-[3rem] shadow-2xl relative">
        
        <header class="text-center mb-10">
            <img src={logo} alt="Logo" class="h-28 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(222,110,39,0.1)]" />
            <h1 class="text-text-primary text-3xl font-bold mb-2">Cadastre-se</h1>
            <p class="text-text-secondary text-sm">Crie seu perfil oficial</p>
        </header>

        {#if success}
            <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-10 rounded-3xl text-center">
                <p class="text-5xl mb-4">🚀</p>
                <h3 class="font-bold text-xl mb-1">Bem-vindo!</h3>
                <p class="text-sm">Redirecionando para o login...</p>
            </div>
        {:else}
            <form onsubmit={handleRegister} class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="name" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Nome Completo</label>
                        <input id="name" bind:value={formData.name} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="reg-email" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">E-mail</label>
                        <input id="reg-email" bind:value={formData.email} type="email" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="cpf" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">CPF</label>
                        <input 
                            id="cpf" 
                            bind:value={maskedCpf} 
                            oninput={(e) => { if (e.target instanceof HTMLInputElement) maskedCpf = applyCpfMask(e.target.value); }} 
                            placeholder="000.000.000-00" 
                            required 
                            class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" 
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="phone" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">WhatsApp</label>
                        <input 
                            id="phone" 
                            bind:value={maskedPhone} 
                            oninput={(e) => { if (e.target instanceof HTMLInputElement) maskedPhone = applyPhoneMask(e.target.value); }} 
                            placeholder="(00) 0 0000-0000" 
                            required 
                            class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" 
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="birthday-btn" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Data de Nascimento</label>
                        <button id="birthday-btn" type="button" onclick={() => showDatePicker = true} class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-left text-text-primary focus:border-brand transition-all flex justify-between items-center">
                            {formData.birthday ? formData.birthday.split('-').reverse().join('/') : "Selecionar Data"}
                            <span class="text-brand">📅</span>
                        </button>
                    </div>

                    <div class="space-y-1.5">
                        <label for="document" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">RG</label>
                        <input 
                            id="document" 
                            bind:value={maskedDocument} 
                            oninput={(e) => { if (e.target instanceof HTMLInputElement) maskedDocument = applyRgMask(e.target.value); }} 
                            placeholder="00.000.000-0" 
                            required 
                            class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" 
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="sex" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Gênero</label>
                        <select id="sex" bind:value={formData.sex} class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary outline-none focus:border-brand">
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                        </select>
                    </div>

                    <div class="space-y-1.5 md:col-span-2">
                        <label for="picture" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Link para sua foto</label>
                        <input id="picture" bind:value={formData.picture} type="url" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" />
                    </div>

                    <div class="space-y-1.5 md:col-span-2">
                        <label for="reg-password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Senha de Acesso</label>
                        <input id="reg-password" bind:value={formData.password} type="password" minlength="8" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none" />
                    </div>
                </div>

                {#if error}
                    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs text-center">⚠️ {error}</div>
                {/if}

                <button type="submit" disabled={loading} class="w-full bg-brand text-white p-5 rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-brand/20 disabled:opacity-50">
                    {loading ? "Processando..." : "Criar minha conta"}
                </button>
            </form>
        {/if}

        <footer class="mt-8 text-center">
            <button type="button" onclick={() => onBackToLogin()} class="text-text-secondary text-sm hover:text-text-primary">
                Já tem cadastro? <span class="text-brand font-bold">Voltar</span>
            </button>
        </footer>
    </div>
</div>

{#if showDatePicker}
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onclick={() => showDatePicker = false} aria-hidden="true">
        <div class="w-full max-w-sm bg-bg-secondary p-8 rounded-[2.5rem] shadow-2xl border border-border-ui animate-slide-up" onclick={(e) => e.stopPropagation()} aria-hidden="true">
            <h3 class="text-center text-text-primary font-black mb-8 uppercase tracking-widest">Data de Nascimento</h3>
            
            <div class="flex gap-4 h-48 overflow-hidden relative">
                <div class="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-bg-secondary to-transparent z-10 pointer-events-none"></div>
                <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-secondary to-transparent z-10 pointer-events-none"></div>

                <div class="flex-1 overflow-y-auto scrollbar-hide text-center py-20">
                    {#each days as d}
                        <button type="button" class="block w-full py-2 text-lg {tempDay === d ? 'text-brand font-black' : 'text-text-secondary opacity-30'}" onclick={() => tempDay = d}>{d}</button>
                    {/each}
                </div>
                <div class="flex-[2] overflow-y-auto scrollbar-hide text-center py-20">
                    {#each months as m, i}
                        <button type="button" class="block w-full py-2 text-lg {tempMonth === i + 1 ? 'text-brand font-black' : 'text-text-secondary opacity-30'}" onclick={() => tempMonth = i + 1}>{m}</button>
                    {/each}
                </div>
                <div class="flex-1 overflow-y-auto scrollbar-hide text-center py-20">
                    {#each years as y}
                        <button type="button" class="block w-full py-2 text-lg {tempYear === y ? 'text-brand font-black' : 'text-text-secondary opacity-30'}" onclick={() => tempYear = y}>{y}</button>
                    {/each}
                </div>
            </div>

            <button type="button" onclick={confirmDate} class="w-full mt-8 bg-brand text-white p-4 rounded-2xl font-bold shadow-lg shadow-brand/20">
                Confirmar Data
            </button>
        </div>
    </div>
{/if}

<style>
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
</style>
