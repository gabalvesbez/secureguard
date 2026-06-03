document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('secureguard_token');
    const emailLogado = localStorage.getItem('secureguard_email');

    // Barreira de segurança padrão do nosso app
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (emailLogado) {
        document.getElementById('userLoggedEmail').innerText = emailLogado;
    }

    // Buscar logs da API
    try {
        const response = await fetch('https://secureguard-fyln.onrender.com/logs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const logs = await response.json();
            const corpoTabela = document.getElementById('corpoTabelaLogs');
            corpoTabela.innerHTML = '';

            if (logs.length === 0) {
                corpoTabela.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted">Nenhuma atividade registrada ainda.</td>
                    </tr>
                `;
                return;
            }

            logs.forEach(log => {
                // Formata a data e hora com precisão de segundos para auditoria
                const dataFormatada = new Date(log.criado_em).toLocaleString('pt-BR');
                
                // Badge de estilo com base no tipo de ação
                let badgeAcao = `<span class="badge bg-info">${log.acao}</span>`;
                if (log.acao === 'deletar_segredo') {
                    badgeAcao = `<span class="badge bg-danger">${log.acao}</span>`;
                } else if (log.acao === 'criar_segredo') {
                    badgeAcao = `<span class="badge bg-success">${log.acao}</span>`;
                }

                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td><code>#${log.id}</code></td>
                    <td>${badgeAcao}</td>
                    <td>${log.detalhes || 'Nenhum detalhe adicional.'}</td>
                    <td><i class="far fa-clock me-1 text-muted"></i>${dataFormatada}</td>
                `;
                corpoTabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar logs de auditoria:", error);
    }

    // Botão de Logout rápido
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('secureguard_token');
        localStorage.removeItem('secureguard_email');
        window.location.href = 'login.html';
    });
});