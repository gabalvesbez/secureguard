document.addEventListener("DOMContentLoaded", () => {
    // 1. URL da tua API no Render (Lembra-te de colocar o teu ID real do Render aqui!)
    const BACKEND_URL = "https://secureguard-fyln.onrender.com";
 
    // Elementos do DOM para animar o ecrã
    const statusMessage = document.getElementById("statusMessage");
    const progressFill = document.getElementById("progressFill");
    const terminal = document.getElementById("terminal");
    const footerDot = document.getElementById("footerDot");
    const footerLabel = document.getElementById("footerLabel");
    
    let attemptCount = 0;
    const maxDots = 5;

    // Função auxiliar para injetar linhas estilo terminal hacker
    function addLogLine(prefix, message, type = "warn") {
        if (!terminal) return;
        const line = document.createElement("div");
        line.className = `log-line ${type}`;
        line.innerHTML = `<span class="log-prefix">[${prefix}]</span> <span>${message}</span>`;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight; // Auto-scroll para baixo
    }

    function checkServerHealth() {
        attemptCount++;
        console.log(`Tentativa ${attemptCount}: A verificar se o servidor está acordado...`);
        
        // Atualiza os pontinhos de tentativa no ecrã (máximo 5)
        const dotIndex = (attemptCount - 1) % maxDots;
        const currentDot = document.getElementById(`dot-${dotIndex}`);
        if (currentDot) {
            currentDot.classList.add("active");
        }
        
        addLogLine("PING", `A contactar gateway de segurança (Tentativa ${attemptCount})...`, "warn");

        fetch(`${BACKEND_URL}/health`)
            .then(response => {
                if (response.ok) {
                    // SE ESTIVER ONLINE: Ativa os estilos de sucesso definidos no teu loading.css
                    statusMessage.textContent = "Ligação Segura Estabelecida!";
                    statusMessage.className = "status-message success";
                    
                    if (progressFill) {
                        progressFill.className = "progress-fill success";
                    }
                    if (footerDot) {
                        footerDot.className = "footer-status-dot online";
                    }
                    if (footerLabel) {
                        footerLabel.textContent = "ONLINE";
                    }
                    
                    addLogLine("OK", "Autenticação do servidor efetuada com sucesso.", "ok");
                    addLogLine("SYS", "A redirecionar para o painel de controlo...", "ok");

                    // Espera 1.5 segundos para o utilizador ver o sucesso e redireciona para o Dashboard!
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1500);
                } else {
                    handleRetry();
                }
            })
            .catch(error => {
                handleRetry();
            });
    }

    function handleRetry() {
        // Marca o ponto anterior como "feito/tentado" se quiseres o efeito visual
        const dotIndex = (attemptCount - 1) % maxDots;
        const currentDot = document.getElementById(`dot-${dotIndex}`);
        if (currentDot) {
            currentDot.classList.remove("active");
            currentDot.classList.add("done");
        }
        
        // O Render demora cerca de 50s em Cold Start, tentamos a cada 4 segundos
        setTimeout(checkServerHealth, 10000);
    }
 
    // Inicia a primeira verificação após 1 segundo
    setTimeout(checkServerHealth, 1000);
});