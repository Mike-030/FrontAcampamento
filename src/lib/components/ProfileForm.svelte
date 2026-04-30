<script>
    let {
        userData = $bindable({}),
        updateProfile,
        defaultAvatar = "",
    } = $props();
</script>

<div
    class="bg-bg-secondary p-10 rounded-[3rem] border border-border-ui shadow-sm max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500"
>
    <div class="flex items-center gap-6 mb-10">
        <img
            src={userData.picture && userData.picture.startsWith("http")
                ? userData.picture
                : defaultAvatar}
            alt="Avatar"
            class="w-24 h-24 rounded-full border-4 border-brand object-cover shadow-xl shadow-brand/20"
        />
        <div>
            <h3 class="text-3xl font-black text-text-primary">
                Configurações de Perfil
            </h3>
            <p class="text-text-secondary mt-1 font-medium">
                Edite suas informações pessoais e credenciais.
            </p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-2">
            <label
                class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >Nome Completo</label
            >
            <input
                type="text"
                bind:value={userData.name}
                class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm"
            />
        </div>
        <div class="space-y-2">
            <label
                class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >Email</label
            >
            <input
                type="email"
                bind:value={userData.email}
                class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm"
            />
        </div>
        <div class="space-y-2">
            <label
                class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >Telefone / Celular</label
            >
            <input
                type="text"
                value={(() => {
                    let v = userData.phone || "";
                    v = v.replace(/\D/g, "");
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                    return v;
                })()}
                oninput={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                    userData.phone = v;
                    e.target.value = v;
                }}
                maxlength="15"
                placeholder="(00) 00000-0000"
                class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm"
            />
        </div>
        <div class="space-y-2">
            <label
                class="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1"
                >Documento (CPF)</label
            >
            <input
                type="text"
                value={(() => {
                    let cpf = userData.cpf || userData.document || "";
                    cpf = cpf.replace(/\D/g, "");
                    if (cpf.length === 11) {
                        return cpf.replace(
                            /(\d{3})(\d{3})(\d{3})(\d{2})/,
                            "$1.$2.$3-$4",
                        );
                    }
                    return cpf;
                })()}
                class="w-full bg-bg-primary border border-border-ui rounded-2xl px-5 py-4 text-text-primary font-medium focus:outline-none focus:border-brand transition-all shadow-sm opacity-60 cursor-not-allowed"
                readonly
            />
        </div>
    </div>

    <div class="pt-10 mt-10 border-t border-border-ui flex justify-end">
        <button
            onclick={updateProfile}
            class="bg-brand text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-brand/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/30"
        >
            Salvar Alterações
        </button>
    </div>
</div>
