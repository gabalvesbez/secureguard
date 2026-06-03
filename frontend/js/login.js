document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch('https://secureguard-fyln.onrender.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('secureguard_token', data.access_token);
            localStorage.setItem('secureguard_email', email);
            window.location.href = 'index.html'; // Vai para o cofre
        } else {
            alert(`Falha no login: ${data.detail || 'Credenciais inválidas'}`);
        }
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
    }
});