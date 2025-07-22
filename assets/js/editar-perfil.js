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
        
        // Elementos do formulário
        this.form = document.getElementById('edit-profile-form');
        
        // Campos de informações pessoais
        this.fullnameInput = document.getElementById('fullname');
        this.birthdateInput = document.getElementById('birthdate');
        this.cpfInput = document.getElementById('cpf');
        
        // Campos de contato
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        
        // Campos de endereço
        this.cepInput = document.getElementById('cep');
        this.stateInput = document.getElementById('state');
        this.cityInput = document.getElementById('city');
        this.neighborhoodInput = document.getElementById('neighborhood');
        this.streetInput = document.getElementById('street');
        this.numberInput = document.getElementById('number');
        this.complementInput = document.getElementById('complement');
        
        // Campo de cargo
        this.roleSelect = document.getElementById('role');
        
        // Botões
        this.searchCepButton = document.getElementById('search-cep');
        this.submitButton = document.getElementById('submit-button');
        
        // Elementos de erro
        this.fullnameError = document.getElementById('fullname-error');
        this.birthdateError = document.getElementById('birthdate-error');
        this.cpfError = document.getElementById('cpf-error');
        this.phoneError = document.getElementById('phone-error');
        this.cepError = document.getElementById('cep-error');
        this.stateError = document.getElementById('state-error');
        this.cityError = document.getElementById('city-error');
        this.neighborhoodError = document.getElementById('neighborhood-error');
        this.streetError = document.getElementById('street-error');
        this.numberError = document.getElementById('number-error');
        this.roleError = document.getElementById('role-error');
        
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
        
        // Aplicar máscaras aos campos
        this.applyInputMasks();
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
        
        // Buscar CEP automaticamente
        this.cepInput.addEventListener('blur', () => {
            if (this.cepInput.value.replace(/\D/g, '').length === 8) {
                this.searchCep();
            }
        });
        
        this.searchCepButton.addEventListener('click', () => {
            this.searchCep();
        });
        
        // Validação em tempo real
        this.fullnameInput.addEventListener('input', () => {
            const result = this.validateFullname(this.fullnameInput.value);
            this.updateFieldStatus(this.fullnameInput, this.fullnameError, result);
        });
        
        this.birthdateInput.addEventListener('change', () => {
            const result = this.validateBirthdate(this.birthdateInput.value);
            this.updateFieldStatus(this.birthdateInput, this.birthdateError, result);
        });
        
        this.cpfInput.addEventListener('input', () => {
            const result = this.validateCPF(this.cpfInput.value);
            this.updateFieldStatus(this.cpfInput, this.cpfError, result);
        });
        
        this.phoneInput.addEventListener('input', () => {
            const result = this.validatePhone(this.phoneInput.value);
            this.updateFieldStatus(this.phoneInput, this.phoneError, result);
        });
        
        this.roleSelect.addEventListener('change', () => {
            const result = this.validateRole(this.roleSelect.value);
            this.updateFieldStatus(this.roleSelect, this.roleError, result);
        });
        
        // Envio do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validar todos os campos
            const isValid = this.validateAllFields();
            
            if (isValid) {
                // Atualizar os dados do usuário
                this.updateUserData();
                
                // Exibir mensagem de sucesso
                alert('Perfil atualizado com sucesso!');
                
                // Redirecionar para a página de perfil
                window.location.href = 'meu-perfil.html';
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
            
            // Preencher campos do formulário
            // Informações pessoais
            this.fullnameInput.value = currentUser.personalInfo?.fullname || '';
            this.birthdateInput.value = currentUser.personalInfo?.birthdate || '';
            this.cpfInput.value = currentUser.personalInfo?.cpf || '';
            
            // Informações de contato
            this.emailInput.value = currentUser.contact?.email || '';
            this.phoneInput.value = currentUser.contact?.phone || '';
            
            // Informações de endereço
            this.cepInput.value = currentUser.address?.cep || '';
            this.stateInput.value = currentUser.address?.state || '';
            this.cityInput.value = currentUser.address?.city || '';
            this.neighborhoodInput.value = currentUser.address?.neighborhood || '';
            this.streetInput.value = currentUser.address?.street || '';
            this.numberInput.value = currentUser.address?.number || '';
            this.complementInput.value = currentUser.address?.complement || '';
            
            // Informações profissionais
            this.roleSelect.value = currentUser.professionalInfo?.role || '';
        } else {
            // Redirecionar para a página de login se não houver usuário logado
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'index.html';
        }
    }
    
    // Aplicar máscaras aos campos
    applyInputMasks() {
        // Máscara para CPF
        this.cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 9) {
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
            }
            
            e.target.value = value;
        });
        
        // Máscara para telefone
        this.phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
            }
            
            e.target.value = value;
        });
        
        // Máscara para CEP
        this.cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
    
    // Buscar CEP na API ViaCEP
    searchCep() {
        const cep = this.cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            this.updateFieldStatus(this.cepInput, this.cepError, { 
                isValid: false, 
                message: 'CEP inválido. Deve conter 8 dígitos.' 
            });
            return;
        }
        
        // Limpar mensagem de erro
        this.updateFieldStatus(this.cepInput, this.cepError, { isValid: true, message: '' });
        
        // Mostrar indicador de carregamento
        this.cepInput.disabled = true;
        this.searchCepButton.disabled = true;
        this.searchCepButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Fazer requisição à API ViaCEP
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    this.updateFieldStatus(this.cepInput, this.cepError, { 
                        isValid: false, 
                        message: 'CEP não encontrado.' 
                    });
                } else {
                    // Preencher os campos com os dados retornados
                    this.stateInput.value = data.uf;
                    this.cityInput.value = data.localidade;
                    this.neighborhoodInput.value = data.bairro;
                    this.streetInput.value = data.logradouro;
                    
                    // Focar no campo número
                    this.numberInput.focus();
                }
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                this.updateFieldStatus(this.cepInput, this.cepError, { 
                    isValid: false, 
                    message: 'Erro ao buscar CEP. Tente novamente.' 
                });
            })
            .finally(() => {
                // Remover indicador de carregamento
                this.cepInput.disabled = false;
                this.searchCepButton.disabled = false;
                this.searchCepButton.innerHTML = '<i class="fas fa-search"></i>';
            });
    }
    
    // Validar nome completo
    validateFullname(fullname) {
        if (!fullname.trim()) {
            return { isValid: false, message: 'Nome completo é obrigatório' };
        }
        
        if (fullname.trim().length < 3) {
            return { isValid: false, message: 'Nome muito curto' };
        }
        
        // Verificar se o nome contém pelo menos um sobrenome
        if (!fullname.trim().includes(' ')) {
            return { isValid: false, message: 'Digite nome e sobrenome' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Validar data de nascimento
    validateBirthdate(birthdate) {
        if (!birthdate) {
            return { isValid: false, message: 'Data de nascimento é obrigatória' };
        }
        
        const birthdateObj = new Date(birthdate);
        const today = new Date();
        
        // Verificar se é uma data válida
        if (isNaN(birthdateObj.getTime())) {
            return { isValid: false, message: 'Data inválida' };
        }
        
        // Verificar se é uma data no passado
        if (birthdateObj > today) {
            return { isValid: false, message: 'A data deve ser no passado' };
        }
        
        // Verificar se a pessoa tem pelo menos 18 anos
        const age = today.getFullYear() - birthdateObj.getFullYear();
        const monthDiff = today.getMonth() - birthdateObj.getMonth();
        
        if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
            return { isValid: false, message: 'É necessário ter pelo menos 18 anos' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Validar CPF
    validateCPF(cpf) {
        // Remover caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            return { isValid: false, message: 'CPF deve ter 11 dígitos' };
        }
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) {
            return { isValid: false, message: 'CPF inválido' };
        }
        
        // Validação do algoritmo do CPF
        let sum = 0;
        let remainder;
        
        // Primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return { isValid: false, message: 'CPF inválido' };
        }
        
        // Segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return { isValid: false, message: 'CPF inválido' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Validar telefone
    validatePhone(phone) {
        // Remover caracteres não numéricos
        phone = phone.replace(/\D/g, '');
        
        if (!phone) {
            return { isValid: false, message: 'Telefone é obrigatório' };
        }
        
        if (phone.length < 10 || phone.length > 11) {
            return { isValid: false, message: 'Telefone inválido' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Validar cargo
    validateRole(role) {
        if (!role) {
            return { isValid: false, message: 'Selecione um cargo' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Validar todos os campos
    validateAllFields() {
        const fullnameResult = this.validateFullname(this.fullnameInput.value);
        const birthdateResult = this.validateBirthdate(this.birthdateInput.value);
        const cpfResult = this.validateCPF(this.cpfInput.value);
        const phoneResult = this.validatePhone(this.phoneInput.value);
        const roleResult = this.validateRole(this.roleSelect.value);
        
        // Validar campos de endereço
        let addressValid = true;
        
        if (!this.cepInput.value) {
            this.updateFieldStatus(this.cepInput, this.cepError, { 
                isValid: false, 
                message: 'CEP é obrigatório' 
            });
            addressValid = false;
        }
        
        if (!this.stateInput.value) {
            this.updateFieldStatus(this.stateInput, this.stateError, { 
                isValid: false, 
                message: 'Estado é obrigatório' 
            });
            addressValid = false;
        }
        
        if (!this.cityInput.value) {
            this.updateFieldStatus(this.cityInput, this.cityError, { 
                isValid: false, 
                message: 'Cidade é obrigatória' 
            });
            addressValid = false;
        }
        
        if (!this.neighborhoodInput.value) {
            this.updateFieldStatus(this.neighborhoodInput, this.neighborhoodError, { 
                isValid: false, 
                message: 'Bairro é obrigatório' 
            });
            addressValid = false;
        }
        
        if (!this.streetInput.value) {
            this.updateFieldStatus(this.streetInput, this.streetError, { 
                isValid: false, 
                message: 'Rua é obrigatória' 
            });
            addressValid = false;
        }
        
        if (!this.numberInput.value) {
            this.updateFieldStatus(this.numberInput, this.numberError, { 
                isValid: false, 
                message: 'Número é obrigatório' 
            });
            addressValid = false;
        }
        
        // Atualizar status dos campos
        this.updateFieldStatus(this.fullnameInput, this.fullnameError, fullnameResult);
        this.updateFieldStatus(this.birthdateInput, this.birthdateError, birthdateResult);
        this.updateFieldStatus(this.cpfInput, this.cpfError, cpfResult);
        this.updateFieldStatus(this.phoneInput, this.phoneError, phoneResult);
        this.updateFieldStatus(this.roleSelect, this.roleError, roleResult);
        
        // Verificar se todos os campos estão válidos
        return fullnameResult.isValid && 
               birthdateResult.isValid && 
               cpfResult.isValid && 
               phoneResult.isValid && 
               roleResult.isValid && 
               addressValid;
    }
    
    // Atualizar o status visual do campo
    updateFieldStatus(input, errorElement, result) {
        if (result.isValid) {
            input.classList.remove('error');
            errorElement.textContent = '';
        } else {
            input.classList.add('error');
            errorElement.textContent = result.message;
        }
    }
    
    // Atualizar os dados do usuário
    updateUserData() {
        // Atualizar os dados do usuário atual
        this.userData.personalInfo = {
            fullname: this.fullnameInput.value,
            birthdate: this.birthdateInput.value,
            cpf: this.cpfInput.value
        };
        
        this.userData.contact = {
            email: this.emailInput.value,
            phone: this.phoneInput.value
        };
        
        this.userData.address = {
            cep: this.cepInput.value,
            state: this.stateInput.value,
            city: this.cityInput.value,
            neighborhood: this.neighborhoodInput.value,
            street: this.streetInput.value,
            number: this.numberInput.value,
            complement: this.complementInput.value
        };
        
        this.userData.professionalInfo = {
            role: this.roleSelect.value
        };
        
        // Atualizar o nome completo no objeto principal
        this.userData.fullname = this.fullnameInput.value;
        
        // Salvar as alterações no localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.userData));
        
        // Atualizar a lista de usuários registrados
        this.updateUserInRegisteredUsers();
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
