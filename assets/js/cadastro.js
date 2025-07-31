// Classe para gerenciar a validação e o estado do formulário de cadastro
class SignupForm {
    constructor() {
        // Obter elementos do DOM - Informações Pessoais
        this.firstnameInput = document.getElementById('firstname');
        this.lastnameInput = document.getElementById('lastname');
        this.emailInput = document.getElementById('email');
        this.usernameInput = document.getElementById('username');
        this.phoneInput = document.getElementById('phone');
        
        // Elementos de Endereço
        this.cepInput = document.getElementById('cep');
        this.searchCepBtn = document.getElementById('search-cep'); // Corrigido para corresponder ao ID no HTML
        this.streetInput = document.getElementById('street');
        this.numberInput = document.getElementById('number');
        this.neighborhoodInput = document.getElementById('neighborhood');
        this.complementInput = document.getElementById('complement');
        this.stateInput = document.getElementById('state');
        this.cityInput = document.getElementById('city');
        
        // Elementos Profissionais e Senha
        this.roleSelect = document.getElementById('role');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirm-password');
        
        // Elementos de erro - Informações Pessoais
        this.firstnameError = document.getElementById('firstname-error');
        this.lastnameError = document.getElementById('lastname-error');
        this.emailError = document.getElementById('email-error');
        this.usernameError = document.getElementById('username-error');
        this.phoneError = document.getElementById('phone-error');
        
        // Elementos de erro - Endereço
        this.cepError = document.getElementById('cep-error');
        this.streetError = document.getElementById('street-error');
        this.numberError = document.getElementById('number-error');
        this.neighborhoodError = document.getElementById('neighborhood-error');
        
        // Elementos de erro - Profissionais e Senha
        this.roleError = document.getElementById('role-error');
        this.passwordError = document.getElementById('password-error');
        this.confirmPasswordError = document.getElementById('confirm-password-error');
        
        // Botão de envio e formulário
        this.submitButton = document.getElementById('signup-button');
        this.form = document.getElementById('signup-form');
        
        // Inicializar Firebase se disponível
        this.firebaseAuth = window.firebaseAuth;
        this.firebaseDB = window.firebaseDB;
        
        // Inicializar eventos
        this.initEvents();
    }

    initEvents() {
        // Validação em tempo real para o nome
        this.firstnameInput.addEventListener('input', () => {
            const result = this.validateName(this.firstnameInput.value, 'nome');
            this.updateFieldStatus(this.firstnameInput, this.firstnameError, result);
            this.updateSubmitButtonState();
        });

        // Validação em tempo real para o sobrenome
        this.lastnameInput.addEventListener('input', () => {
            const result = this.validateName(this.lastnameInput.value, 'sobrenome');
            this.updateFieldStatus(this.lastnameInput, this.lastnameError, result);
            this.updateSubmitButtonState();
        });

        // Validação em tempo real para o e-mail
        this.emailInput.addEventListener('input', () => {
            this.validateEmailAsync(this.emailInput.value).then(result => {
                this.updateFieldStatus(this.emailInput, this.emailError, result);
                this.updateSubmitButtonState();
            });
        });

        // Validação em tempo real para o nome de usuário
        this.usernameInput.addEventListener('input', () => {
            this.validateUsernameAsync(this.usernameInput.value).then(result => {
                this.updateFieldStatus(this.usernameInput, this.usernameError, result);
                this.updateSubmitButtonState();
            });
        });

        // Validação em tempo real para o telefone
        this.phoneInput.addEventListener('input', () => {
            // Formatar o telefone enquanto digita
            this.phoneInput.value = this.formatPhone(this.phoneInput.value);
            const result = this.validatePhone(this.phoneInput.value);
            this.updateFieldStatus(this.phoneInput, this.phoneError, result);
            this.updateSubmitButtonState();
        });

        // Validação e formatação do CEP
        this.cepInput.addEventListener('input', () => {
            // Formatar o CEP enquanto digita
            this.cepInput.value = this.formatCEP(this.cepInput.value);
            const result = this.validateCEP(this.cepInput.value);
            this.updateFieldStatus(this.cepInput, this.cepError, result);
            this.updateSubmitButtonState();
        });

        // Botão de busca de CEP
        this.searchCepBtn.addEventListener('click', () => {
            const cep = this.cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                this.searchAddressByCEP(cep);
            } else {
                this.updateFieldStatus(this.cepInput, this.cepError, {
                    isValid: false,
                    message: 'CEP inválido. Digite um CEP válido com 8 dígitos.'
                });
            }
        });

        // Validação para o campo de rua
        this.streetInput.addEventListener('input', () => {
            const result = this.validateRequired(this.streetInput.value, 'rua');
            this.updateFieldStatus(this.streetInput, this.streetError, result);
            this.updateSubmitButtonState();
        });

        // Validação para o campo de número
        this.numberInput.addEventListener('input', () => {
            const result = this.validateRequired(this.numberInput.value, 'número');
            this.updateFieldStatus(this.numberInput, this.numberError, result);
            this.updateSubmitButtonState();
        });

        // Validação para o campo de bairro
        this.neighborhoodInput.addEventListener('input', () => {
            const result = this.validateRequired(this.neighborhoodInput.value, 'bairro');
            this.updateFieldStatus(this.neighborhoodInput, this.neighborhoodError, result);
            this.updateSubmitButtonState();
        });

        // Validação para o campo de cargo
        this.roleSelect.addEventListener('change', () => {
            const result = this.validateRole(this.roleSelect.value);
            this.updateFieldStatus(this.roleSelect, this.roleError, result);
            this.updateSubmitButtonState();
        });

        // Validação em tempo real para a senha
        this.passwordInput.addEventListener('input', () => {
            const result = this.validatePassword(this.passwordInput.value);
            this.updateFieldStatus(this.passwordInput, this.passwordError, result);
            
            // Também validar a confirmação da senha quando a senha mudar
            if (this.confirmPasswordInput.value) {
                const confirmResult = this.validateConfirmPassword(
                    this.passwordInput.value, 
                    this.confirmPasswordInput.value
                );
                this.updateFieldStatus(this.confirmPasswordInput, this.confirmPasswordError, confirmResult);
            }
            
            this.updateSubmitButtonState();
        });

        // Validação em tempo real para a confirmação de senha
        this.confirmPasswordInput.addEventListener('input', () => {
            const result = this.validateConfirmPassword(
                this.passwordInput.value, 
                this.confirmPasswordInput.value
            );
            this.updateFieldStatus(this.confirmPasswordInput, this.confirmPasswordError, result);
            this.updateSubmitButtonState();
        });

        // Manipulador de envio do formulário
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Desabilitar o botão para evitar cliques múltiplos
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Cadastrando...';
            
            try {
                // Validar todos os campos antes de enviar
                const firstnameValid = this.validateName(this.firstnameInput.value, 'nome').isValid;
                const lastnameValid = this.validateName(this.lastnameInput.value, 'sobrenome').isValid;
                const emailValid = (await this.validateEmailAsync(this.emailInput.value)).isValid;
                const usernameValid = (await this.validateUsernameAsync(this.usernameInput.value)).isValid;
                const phoneValid = this.validatePhone(this.phoneInput.value).isValid;
                const cepValid = this.validateCEP(this.cepInput.value).isValid;
                const streetValid = this.validateRequired(this.streetInput.value, 'rua').isValid;
                const numberValid = this.validateRequired(this.numberInput.value, 'número').isValid;
                const neighborhoodValid = this.validateRequired(this.neighborhoodInput.value, 'bairro').isValid;
                const roleValid = this.validateRole(this.roleSelect.value).isValid;
                const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
                const confirmPasswordValid = this.validateConfirmPassword(
                    this.passwordInput.value, 
                    this.confirmPasswordInput.value
                ).isValid;
                
                const allValid = firstnameValid && lastnameValid && emailValid && usernameValid && 
                                phoneValid && cepValid && streetValid && numberValid && 
                                neighborhoodValid && roleValid && passwordValid && confirmPasswordValid;
                
                if (allValid) {
                    // Criar objeto de usuário com todos os dados
                    const newUser = {
                        personalInfo: {
                            firstname: this.firstnameInput.value,
                            lastname: this.lastnameInput.value,
                            email: this.emailInput.value,
                            username: this.usernameInput.value,
                            phone: this.phoneInput.value
                        },
                        addressInfo: {
                            cep: this.cepInput.value,
                            street: this.streetInput.value,
                            number: this.numberInput.value,
                            neighborhood: this.neighborhoodInput.value,
                            complement: this.complementInput.value || ''
                        },
                        professionalInfo: {
                            role: this.roleSelect.value
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    // Registrar o usuário no Firebase
                    await this.registerUserInFirebase(newUser, this.passwordInput.value);
                    
                    // Exibir mensagem de sucesso
                    alert('Cadastro realizado com sucesso! Redirecionando para a página de login.');
                    
                    // Redirecionar para a página de login após o cadastro
                    window.location.href = 'index.html';
                } else {
                    // Reativar o botão se a validação falhar
                    this.submitButton.disabled = false;
                    this.submitButton.textContent = 'Cadastrar';
                    alert('Por favor, corrija os erros no formulário antes de enviar.');
                }
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                alert(`Erro ao cadastrar usuário: ${error.message || 'Erro desconhecido'}`);
                
                // Reativar o botão em caso de erro
                this.submitButton.disabled = false;
                this.submitButton.textContent = 'Cadastrar';
            }
        });
    }

    // Validar nome ou sobrenome
    validateName(name, fieldName) {
        if (!name.trim()) {
            return { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} é obrigatório` };
        }
        
        if (name.trim().length < 2) {
            return { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} muito curto` };
        }
        
        // Verificar se contém apenas letras e espaços
        const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
        if (!nameRegex.test(name)) {
            return { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} deve conter apenas letras` };
        }
        
        return { isValid: true, message: '' };
    }

    // Validar formato de e-mail e verificar duplicidade de forma assíncrona
    async validateEmailAsync(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            return { isValid: false, message: 'E-mail é obrigatório' };
        }
        
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Formato de e-mail inválido' };
        }
        
        // Verificar se o email já está cadastrado no Firebase
        if (this.firebaseAuth) {
            try {
                const emailExists = await this.checkEmailExistsInFirebase(email);
                if (emailExists) {
                    return { isValid: false, message: 'Este e-mail já está cadastrado' };
                }
            } catch (error) {
                console.error('Erro ao verificar e-mail no Firebase:', error);
                // Em caso de erro, permitir continuar com a validação
            }
        }
        
        return { isValid: true, message: '' };
    }
    
    // Verificar se o email existe no Firebase
    async checkEmailExistsInFirebase(email) {
        if (!this.firebaseAuth) return false;
        
        try {
            // Método para verificar se o email já existe
            const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
            return methods && methods.length > 0;
        } catch (error) {
            // Se o erro for que o email não existe, retornar false
            if (error.code === 'auth/user-not-found') {
                return false;
            }
            throw error;
        }
    }
    
    // Validar nome de usuário de forma assíncrona
    async validateUsernameAsync(username) {
        if (!username.trim()) {
            return { isValid: false, message: 'Nome de usuário é obrigatório' };
        }
        
        if (username.trim().length < 3) {
            return { isValid: false, message: 'Nome de usuário muito curto' };
        }
        
        // Verificar se contém apenas letras, números e underscores
        const usernameRegex = /^[A-Za-z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return { isValid: false, message: 'Nome de usuário deve conter apenas letras, números e _' };
        }
        
        // Verificar se o nome de usuário já está cadastrado no Firebase
        if (this.firebaseDB) {
            try {
                const usernameExists = await this.checkUsernameExistsInFirebase(username);
                if (usernameExists) {
                    return { isValid: false, message: 'Este nome de usuário já está em uso' };
                }
            } catch (error) {
                console.error('Erro ao verificar nome de usuário no Firebase:', error);
                // Em caso de erro, permitir continuar com a validação
            }
        }
        
        return { isValid: true, message: '' };
    }
    
    // Verificar se o nome de usuário existe no Firebase
    async checkUsernameExistsInFirebase(username) {
        if (!this.firebaseDB) return false;
        
        try {
            const snapshot = await firebase.database().ref('users')
                .orderByChild('personalInfo/username')
                .equalTo(username)
                .once('value');
            
            return snapshot.exists();
        } catch (error) {
            console.error('Erro ao verificar nome de usuário:', error);
            return false;
        }
    }
    
    // Formatar telefone enquanto digita
    formatPhone(phone) {
        // Remover todos os caracteres não numéricos
        phone = phone.replace(/\D/g, '');
        
        // Aplicar máscara (XX) XXXXX-XXXX
        if (phone.length <= 2) {
            return phone;
        } else if (phone.length <= 7) {
            return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
        } else {
            return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`;
        }
    }
    
    // Validar telefone
    validatePhone(phone) {
        // Remover todos os caracteres não numéricos para validação
        const phoneNumbers = phone.replace(/\D/g, '');
        
        if (!phoneNumbers) {
            return { isValid: false, message: 'Telefone é obrigatório' };
        }
        
        if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            return { isValid: false, message: 'Telefone inválido' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Formatar CEP enquanto digita
    formatCEP(cep) {
        // Remover todos os caracteres não numéricos
        cep = cep.replace(/\D/g, '');
        
        // Aplicar máscara XXXXX-XXX
        if (cep.length <= 5) {
            return cep;
        } else {
            return `${cep.substring(0, 5)}-${cep.substring(5, 8)}`;
        }
    }
    
    // Validar CEP
    validateCEP(cep) {
        // Remover todos os caracteres não numéricos para validação
        const cepNumbers = cep.replace(/\D/g, '');
        
        if (!cepNumbers) {
            return { isValid: false, message: 'CEP é obrigatório' };
        }
        
        if (cepNumbers.length !== 8) {
            return { isValid: false, message: 'CEP inválido' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Buscar endereço pelo CEP usando a API dos Correios (ViaCEP)
    async searchAddressByCEP(cep) {
        try {
            // Atualizar status do botão
            this.searchCepBtn.disabled = true;
            this.searchCepBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Fazer requisição para a API ViaCEP
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            // Verificar se houve erro
            if (data.erro) {
                this.updateFieldStatus(this.cepInput, this.cepError, {
                    isValid: false,
                    message: 'CEP não encontrado'
                });
            } else {
                console.log('Dados do CEP:', data);
                
                // Preencher os campos com os dados retornados
                this.streetInput.value = data.logradouro || '';
                this.neighborhoodInput.value = data.bairro || '';
                this.cityInput.value = data.localidade || '';
                this.stateInput.value = data.uf || '';
                
                // Validar os campos preenchidos
                if (data.logradouro) {
                    this.updateFieldStatus(this.streetInput, this.streetError, {
                        isValid: true,
                        message: ''
                    });
                }
                
                if (data.bairro) {
                    this.updateFieldStatus(this.neighborhoodInput, this.neighborhoodError, {
                        isValid: true,
                        message: ''
                    });
                }
                
                if (data.localidade) {
                    this.updateFieldStatus(this.cityInput, document.getElementById('city-error'), {
                        isValid: true,
                        message: ''
                    });
                }
                
                if (data.uf) {
                    this.updateFieldStatus(this.stateInput, document.getElementById('state-error'), {
                        isValid: true,
                        message: ''
                    });
                }
                
                // Focar no campo de número se a rua foi preenchida
                if (data.logradouro) {
                    this.numberInput.focus();
                }
                
                // Atualizar estado do botão de envio
                this.updateSubmitButtonState();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.updateFieldStatus(this.cepInput, this.cepError, {
                isValid: false,
                message: 'Erro ao buscar CEP. Tente novamente.'
            });
        } finally {
            // Restaurar estado do botão
            this.searchCepBtn.disabled = false;
            this.searchCepBtn.innerHTML = '<i class="fas fa-search"></i>';
        }
    }

    // Validar senha
    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'Senha é obrigatória' };
        }
        
        if (password.length < 6) {
            return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
        }
        
        return { isValid: true, message: '' };
    }

    // Validar confirmação de senha
    validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) {
            return { isValid: false, message: 'Confirmação de senha é obrigatória' };
        }
        
        if (password !== confirmPassword) {
            return { isValid: false, message: 'As senhas não coincidem' };
        }
        
        return { isValid: true, message: '' };
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

    // Validar cargo
    validateRole(role) {
        if (!role) {
            return { isValid: false, message: 'Selecione um cargo' };
        }
        
        return { isValid: true, message: '' };
    }
    
    // Registrar usuário no Firebase
    async registerUserInFirebase(userData, password) {
        if (!this.firebaseAuth || !this.firebaseDB) {
            throw new Error('Firebase não está disponível. Verifique sua conexão com a internet.');
        }
        
        try {
            // Criar usuário no Firebase Authentication
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                userData.personalInfo.email, 
                password
            );
            
            const user = userCredential.user;
            
            // Adicionar informações adicionais ao perfil do usuário
            await user.updateProfile({
                displayName: `${userData.personalInfo.firstname} ${userData.personalInfo.lastname}`
            });
            
            // Salvar dados completos no Realtime Database
            const userId = user.uid;
            await firebase.database().ref(`users/${userId}`).set({
                ...userData,
                uid: userId
            });
            
            // Adicionar também uma referência pelo username para facilitar buscas
            await firebase.database().ref(`usernames/${userData.personalInfo.username}`).set({
                uid: userId
            });
            
            console.log('Usuário registrado com sucesso:', userId);
            return userId;
            
        } catch (error) {
            console.error('Erro ao registrar usuário no Firebase:', error);
            
            // Tratar erros comuns de autenticação
            let errorMessage = 'Erro ao cadastrar usuário.';
            
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este e-mail já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                    break;
            }
            
            throw new Error(errorMessage);
        }
    }
    
    // Atualizar o estado do botão de envio
    async updateSubmitButtonState() {
        try {
            // Validar todos os campos obrigatórios
            const firstnameValid = this.validateName(this.firstnameInput.value, 'nome').isValid;
            const lastnameValid = this.validateName(this.lastnameInput.value, 'sobrenome').isValid;
            const emailValid = this.emailInput.value ? true : false; // Validação completa é assíncrona
            const usernameValid = this.usernameInput.value ? true : false; // Validação completa é assíncrona
            const phoneValid = this.validatePhone(this.phoneInput.value).isValid;
            const cepValid = this.validateCEP(this.cepInput.value).isValid;
            const streetValid = this.validateRequired(this.streetInput.value, 'rua').isValid;
            const numberValid = this.validateRequired(this.numberInput.value, 'número').isValid;
            const neighborhoodValid = this.validateRequired(this.neighborhoodInput.value, 'bairro').isValid;
            const roleValid = this.validateRole(this.roleSelect.value).isValid;
            const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
            const confirmPasswordValid = this.validateConfirmPassword(
                this.passwordInput.value, 
                this.confirmPasswordInput.value
            ).isValid;
            
            // Habilitar/desabilitar botão com base na validação
            const allValid = firstnameValid && lastnameValid && emailValid && usernameValid && 
                            phoneValid && cepValid && streetValid && numberValid && 
                            neighborhoodValid && roleValid && passwordValid && confirmPasswordValid;
            
            this.submitButton.disabled = !allValid;
        } catch (error) {
            console.error('Erro ao validar formulário:', error);
            this.submitButton.disabled = true;
        }
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SignupForm();
});
