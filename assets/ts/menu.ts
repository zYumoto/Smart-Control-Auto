document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Exibir o email do usuário
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement && userEmail) {
        userEmailElement.textContent = userEmail;
    }

    // Funcionalidade do botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e: Event) => {
            e.preventDefault();
            
            // Limpar dados de autenticação
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            
            // Redirecionar para a página de login
            window.location.href = 'index.html';
        });
    }

    // Funcionalidade do menu hamburger
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Fechar o menu ao clicar em um link
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});
