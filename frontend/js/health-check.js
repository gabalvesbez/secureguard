document.addEventListener("DOMContentLoaded", () => {
    const BACKEND_URL = "https://secureguard-fyln.onrender.com";
 
    const statusMessage = document.getElementById("statusMessage");
    const progressFill  = document.getElementById("progressFill");
    const terminal      = document.getElementById("terminal");
    const footerDot     = document.getElementById("footerDot");
    const footerLabel   = document.getElementById("footerLabel");
    const lockRing      = document.getElementById("lockRing");
 
    let attemptCount = 0;
    const MAX_DOTS = 5;
    const RETRY_INTERVAL = 5000; // 5s — responsivo mas sem spam
 
    // ── Helpers ─────────────────────────────────────────────────
 
    function addLogLine(prefix, message, type = "warn") {
        if (!terminal) return;
        const line = document.createElement("div");
        line.className = `log-line ${type}`;
        line.innerHTML = `<span class="log-prefix">[${prefix}]</span> <span>${message}</span>`;
        terminal.appendChild(line);
        // Mantém no máximo 8 linhas no terminal para não crescer infinitamente
        while (terminal.children.length > 8) {
            terminal.removeChild(terminal.firstChild);
        }
        terminal.scrollTop = terminal.scrollHeight;
    }
 
    function updateDots() {
        // Limpa todos
        for (let i = 0; i < MAX_DOTS; i++) {
            const d = document.getElementById(`dot-${i}`);
            if (d) { d.classList.remove("active", "done"); }
        }
        // Marca os anteriores como done, o atual como active
        const activeIndex = (attemptCount - 1) % MAX_DOTS;
        for (let i = 0; i < MAX_DOTS; i++) {
            const d = document.getElementById(`dot-${i}`);
            if (!d) continue;
            if (i < activeIndex) d.classList.add("done");
            else if (i === activeIndex) d.classList.add("active");
        }
    }
 
    function setSuccess() {
        if (statusMessage) {
            statusMessage.textContent = "Ligação Segura Estabelecida!";
            statusMessage.className = "status-message success";
        }
        if (progressFill) progressFill.className = "progress-fill success";
        if (footerDot)    footerDot.className = "footer-status-dot online";
        if (footerLabel)  footerLabel.textContent = "ONLINE";
 
        // Cadeado fica verde
        if (lockRing) {
            lockRing.style.background  = "rgba(22,163,74,0.15)";
            lockRing.style.borderColor = "rgba(22,163,74,0.4)";
            lockRing.style.animation   = "none";
            const svg = lockRing.querySelector("svg");
            if (svg) svg.style.fill = "#4ade80";
        }
 
        // Todos os dots verdes
        for (let i = 0; i < MAX_DOTS; i++) {
            const d = document.getElementById(`dot-${i}`);
            if (d) { d.classList.remove("active"); d.classList.add("done"); }
        }
    }
 
    // ── Health-check loop ────────────────────────────────────────
 
    function checkServerHealth() {
        attemptCount++;
        updateDots();
 
        if (statusMessage) {
            statusMessage.textContent = attemptCount === 1
                ? "A estabelecer ligação segura..."
                : `Servidor em Cold Start. A aguardar... (tentativa ${attemptCount})`;
        }
 
        addLogLine("PING", `A contactar gateway de segurança (Tentativa ${attemptCount})...`, "warn");
 
        fetch(`${BACKEND_URL}/health`)
            .then(response => {
                if (response.ok) {
                    setSuccess();
                    addLogLine("OK",  "Servidor operacional. Autenticação efetuada.", "ok");
                    addLogLine("SYS", "A redirecionar para o login...", "ok");
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1500);
                } else {
                    addLogLine("ERR", `Resposta inesperada: HTTP ${response.status}. A tentar novamente...`, "err");
                    setTimeout(checkServerHealth, RETRY_INTERVAL);
                }
            })
            .catch(() => {
                addLogLine("WAIT", `Sem resposta — Render ainda a acordar. Próxima tentativa em ${RETRY_INTERVAL / 1000}s...`, "err");
                setTimeout(checkServerHealth, RETRY_INTERVAL);
            });
    }
 
    // Começa de imediato — sem delay inicial desnecessário
    checkServerHealth();
});
