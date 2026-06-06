document.addEventListener("DOMContentLoaded", () => {
    // 1. URL da tua API no Render (substitui pelo teu link real)
    const BACKEND_URL = "https://O-TEU-LINK-DO-RENDER.onrender.com";
 
    function checkServerHealth() {
        console.log("A verificar se o servidor está acordado...");
 
        fetch(`${BACKEND_URL}/health`)
            .then(response => {
                if (response.ok) {
                    console.log("Servidor online! A redirecionar para o login.");
                    window.location.href = "login.html";
                } else {
                    setTimeout(checkServerHealth, 3000);
                }
            })
            .catch(error => {
                console.log("Servidor em Cold Start. A tentar novamente em 3 segundos...");
                setTimeout(checkServerHealth, 3000);
            });
    }
 
    checkServerHealth();
});
 