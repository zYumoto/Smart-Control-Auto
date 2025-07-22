// Classe para gerenciar o perfil do usuário
class UserProfile {
    constructor() {
        this.profileButton = document.getElementById('profile-btn');
        this.profileDropdown = document.querySelector('.profile-dropdown');
        this.profileImage = document.getElementById('profile-image');
        this.userName = document.getElementById('user-name');
        
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
    }
    
    loadProfileData() {
        // Verificar se há um usuário logado
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            // Atualizar nome do usuário
            this.userName.textContent = currentUser.fullname || 'Meu Perfil';
            
            // Se houver uma foto de perfil salva, atualizar
            if (currentUser.profilePhoto) {
                this.profileImage.src = currentUser.profilePhoto;
            }
        }
    }
}

// Classe para gerenciar o formulário de cadastro de usuário
class UserRegistrationForm {
    constructor() {
        // Obter elementos do formulário
        this.form = document.getElementById('user-registration-form');
        
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
        this.cancelButton = document.getElementById('cancel-button');
        
        // Elementos de erro
        this.fullnameError = document.getElementById('fullname-error');
        this.birthdateError = document.getElementById('birthdate-error');
        this.cpfError = document.getElementById('cpf-error');
        this.emailError = document.getElementById('email-error');
        this.phoneError = document.getElementById('phone-error');
        this.cepError = document.getElementById('cep-error');
        this.stateError = document.getElementById('state-error');
        this.cityError = document.getElementById('city-error');
        this.neighborhoodError = document.getElementById('neighborhood-error');
        this.streetError = document.getElementById('street-error');
        this.numberError = document.getElementById('number-error');
        this.roleError = document.getElementById('role-error');
        
        // Inicializar eventos
        this.initEvents();
    }
    
    initEvents() {
        // Aplicar máscaras aos campos
        this.applyInputMasks();
        
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
        
        this.emailInput.addEventListener('input', () => {
            const result = this.validateEmail(this.emailInput.value);
            this.updateFieldStatus(this.emailInput, this.emailError, result);
        });
        
        this.phoneInput.addEventListener('input', () => {
            const result = this.validatePhone(this.phoneInput.value);
            this.updateFieldStatus(this.phoneInput, this.phoneError, result);
        });
        
        this.roleSelect.addEventListener('change', () => {
            const result = this.validateRole(this.roleSelect.value);
            this.updateFieldStatus(this.roleSelect, this.roleError, result);
        });
        
        // Botão cancelar
        this.cancelButton.addEventListener('click', () => {
            if (confirm('Deseja cancelar o cadastro? Todos os dados serão perdidos.')) {
                window.location.href = 'menu.html';
            }
        });
        
        // Envio do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validar todos os campos
            const isValid = this.validateAllFields();
            
            if (isValid) {
                // Criar objeto com os dados do usuário
                const userData = {
                    personalInfo: {
                        fullname: this.fullnameInput.value,
                        birthdate: this.birthdateInput.value,
                        cpf: this.cpfInput.value
                    },
                    contact: {
                        email: this.emailInput.value,
                        phone: this.phoneInput.value
                    },
                    address: {
                        cep: this.cepInput.value,
                        state: this.stateInput.value,
                        city: this.cityInput.value,
                        neighborhood: this.neighborhoodInput.value,
                        street: this.streetInput.value,
                        number: this.numberInput.value,
                        complement: this.complementInput.value
                    },
                    professionalInfo: {
                        role: this.roleSelect.value
                    },
                    createdAt: new Date().toISOString()
                };
                
                // Salvar os dados do usuário
                this.saveUserData(userData);
                
                // Exibir mensagem de sucesso
                alert('Usuário cadastrado com sucesso!');
                
                // Redirecionar para a página do menu
                window.location.href = 'menu.html';
            }
        });
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
    
    // Validar e-mail
    validateEmail(email) {
        if (!email) {
            return { isValid: false, message: 'E-mail é obrigatório' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'E-mail inválido' };
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
        const emailResult = this.validateEmail(this.emailInput.value);
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
        this.updateFieldStatus(this.emailInput, this.emailError, emailResult);
        this.updateFieldStatus(this.phoneInput, this.phoneError, phoneResult);
        this.updateFieldStatus(this.roleSelect, this.roleError, roleResult);
        
        // Verificar se todos os campos estão válidos
        return fullnameResult.isValid && 
               birthdateResult.isValid && 
               cpfResult.isValid && 
               emailResult.isValid && 
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
    
    // Salvar os dados do usuário
    saveUserData(userData) {
        // Obter lista de usuários existente ou criar uma nova
        let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Adicionar o novo usuário
        users.push(userData);
        
        // Salvar a lista atualizada
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new UserRegistrationForm();
    new UserProfile();
});
