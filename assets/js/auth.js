document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');

    // Se não estiver logado e não estamos na página de login ou cadastro, redirecionar para a página de login
    const currentPage = window.location.pathname.split('/').pop();
    if ((!isLoggedIn || isLoggedIn !== 'true') && 
        currentPage !== 'index.html' && 
        currentPage !== 'cadastro-usuario.html') {
        window.location.href = 'index.html';
        return;
    }

    // Verificar se há um usuário atual no localStorage
    if (isLoggedIn === 'true' && userEmail) {
        // Verificar se já existe um objeto de usuário atual
        if (!localStorage.getItem('currentUser')) {
            // Buscar os dados do usuário na lista de usuários registrados
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const currentUser = registeredUsers.find(user => user.contact?.email === userEmail);
            
            if (currentUser) {
                // Salvar o usuário atual no localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    }

    // Funcionalidade do botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Confirmar logout
            if (confirm('Deseja realmente sair?')) {
                // Limpar dados de autenticação
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('currentUser');
                
                // Redirecionar para a página de login
                window.location.href = 'index.html';
            }
        });
    }

    // Inicializar o dropdown de perfil se estiver na página que não seja de login ou cadastro
    if (isLoggedIn === 'true' && 
        currentPage !== 'index.html' && 
        document.getElementById('profile-btn')) {
        
        initProfileDropdown();
    }
});

// Inicializar o dropdown de perfil
function initProfileDropdown() {
    const profileButton = document.getElementById('profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileImage = document.getElementById('profile-image');
    const userName = document.getElementById('user-name');
    
    // Carregar dados do usuário atual
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Atualizar nome do usuário
        userName.textContent = currentUser.fullname || 'Meu Perfil';
        
        // Atualizar foto de perfil
        if (currentUser.profilePhoto) {
            profileImage.src = currentUser.profilePhoto;
        }
    }
    
    // Toggle dropdown ao clicar no botão de perfil
    profileButton.addEventListener('click', () => {
        profileDropdown.classList.toggle('active');
    });
    
    // Fechar dropdown ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
}
