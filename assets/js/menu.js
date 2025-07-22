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
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Limpar dados de autenticação
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            
            // Redirecionar para a página de login
            window.location.href = 'index.html';
        });
    }
    
    // Adicionar classe 'active' ao tile do menu correspondente à página atual
    const currentPage = window.location.pathname.split('/').pop();
    const menuTiles = document.querySelectorAll('.menu-tile');
    
    menuTiles.forEach(tile => {
        const tileHref = tile.getAttribute('href');
        if (tileHref === currentPage) {
            tile.classList.add('active');
        }
    });
});
