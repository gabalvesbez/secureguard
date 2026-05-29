// ==========================================
// FORMULÁRIO DE REGISTO (SUBMISSÃO ASYNC)
// ==========================================
document.getElementById('formRegister').addEventListener('submit', async function(e) {
    
    // 1. Travamos o recarregamento automático da página
    e.preventDefault();

    // 2. Lemos os dados reais do ecrã (Corrigido com .value!)
    const emailDigitado = document.getElementById('inputEmail').value;
    const passwordDigitada = document.getElementById('inputPassword').value;
    const primeiroNome = document.getElementById('inputFirstName').value;
    const ultimoNome = document.getElementById('inputLastName').value;
    
    // Juntamos o nome e o sobrenome numa única string de texto limpa
    const nomeCompleto = primeiroNome + " " + ultimoNome;

    // 3. Criamos o objeto exato que o teu Backend (schemas.py) espera
    const dadosParaOBackend = {
        nome: nomeCompleto, // Corrigido!
        email: emailDigitado,
        password: passwordDigitada,
        cargo: "operador"
    };

    console.log("A enviar os dados para o Python...", dadosParaOBackend);

    try {
        // 4. O carteiro faz a viagem até à API e AGUARDA (await)
        const resposta = await fetch('http://127.0.0.1:8000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaOBackend)
        });

        // 5. Desembalamos a resposta do Python
        const dadosRecebidos = await resposta.json();

        // 6. Verificamos se o FastAPI aceitou o registo
        if (resposta.ok) {
            console.log("🎉 Utilizador criado com sucesso no Supabase:", dadosRecebidos);
            alert("Conta criada com sucesso! Podes fazer login.");
            
            // Comentado para poderes analisar a consola sem que a página fuja!
            // window.location.href = "login.html";
        } else {
            console.error("O backend recusou o registo:", dadosRecebidos);
            alert(`Erro no registo: ${dadosRecebidos.detail || "Verifica os dados."}`);
        }

    } catch (error) {
        console.error("Erro catastrófico de rede:", error);
        alert("Não foi possível conectar ao servidor. Garante que o Python está ligado!");
    }
});

const campoPassword = document.getElementById('inputPassword');
const botaoOlho = document.getElementById('btnMostrarPassword');

botaoOlho.addEventListener('click', function(e) {
    e.preventDefault();
    const icone = botaoOlho.querySelector('i');
    
    if (campoPassword.type === 'password') {
        campoPassword.type = 'text';
        icone.classList.remove('fa-eye');
        icone.classList.add('fa-eye-slash');
    } else {
        campoPassword.type = 'password';
        icone.classList.remove('fa-eye-slash');
        icone.classList.add('fa-eye');
    }
});