// Aguarda o HTML carregar completamente antes de rodar as lógicas
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. BARREIRA DE SEGURANÇA: Resgata o token e o e-mail guardados no login
    const token = localStorage.getItem('secureguard_token');
    const emailLogado = localStorage.getItem('secureguard_email');

    // Se o token NÃO existir, barra o acesso imediatamente e manda para o login
    if (!token) {
        window.location.href = 'login.html';
        return; // Interrompe a execução do resto do código
    }

    // Altera o texto do menu lateral para mostrar o e-mail real do usuário logado
    if (emailLogado) {
        document.getElementById('userLoggedEmail').innerText = emailLogado;
    }

    // -------------------------------------------------------------------------
    // FUNÇÃO PARA BUSCAR E LISTAR OS SEGREDOS DO BACKEND (GET)
    // -------------------------------------------------------------------------
    async function carregarSegredos() {
        try {
            // Repare na ligação: Mandamos a requisição para a rota /secrets do Python
            // Mas precisamos passar o Token no cabeçalho (Authorization) para provar quem somos!
            const response = await fetch('http://127.0.0.1:8000/secrets', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const segredos = await response.json();
                const corpoTabela = document.getElementById('corpoTabelaSegredos');
                
                // Limpa a tabela (tira a mensagem de "A carregar...")
                corpoTabela.innerHTML = '';

                // Se o usuário não tiver nenhuma senha cadastrada ainda
                if (segredos.length === 0) {
                    corpoTabela.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-muted">Nenhum segredo guardado ainda. Comece adicionando um!</td>
                        </tr>
                    `;
                    return;
                }

                // Varre a lista de segredos vinda do Python e cria as linhas da tabela
                segredos.forEach(segredo => {
                    const dataFormatada = new Date(segredo.criado_em).toLocaleDateString('pt-PT');
                    
                    const linha = document.createElement('tr');
                    linha.innerHTML = `
                        <td><strong>${segredo.titulo}</strong></td>
                        <td><span class="badge bg-secondary">${segredo.servico}</span></td>
                        <td>
                            <div class="input-group input-group-sm">
                                <input type="password" class="form-control bg-light border-0" value="${segredo.valor_segredo}" readonly style="max-width: 250px;">
                                <button class="btn btn-outline-secondary btn-ver-segredo" type="button">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </td>
                        <td>${dataFormatada}</td>
                        <td>
                            <button class="btn btn-danger btn-sm btn-deletar-segredo" data-id="${segredo.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    corpoTabela.appendChild(linha);
                });

                // Ativar os botões de Mostrar/Ocultar que acabamos de desenhar na tabela
                configurarBotoesOlho();
                // Ativar os botões de Excluir
                configurarBotoesExcluir();

            } else {
                console.error("Erro ao buscar segredos do backend.");
            }
        } catch (error) {
            console.error("Erro de conexão ao carregar segredos:", error);
        }
    }

    // Chamamos a função para carregar a tabela assim que a página abre
    await carregarSegredos();

    // -------------------------------------------------------------------------
    // EVENTO PARA CADASTRAR UM NOVO SEGREDO (POST)
    // -------------------------------------------------------------------------
    const formNovoSegredo = document.getElementById('formNovoSegredo');
    formNovoSegredo.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Pega os inputs que estão dentro do Modal (Janela Flutuante)
        const titulo = document.getElementById('inputTitulo').value;
        const servico = document.getElementById('inputServico').value;
        const valor = document.getElementById('inputValor').value;

        // Monta o objeto exatamente no formato que o schemas.SegredoCriar do Python pede!
        const dadosSegredo = {
            titulo: titulo,
            servico: servico,
            valor_segredo: valor 
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/secrets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Passa o token para o Python saber de quem é a senha
                },
                body: JSON.stringify(dadosSegredo)
            });

            if (response.ok) {
                // Limpa o formulário
                formNovoSegredo.reset();

                // Fecha o Modal do Bootstrap de forma automática após o sucesso
                const modalElement = document.getElementById('modalNovoSegredo');
                const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
                modalBootstrap.hide();

                // Atualiza a tabela imediatamente para mostrar a nova senha cadastrada!
                await carregarSegredos();
            } else {
                alert("Erro ao salvar o segredo. Verifique os dados.");
            }
        } catch (error) {
            console.error("Erro ao conectar com a API de segredos:", error);
        }
    });

    // -------------------------------------------------------------------------
    // LÓGICA AUXILIAR: INTERRUPTOR DO OLHO NA TABELA
    // -------------------------------------------------------------------------
    function configurarBotoesOlho() {
        const botoes = document.querySelectorAll('.btn-ver-segredo');
        botoes.forEach(botao => {
            botao.addEventListener('click', () => {
                const inputPassword = botao.parentElement.querySelector('input');
                const icone = botao.querySelector('i');
                
                if (inputPassword.type === 'password') {
                    inputPassword.type = 'text';
                    icone.classList.remove('fa-eye');
                    icone.classList.add('fa-eye-slash');
                } else {
                    inputPassword.type = 'password';
                    icone.classList.remove('fa-eye-slash');
                    icone.classList.add('fa-eye');
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // LÓGICA AUXILIAR: ELIMINAR UM SEGREDO (DELETE)
    // -------------------------------------------------------------------------
    function configurarBotoesExcluir() {
        const botoes = document.querySelectorAll('.btn-deletar-segredo');
        botoes.forEach(botao => {
            botao.addEventListener('click', async () => {
                const idSegredo = botao.getAttribute('data-id');
                
                if (confirm("Tem certeza que deseja eliminar permanentemente este segredo?")) {
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/secrets/${idSegredo}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            // Recarrega a tabela limpa
                            await carregarSegredos();
                        } else {
                            alert("Não foi possível eliminar o segredo.");
                        }
                    } catch (error) {
                        console.error("Erro ao tentar deletar segredo:", error);
                    }
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // BOTÃO DE LOGOUT (SAIR)
    // -------------------------------------------------------------------------
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            // Limpa as chaves guardadas no navegador para deslogar de verdade
            localStorage.removeItem('secureguard_token');
            localStorage.removeItem('secureguard_email');
            // Redireciona para a tela de login
            window.location.href = 'login.html';
        });
    }
});