// Classe para gerenciar o perfil do usuário
class UserProfile {
    constructor() {
        // Elementos do dropdown de perfil
        this.profileButton = document.getElementById('profile-btn');
        this.profileDropdown = document.querySelector('.profile-dropdown');
        this.profileImage = document.getElementById('profile-image');
        this.userName = document.getElementById('user-name');
        
        // Elementos da página de perfil
        this.userAvatar = document.getElementById('user-avatar');
        this.profileFullname = document.getElementById('profile-fullname');
        this.profileRole = document.getElementById('profile-role');
        
        // Elementos de informações pessoais
        this.infoFullname = document.getElementById('info-fullname');
        this.infoBirthdate = document.getElementById('info-birthdate');
        this.infoCpf = document.getElementById('info-cpf');
        
        // Elementos de contato
        this.infoEmail = document.getElementById('info-email');
        this.infoPhone = document.getElementById('info-phone');
        
        // Elementos de endereço
        this.infoCep = document.getElementById('info-cep');
        this.infoState = document.getElementById('info-state');
        this.infoCity = document.getElementById('info-city');
        this.infoNeighborhood = document.getElementById('info-neighborhood');
        this.infoFullAddress = document.getElementById('info-full-address');
        
        // Elementos de informações profissionais
        this.infoRole = document.getElementById('info-role');
        this.infoCreatedAt = document.getElementById('info-created-at');
        
        // Elementos do modal de foto
        this.photoModal = document.getElementById('photo-modal');
        this.changePhotoBtn = document.getElementById('change-photo-btn');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.photoUpload = document.getElementById('photo-upload');
        this.previewArea = document.querySelector('.preview-area');
        this.previewImage = document.getElementById('preview-image');
        this.cancelUploadBtn = document.getElementById('cancel-upload');
        this.savePhotoBtn = document.getElementById('save-photo');
        
        // Dados do usuário
        this.userData = null;
        
        // Inicializar eventos
        this.initEvents();
        
        // Carregar dados do perfil
        this.loadProfileData();
    }
    
    initEvents() {
        // Toggle dropdown ao clicar no botão de perfil
        this.profileButton.addEventListener('click', () => {
            this.profileDropdown.classList.toggle('active');
        });
        
        // Fechar dropdown ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (!this.profileButton.contains(e.target) && !this.profileDropdown.contains(e.target)) {
                this.profileDropdown.classList.remove('active');
            }
        });
        
        // Modal de foto
        this.changePhotoBtn.addEventListener('click', () => {
            this.photoModal.classList.add('active');
        });
        
        this.closeModalBtn.addEventListener('click', () => {
            this.closePhotoModal();
        });
        
        this.cancelUploadBtn.addEventListener('click', () => {
            this.closePhotoModal();
        });
        
        // Preview da foto
        this.photoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (file) {
                // Verificar se é uma imagem
                if (!file.type.match('image.*')) {
                    alert('Por favor, selecione uma imagem válida.');
                    return;
                }
                
                // Verificar tamanho (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB.');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    this.previewImage.src = e.target.result;
                    this.previewArea.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Salvar foto
        this.savePhotoBtn.addEventListener('click', () => {
            if (this.previewImage.src) {
                // Atualizar a foto do usuário
                this.updateProfilePhoto(this.previewImage.src);
                this.closePhotoModal();
            }
        });
    }
    
    loadProfileData() {
        // Verificar se há um usuário logado
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            this.userData = currentUser;
            
            // Atualizar nome do usuário no dropdown
            this.userName.textContent = currentUser.fullname || 'Meu Perfil';
            
            // Atualizar foto de perfil
            if (currentUser.profilePhoto) {
                this.profileImage.src = currentUser.profilePhoto;
                this.userAvatar.src = currentUser.profilePhoto;
            }
            
            // Atualizar informações do cabeçalho
            this.profileFullname.textContent = currentUser.fullname || '-';
            
            // Determinar o cargo com base no valor ou exibir o valor diretamente
            let roleDisplay = currentUser.professionalInfo?.role || '-';
            switch(roleDisplay.toLowerCase()) {
                case 'diretor':
                    roleDisplay = 'Diretor';
                    break;
                case 'gerente':
                    roleDisplay = 'Gerente';
                    break;
                case 'coordenador':
                    roleDisplay = 'Coordenador';
                    break;
                case 'analista':
                    roleDisplay = 'Analista';
                    break;
                case 'assistente':
                    roleDisplay = 'Assistente';
                    break;
                case 'estagiario':
                    roleDisplay = 'Estagiário';
                    break;
            }
            
            this.profileRole.textContent = roleDisplay;
            
            // Atualizar informações pessoais
            this.infoFullname.textContent = currentUser.personalInfo?.fullname || '-';
            
            // Formatar data de nascimento
            if (currentUser.personalInfo?.birthdate) {
                const birthdate = new Date(currentUser.personalInfo.birthdate);
                this.infoBirthdate.textContent = birthdate.toLocaleDateString('pt-BR');
            } else {
                this.infoBirthdate.textContent = '-';
            }
            
            this.infoCpf.textContent = currentUser.personalInfo?.cpf || '-';
            
            // Atualizar informações de contato
            this.infoEmail.textContent = currentUser.contact?.email || '-';
            this.infoPhone.textContent = currentUser.contact?.phone || '-';
            
            // Atualizar informações de endereço
            this.infoCep.textContent = currentUser.address?.cep || '-';
            this.infoState.textContent = currentUser.address?.state || '-';
            this.infoCity.textContent = currentUser.address?.city || '-';
            this.infoNeighborhood.textContent = currentUser.address?.neighborhood || '-';
            
            // Montar endereço completo
            const street = currentUser.address?.street || '';
            const number = currentUser.address?.number || '';
            const complement = currentUser.address?.complement ? `, ${currentUser.address.complement}` : '';
            
            if (street && number) {
                this.infoFullAddress.textContent = `${street}, ${number}${complement}`;
            } else {
                this.infoFullAddress.textContent = '-';
            }
            
            // Atualizar informações profissionais
            this.infoRole.textContent = roleDisplay;
            
            // Formatar data de criação
            if (currentUser.createdAt) {
                const createdAt = new Date(currentUser.createdAt);
                this.infoCreatedAt.textContent = createdAt.toLocaleDateString('pt-BR');
            } else {
                this.infoCreatedAt.textContent = '-';
            }
        } else {
            // Redirecionar para a página de login se não houver usuário logado
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'index.html';
        }
    }
    
    updateProfilePhoto(photoUrl) {
        // Atualizar a foto no objeto do usuário
        this.userData.profilePhoto = photoUrl;
        
        // Atualizar a foto na interface
        this.profileImage.src = photoUrl;
        this.userAvatar.src = photoUrl;
        
        // Salvar as alterações no localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.userData));
        
        // Atualizar a lista de usuários registrados
        this.updateUserInRegisteredUsers();
    }
    
    updateUserInRegisteredUsers() {
        // Obter a lista de usuários registrados
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Encontrar o usuário atual na lista
        const userIndex = registeredUsers.findIndex(user => 
            user.contact?.email === this.userData.contact?.email
        );
        
        // Atualizar o usuário se encontrado
        if (userIndex !== -1) {
            registeredUsers[userIndex] = this.userData;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
    }
    
    closePhotoModal() {
        this.photoModal.classList.remove('active');
        this.photoUpload.value = '';
        this.previewArea.style.display = 'none';
    }
}

// Inicializar o perfil quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new UserProfile();
});
