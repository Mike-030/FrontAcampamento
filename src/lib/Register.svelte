<script>
    import logo from "../assets/LogoComunidadeSaoMiguel.png";
    import bgHero from "../assets/SaoMiguelArcanjo.png";
    
    /** @type {{ onGoToLogin: Function }} */
    let { onGoToLogin } = $props();

    let formData = $state({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        cpf: "",
        phone: "",
        document: "", 
        gender: "",
        birth_date: ""
    });

    let loading = $state(false);
    let error = $state("");
    let success = $state(false);

    let maskedCpf = $state("");
    let maskedPhone = $state("");
    let maskedDocument = $state("");

    // Date Picker States
    let selectedDay = $state(1);
    let selectedMonth = $state(1);
    let selectedYear = $state(2000);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 110 }, (_, i) => currentYear - i);

    // LÓGICA DINÂMICA DE DIAS
    let daysInMonth = $derived(new Date(selectedYear, selectedMonth, 0).getDate());
    let daysList = $derived(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    // Efeito para corrigir o dia se o mês mudar
    $effect(() => {
        if (selectedDay > daysInMonth) {
            selectedDay = daysInMonth;
        }
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    /** @param {string} val */
    function applyCpfMask(val) {
        let v = val.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    /** @param {string} val */
    function applyPhoneMask(val) {
        let v = val.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        return v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }

    /** @param {string} val */
    function applyRgMask(val) {
        let v = val.replace(/\D/g, "");
        if (v.length > 9) v = v.slice(0, 9);
        return v.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
    }

    /** @param {SubmitEvent} e */
    async function handleRegister(e) {
        if (e) e.preventDefault();
        loading = true;
        error = "";

        if (formData.password !== formData.password_confirmation) {
            error = "As senhas não coincidem.";
            loading = false;
            return;
        }

        const payload = {
            ...formData,
            cpf: maskedCpf.replace(/\D/g, ""),
            phone: maskedPhone.replace(/\D/g, ""),
            document: maskedDocument.replace(/\D/g, ""),
            birth_date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
        };

        try {
            const response = await fetch(`${API_URL}/v1/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                success = true;
                setTimeout(() => onGoToLogin(), 3000);
            } else {
                error = data.message || "Erro ao realizar cadastro.";
                if (data.errors) error = Object.values(data.errors)[0][0];
            }
        } catch (err) {
            error = "Erro de conexão com o servidor.";
        } finally {
            loading = false;
        }
    }

    /** @param {HTMLElement} node */
    function dragScroll(node) {
        let isDown = false;
        let startY = 0;
        let scrollTop = 0;

        node.addEventListener('mousedown', (e) => {
            isDown = true;
            node.classList.add('cursor-grabbing');
            startY = e.pageY - node.offsetTop;
            scrollTop = node.scrollTop;
            e.preventDefault();
        });

        const endDrag = () => {
            isDown = false;
            node.classList.remove('cursor-grabbing');
        };

        window.addEventListener('mouseup', endDrag);
        
        node.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            if (e.buttons === 1) {
                const y = e.pageY - node.offsetTop;
                const walk = (y - startY) * 1.5;
                node.scrollTop = scrollTop - walk;
            }
        });

        node.addEventListener('scroll', () => {
            const containerCenter = node.getBoundingClientRect().top + (node.offsetHeight / 2);
            const items = node.querySelectorAll('.picker-item');
            
            /** @type {{val: string} | null} */
            let closestItem = null;
            let minDistance = Infinity;

            items.forEach((item) => {
                if (!(item instanceof HTMLElement)) return;
                const itemCenter = item.getBoundingClientRect().top + (item.offsetHeight / 2);
                const distance = Math.abs(containerCenter - itemCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    const valAttr = item.getAttribute('data-val');
                    if (valAttr) closestItem = { val: valAttr };
                }
            });

            if (closestItem) {
                const val = parseInt(closestItem.val);
                if (node.id === "scroll-day" && selectedDay !== val) selectedDay = val;
                if (node.id === "scroll-month" && selectedMonth !== val) selectedMonth = val;
                if (node.id === "scroll-year" && selectedYear !== val) selectedYear = val;
            }
        });
    }
</script>

<div class="fixed inset-0 w-full h-full flex flex-col bg-bg-primary overflow-y-auto">
    
    <div class="flex-1 flex items-center justify-center p-4">
        <div class="w-full max-w-5xl bg-bg-secondary border border-border-ui shadow-2xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row transition-all duration-300">
            
            <!-- Lado Visual -->
            <div class="hidden md:block md:w-1/3 relative bg-bg-primary/30 border-r border-border-ui/50 overflow-hidden">
                <div class="absolute inset-0 p-10 flex flex-col justify-between z-10">
                    <div class="flex flex-col items-center text-center">
                        <img src={logo} alt="Logo" class="w-full max-w-[280px] -mt-6 mb-4 drop-shadow-2xl" />
                        <h2 class="text-5xl font-black text-text-primary leading-[1.1] mb-6">Junte-se a <br><span class="text-brand">Nós!</span></h2>
                        <p class="text-text-secondary text-xs font-bold opacity-50 uppercase tracking-[0.2em] px-6">Comunidade <br> São Miguel Arcanjo</p>
                    </div>

                    <div class="p-8 bg-bg-secondary/60 backdrop-blur-xl rounded-[2.5rem] border border-border-ui shadow-xl">
                        <p class="text-xs font-black text-brand uppercase tracking-widest mb-4">Instruções</p>
                        <ul class="text-[11px] text-text-primary font-medium space-y-3 opacity-90">
                            <li class="flex items-start gap-2"><span class="text-brand">✔</span> Nome completo para o certificado</li>
                            <li class="flex items-start gap-2"><span class="text-brand">✔</span> E-mail para recebimento de avisos</li>
                            <li class="flex items-start gap-2"><span class="text-brand">✔</span> Senha com no mínimo 8 caracteres</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Formulário -->
            <div class="w-full md:w-2/3 p-6 md:p-14 lg:p-20 py-12">
                <!-- LOGO MOBILE -->
                <div class="flex justify-center md:hidden mb-6 -mt-4">
                    <img src={logo} alt="Logo Mobile" class="h-48 drop-shadow-xl" />
                </div>

                <header class="text-center mb-12">
                    <h1 class="text-text-primary text-4xl font-black mb-2">Cadastrar</h1>
                    <p class="text-text-secondary text-xs font-bold opacity-60 uppercase tracking-widest">Preencha seus dados para continuar</p>
                </header>

                {#if success}
                    <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-10 rounded-3xl text-center">
                        <p class="text-5xl mb-4">🚀</p>
                        <h3 class="font-bold text-xl mb-1">Bem-vindo!</h3>
                        <p class="text-sm">Seu acesso foi criado. Redirecionando...</p>
                    </div>
                {:else}
                    <form onsubmit={handleRegister} class="space-y-6">
                        
                        {#if error}
                            <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs text-center border-dashed mb-4">
                                {error}
                            </div>
                        {/if}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            
                            <div class="space-y-1.5 md:col-span-2">
                                <label for="name" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Nome Completo</label>
                                <input id="name" bind:value={formData.name} type="text" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" placeholder="Seu nome aqui" />
                            </div>

                            <div class="space-y-1.5 md:col-span-2">
                                <label for="reg-email" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">E-mail</label>
                                <input id="reg-email" bind:value={formData.email} type="email" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" placeholder="exemplo@gmail.com" />
                            </div>

                            <div class="space-y-1.5">
                                <label for="cpf" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">CPF</label>
                                <input id="cpf" value={maskedCpf} oninput={(e) => maskedCpf = applyCpfMask(e.currentTarget.value)} placeholder="000.000.000-00" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" />
                            </div>

                            <div class="space-y-1.5">
                                <label for="phone" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">WhatsApp</label>
                                <input id="phone" value={maskedPhone} oninput={(e) => maskedPhone = applyPhoneMask(e.currentTarget.value)} placeholder="(00) 0 0000-0000" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" />
                            </div>

                            <div class="space-y-1.5">
                                <label for="gender" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Gênero</label>
                                <select id="gender" bind:value={formData.gender} required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all appearance-none">
                                    <option value="">Selecione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="O">Prefiro não dizer</option>
                                </select>
                            </div>

                            <div class="space-y-1.5">
                                <label for="document" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">RG</label>
                                <input id="document" value={maskedDocument} oninput={(e) => maskedDocument = applyRgMask(e.currentTarget.value)} placeholder="00.000.000-0" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" />
                            </div>

                            <!-- Data de Nascimento -->
                            <div class="space-y-3 md:col-span-2">
                                <p class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Data de Nascimento</p>
                                <div class="bg-bg-primary/50 border border-border-ui rounded-3xl p-6 relative overflow-hidden h-48 flex items-center justify-around group">
                                    <div class="absolute left-4 right-4 h-12 border-y-2 border-brand/20 bg-brand/5 pointer-events-none rounded-xl shadow-inner shadow-brand/10"></div>

                                    <!-- Dia -->
                                    <div id="scroll-day" use:dragScroll class="w-1/4 h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth text-center z-10 select-none" style="scrollbar-width: none; touch-action: pan-y;">
                                        <div class="h-[72px]"></div>
                                        {#each daysList as d}
                                            <div data-val={d} class="picker-item h-12 flex items-center justify-center font-black text-xl snap-center transition-all duration-300 {selectedDay === d ? 'text-brand scale-110' : 'text-text-secondary opacity-10 scale-90'}">{String(d).padStart(2, '0')}</div>
                                        {/each}
                                        <div class="h-[72px]"></div>
                                    </div>

                                    <!-- Mês -->
                                    <div id="scroll-month" use:dragScroll class="w-1/3 h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth text-center z-10 select-none" style="scrollbar-width: none; touch-action: pan-y;">
                                        <div class="h-[72px]"></div>
                                        {#each months as m, i}
                                            <div data-val={i+1} class="picker-item h-12 flex items-center justify-center font-black text-sm snap-center transition-all duration-300 {selectedMonth === i + 1 ? 'text-brand scale-110' : 'text-text-secondary opacity-10 scale-90'}">{m}</div>
                                        {/each}
                                        <div class="h-[72px]"></div>
                                    </div>

                                    <!-- Ano -->
                                    <div id="scroll-year" use:dragScroll class="w-1/4 h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth text-center z-10 select-none" style="scrollbar-width: none; touch-action: pan-y;">
                                        <div class="h-[72px]"></div>
                                        {#each years as y}
                                            <div data-val={y} class="picker-item h-12 flex items-center justify-center font-black text-xl snap-center transition-all duration-300 {selectedYear === y ? 'text-brand scale-110' : 'text-text-secondary opacity-10 scale-90'}">{y}</div>
                                        {/each}
                                        <div class="h-[72px]"></div>
                                    </div>
                                </div>
                                <div class="px-2 flex items-center gap-2">
                                    <div class="flex-1 h-px bg-border-ui/30"></div>
                                    <p class="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">
                                        Data: <span class="text-brand">{String(selectedDay).padStart(2, '0')} de {months[selectedMonth - 1]} de {selectedYear}</span>
                                    </p>
                                    <div class="flex-1 h-px bg-border-ui/30"></div>
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label for="reg-password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Crie uma Senha</label>
                                <input id="reg-password" bind:value={formData.password} type="password" minlength="8" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" placeholder="••••••••" />
                            </div>

                            <div class="space-y-1.5">
                                <label for="confirm-password" class="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-1">Confirme a Senha</label>
                                <input id="confirm-password" bind:value={formData.password_confirmation} type="password" minlength="8" required class="w-full bg-bg-primary/50 border border-border-ui rounded-2xl p-4 text-text-primary focus:border-brand outline-none transition-all placeholder:text-text-secondary/60" placeholder="••••••••" />
                            </div>
                        </div>

                        <div class="pt-6">
                            <button type="submit" disabled={loading} class="w-full bg-brand text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand/20 disabled:opacity-50">
                                {loading ? "Cadastrando..." : "Confirmar Cadastro"}
                            </button>
                        </div>
                    </form>

                    <footer class="mt-10 text-center">
                        <button onclick={() => onGoToLogin()} class="text-text-secondary text-sm hover:text-text-primary transition-all">
                            Já tem uma conta? <span class="text-brand font-black hover:underline">Faça login</span>
                        </button>
                    </footer>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
