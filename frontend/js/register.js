document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // TOGGLE DE VISIBILIDADE DA PASSWORD
    // ==========================================
    const campoPassword = document.getElementById('inputPassword');
    const botaoOlho = document.getElementById('btnMostrarPassword');

    if (botaoOlho && campoPassword) {
        botaoOlho.addEventListener('click', function (e) {
            e.preventDefault();
            const icone = botaoOlho.querySelector('i');
            if (campoPassword.type === 'password') {
                campoPassword.type = 'text';
                if (icone) { icone.classList.remove('fa-eye'); icone.classList.add('fa-eye-slash'); }
            } else {
                campoPassword.type = 'password';
                if (icone) { icone.classList.remove('fa-eye-slash'); icone.classList.add('fa-eye'); }
            }
        });
    }

    // ==========================================
    // INDICADOR DE FORÇA DA PASSWORD
    // ==========================================
    const bars = document.querySelectorAll('.strength-bar');
    const colors = ['#dc2626', '#f97316', '#eab308', '#4ade80'];

    if (campoPassword && bars.length) {
        campoPassword.addEventListener('input', function () {
            const v = this.value;
            let score = 0;
            if (v.length >= 8)           score++;
            if (/[A-Z]/.test(v))         score++;
            if (/[0-9]/.test(v))         score++;
            if (/[^a-zA-Z0-9]/.test(v))  score++;
            bars.forEach((b, i) => {
                b.style.background = i < score ? colors[score - 1] : 'var(--border)';
            });
        });
    }

    // ==========================================
    // FORMULÁRIO DE REGISTO (SUBMISSÃO ASYNC)
    // ==========================================
    const formRegister = document.getElementById('formRegister');

    if (formRegister) {
        formRegister.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailDigitado    = document.getElementById('inputEmail').value.trim();
            const passwordDigitada = document.getElementById('inputPassword').value;
            const passwordConfirm  = document.getElementById('inputPasswordConfirm').value;
            const primeiroNome     = document.getElementById('inputFirstName').value.trim();
            const ultimoNome       = document.getElementById('inputLastName').value.trim();
            const nomeCompleto     = `${primeiroNome} ${ultimoNome}`.trim();

            // Validação básica client-side antes de ir ao servidor
            if (!nomeCompleto || !emailDigitado || !passwordDigitada) {
                alert("Por favor preenche todos os campos obrigatórios.");
                return;
            }
            if (passwordDigitada !== passwordConfirm) {
                alert("As palavras-passe não coincidem.");
                return;
            }
            if (passwordDigitada.length < 8) {
                alert("A palavra-passe deve ter pelo menos 8 caracteres.");
                return;
            }

            const dadosParaOBackend = {
                nome:     nomeCompleto,
                email:    emailDigitado,
                password: passwordDigitada,
                cargo:    "operador"
            };

            console.log("A enviar os dados para o backend...", dadosParaOBackend);

            try {
                const resposta = await fetch('https://secureguard-fyln.onrender.com/auth/register', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(dadosParaOBackend)
                });

                const dadosRecebidos = await resposta.json();

                if (resposta.ok) {
                    console.log("Utilizador criado com sucesso:", dadosRecebidos);
                    alert("Conta criada com sucesso! Podes fazer login.");
                    window.location.href = "login.html";
                } else {
                    console.error("O backend recusou o registo:", dadosRecebidos);
                    alert(`Erro no registo: ${dadosRecebidos.detail || "Verifica os dados."}`);
                }

            } catch (error) {
                console.error("Erro de rede:", error);
                alert("Não foi possível conectar ao servidor. Verifica a tua ligação.");
            }
        });
    }

});