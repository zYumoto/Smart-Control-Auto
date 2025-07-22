// Classe para gerenciar a validação e o estado do formulário de cadastro
class SignupForm {
    constructor() {
        // Obter elementos do DOM
        this.fullnameInput = document.getElementById('fullname');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirm-password');
        this.roleSelect = document.getElementById('role');
        this.fullnameError = document.getElementById('fullname-error');
        this.emailError = document.getElementById('email-error');
        this.passwordError = document.getElementById('password-error');
        this.confirmPasswordError = document.getElementById('confirm-password-error');
        this.roleError = document.getElementById('role-error');
        this.submitButton = document.getElementById('signup-button');
        this.form = document.getElementById('signup-form');
        
        // Lista de usuários cadastrados (em um sistema real, isso seria armazenado em um banco de dados)
        this.users = [
            { email: 'admin@example.com', fullname: 'Admin User', role: 'admin' },
            { email: 'user@example.com', fullname: 'Regular User', role: 'analyst' },
            { email: 'teste@teste.com', fullname: 'Teste User', role: 'manager' }
        ];
        
        // Carregar usuários do localStorage, se existirem
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
        }

        // Inicializar eventos
        this.initEvents();
    }

    initEvents() {
        // Validação em tempo real para o nome completo
        this.fullnameInput.addEventListener('input', () => {
            const result = this.validateFullname(this.fullnameInput.value);
            this.updateFieldStatus(this.fullnameInput, this.fullnameError, result);
            this.updateSubmitButtonState();
        });

        // Validação em tempo real para o e-mail
        this.emailInput.addEventListener('input', () => {
            const result = this.validateEmail(this.emailInput.value);
            this.updateFieldStatus(this.emailInput, this.emailError, result);
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
        
        // Validação para o campo de cargo
        this.roleSelect.addEventListener('change', () => {
            const result = this.validateRole(this.roleSelect.value);
            this.updateFieldStatus(this.roleSelect, this.roleError, result);
            this.updateSubmitButtonState();
        });

        // Manipulador de envio do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validar novamente antes de enviar
            const fullnameValid = this.validateFullname(this.fullnameInput.value).isValid;
            const emailValid = this.validateEmail(this.emailInput.value).isValid;
            const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
            const confirmPasswordValid = this.validateConfirmPassword(
                this.passwordInput.value, 
                this.confirmPasswordInput.value
            ).isValid;
            const roleValid = this.validateRole(this.roleSelect.value).isValid;
            
            if (fullnameValid && emailValid && passwordValid && confirmPasswordValid && roleValid) {
                // Criar novo usuário
                const newUser = {
                    fullname: this.fullnameInput.value,
                    email: this.emailInput.value,
                    password: this.passwordInput.value, // Em um sistema real, a senha seria criptografada
                    role: this.roleSelect.value,
                    createdAt: new Date().toISOString()
                };
                
                // Adicionar o novo usuário à lista
                this.users.push(newUser);
                
                // Salvar a lista atualizada no localStorage
                localStorage.setItem('users', JSON.stringify(this.users));
                
                // Atualizar a lista de usuários válidos para login
                this.updateValidLoginUsers(newUser);
                
                // Exibir mensagem de sucesso
                alert('Cadastro realizado com sucesso! Redirecionando para a página de login.');
                
                // Redirecionar para a página de login após o cadastro
                window.location.href = 'index.html';
            }
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

    // Validar formato de e-mail e verificar duplicidade
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            return { isValid: false, message: 'E-mail é obrigatório' };
        }
        
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Formato de e-mail inválido' };
        }
        
        // Verificar se o email já está cadastrado
        const emailExists = this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            return { isValid: false, message: 'Este e-mail já está cadastrado' };
        }
        
        return { isValid: true, message: '' };
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
    
    // Atualizar a lista de usuários válidos para login
    updateValidLoginUsers(newUser) {
        // Obter a lista atual de usuários válidos para login
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'user@example.com', password: 'user123' },
            { email: 'teste@teste.com', password: 'teste123' }
        ];
        
        // Verificar se já existe uma lista no localStorage
        const storedValidUsers = localStorage.getItem('validUsers');
        if (storedValidUsers) {
            validUsers = JSON.parse(storedValidUsers);
        }
        
        // Adicionar o novo usuário à lista de usuários válidos para login
        validUsers.push({
            email: newUser.email,
            password: newUser.password
        });
        
        // Salvar a lista atualizada no localStorage
        localStorage.setItem('validUsers', JSON.stringify(validUsers));
    }
    
    // Atualizar o estado do botão de envio
    updateSubmitButtonState() {
        const fullnameValid = this.validateFullname(this.fullnameInput.value).isValid;
        const emailValid = this.validateEmail(this.emailInput.value).isValid;
        const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
        const confirmPasswordValid = this.validateConfirmPassword(
            this.passwordInput.value, 
            this.confirmPasswordInput.value
        ).isValid;
        const roleValid = this.validateRole(this.roleSelect.value).isValid;
        
        this.submitButton.disabled = !(fullnameValid && emailValid && passwordValid && confirmPasswordValid && roleValid);
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SignupForm();
});
