// Classe para gerenciar a validação e o estado do formulário
class LoginForm {
    constructor() {
        // Obter elementos do DOM
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.emailError = document.getElementById('email-error');
        this.passwordError = document.getElementById('password-error');
        this.submitButton = document.getElementById('login-button');
        this.form = document.getElementById('login-form');
        
        // Elementos de recuperação de senha
        this.forgotPasswordLink = document.getElementById('forgot-password-link');
        
        // Modais
        this.forgotPasswordModal = document.getElementById('forgot-password-modal');
        this.verificationCodeModal = document.getElementById('verification-code-modal');
        this.newPasswordModal = document.getElementById('new-password-modal');
        
        // Botões de fechar modais
        this.closeModalButtons = document.querySelectorAll('.close-modal');
        
        // Elementos do modal de recuperação de senha
        this.recoveryEmailInput = document.getElementById('recovery-email');
        this.recoveryEmailError = document.getElementById('recovery-email-error');
        this.sendCodeBtn = document.getElementById('send-code-btn');
        
        // Elementos do modal de verificação de código
        this.verificationCodeInput = document.getElementById('verification-code');
        this.verificationCodeError = document.getElementById('verification-code-error');
        this.verifyCodeBtn = document.getElementById('verify-code-btn');
        
        // Elementos do modal de nova senha
        this.newPasswordInput = document.getElementById('new-password');
        this.confirmPasswordInput = document.getElementById('confirm-password');
        this.newPasswordError = document.getElementById('new-password-error');
        this.confirmPasswordError = document.getElementById('confirm-password-error');
        this.savePasswordBtn = document.getElementById('save-password-btn');
        
        // Variáveis para recuperação de senha
        this.recoveryEmail = '';
        this.verificationCode = '';
        this.generatedCode = '';

        // Inicializar eventos
        this.initEvents();
        
        // Inicializar EmailJS
        if (window.emailjs) {
            this.initEmailJS();
        }
    }

    initEvents() {
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
            this.updateSubmitButtonState();
        });

        // Manipulador de envio do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validar novamente antes de enviar
            const emailValid = this.validateEmail(this.emailInput.value).isValid;
            const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
            
            if (emailValid && passwordValid) {
                // Verificar credenciais
                const userEmail = this.emailInput.value;
                const password = this.passwordInput.value;
                
                if (this.checkCredentials(userEmail, password)) {
                    // Salvar informações do usuário no localStorage
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', userEmail);
                    
                    // Redirecionar para a página do menu
                    window.location.href = 'menu.html';
                } else {
                    // Exibir mensagem de erro
                    this.passwordError.textContent = 'Email ou senha incorretos';
                    this.passwordInput.classList.add('error');
                }
            }
        });
        
        // Link "Esqueceu a senha?"
        if (this.forgotPasswordLink) {
            this.forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(this.forgotPasswordModal);
                // Preencher o campo de e-mail de recuperação com o e-mail já digitado no login, se houver
                if (this.emailInput.value) {
                    this.recoveryEmailInput.value = this.emailInput.value;
                }
            });
        }
        
        // Botões de fechar modais
        this.closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Fechar modal ao clicar fora do conteúdo
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                this.closeModal(e.target);
            }
        });
        
        // Enviar código de verificação
        if (this.sendCodeBtn) {
            this.sendCodeBtn.addEventListener('click', () => {
                this.sendVerificationCode();
            });
        }
        
        // Verificar código
        if (this.verifyCodeBtn) {
            this.verifyCodeBtn.addEventListener('click', () => {
                this.verifyCode();
            });
        }
        
        // Salvar nova senha
        if (this.savePasswordBtn) {
            this.savePasswordBtn.addEventListener('click', () => {
                this.saveNewPassword();
            });
        }
        
        // Validação em tempo real para o e-mail de recuperação
        if (this.recoveryEmailInput) {
            this.recoveryEmailInput.addEventListener('input', () => {
                const result = this.validateEmail(this.recoveryEmailInput.value);
                this.updateFieldStatus(this.recoveryEmailInput, this.recoveryEmailError, result);
            });
        }
        
        // Validação em tempo real para a nova senha
        if (this.newPasswordInput) {
            this.newPasswordInput.addEventListener('input', () => {
                const result = this.validatePassword(this.newPasswordInput.value);
                this.updateFieldStatus(this.newPasswordInput, this.newPasswordError, result);
                this.validatePasswordMatch();
            });
        }
        
        // Validação em tempo real para confirmação de senha
        if (this.confirmPasswordInput) {
            this.confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    // Validar formato de e-mail
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            return { isValid: false, message: 'E-mail é obrigatório' };
        }
        
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Formato de e-mail inválido' };
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

    // Atualizar o estado do botão de envio
    updateSubmitButtonState() {
        const emailValid = this.validateEmail(this.emailInput.value).isValid;
        const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
        
        this.submitButton.disabled = !(emailValid && passwordValid);
    }
    
    // Verificar credenciais do usuário
    checkCredentials(email, password) {
        // Lista padrão de usuários válidos
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'user@example.com', password: 'user123' },
            { email: 'teste@teste.com', password: 'teste123' }
        ];
        
        // Verificar se há usuários adicionais no localStorage
        const storedValidUsers = localStorage.getItem('validUsers');
        if (storedValidUsers) {
            // Combinar os usuários padrão com os usuários armazenados
            validUsers = [...validUsers, ...JSON.parse(storedValidUsers)];
        }
        
        // Verificar se as credenciais correspondem a um usuário válido
        return validUsers.some(user => user.email === email && user.password === password);
    }
    
    // Métodos para gerenciar modais
    openModal(modal) {
        // Fechar todos os modais primeiro
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('active');
        });
        // Abrir o modal especificado
        modal.classList.add('active');
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
    }
    
    // Gerar código de verificação aleatório de 6 dígitos
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Inicializar EmailJS
    initEmailJS() {
        // Inicializar EmailJS com seu User ID (substitua pelo seu ID real quando for usar)
        emailjs.init("fDDaMG8CObKrhTjAYPZXP");
    }
    
    // Enviar código de verificação por email usando EmailJS
    sendVerificationCode() {
        const email = this.recoveryEmailInput.value;
        const result = this.validateEmail(email);
        
        if (!result.isValid) {
            this.updateFieldStatus(this.recoveryEmailInput, this.recoveryEmailError, result);
            return;
        }
        
        // Verificar se o email existe na base de usuários
        if (!this.emailExists(email)) {
            this.updateFieldStatus(
                this.recoveryEmailInput, 
                this.recoveryEmailError, 
                { isValid: false, message: 'Email não encontrado em nosso sistema' }
            );
            return;
        }
        
        // Gerar código de verificação
        this.generatedCode = this.generateVerificationCode();
        this.recoveryEmail = email;
        
        // Mostrar mensagem de carregamento
        this.sendCodeBtn.textContent = 'Enviando...';
        this.sendCodeBtn.disabled = true;
        
        // Preparar os parâmetros para o email
        const templateParams = {
            to_email: email,
            verification_code: this.generatedCode,
            to_name: email.split('@')[0] // Usar a parte antes do @ como nome
        };
        
        // Enviar email usando EmailJS
        emailjs.send('default_service', 'template_recovery', templateParams)
            .then(() => {
                console.log(`Código de verificação enviado para ${email}: ${this.generatedCode}`);
                
                // Restaurar o botão
                this.sendCodeBtn.textContent = 'Enviar Código';
                this.sendCodeBtn.disabled = false;
                
                // Fechar o modal atual e abrir o modal de verificação de código
                this.closeModal(this.forgotPasswordModal);
                this.openModal(this.verificationCodeModal);
                
                // Mostrar mensagem de sucesso
                alert(`Um código de verificação foi enviado para ${email}. Por favor, verifique sua caixa de entrada e spam.`);
            })
            .catch((error) => {
                console.error('Erro ao enviar email:', error);
                
                // Restaurar o botão
                this.sendCodeBtn.textContent = 'Enviar Código';
                this.sendCodeBtn.disabled = false;
                
                // Como estamos em ambiente de desenvolvimento sem chaves reais do EmailJS,
                // vamos mostrar o código em um alerta para fins de teste
                alert(`MODO DE TESTE: Seu código de verificação é: ${this.generatedCode}`);
                
                // Fechar o modal atual e abrir o modal de verificação de código
                this.closeModal(this.forgotPasswordModal);
                this.openModal(this.verificationCodeModal);
            });
    }
    
    // Verificar se o código digitado está correto
    verifyCode() {
        const code = this.verificationCodeInput.value;
        
        if (!code) {
            this.updateFieldStatus(
                this.verificationCodeInput, 
                this.verificationCodeError, 
                { isValid: false, message: 'Digite o código de verificação' }
            );
            return;
        }
        
        if (code !== this.generatedCode) {
            this.updateFieldStatus(
                this.verificationCodeInput, 
                this.verificationCodeError, 
                { isValid: false, message: 'Código inválido' }
            );
            return;
        }
        
        // Código válido, abrir modal para definir nova senha
        this.closeModal(this.verificationCodeModal);
        this.openModal(this.newPasswordModal);
    }
    
    // Validar se as senhas coincidem
    validatePasswordMatch() {
        const password = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (!confirmPassword) {
            this.updateFieldStatus(
                this.confirmPasswordInput, 
                this.confirmPasswordError, 
                { isValid: false, message: 'Confirme sua senha' }
            );
            return false;
        }
        
        if (password !== confirmPassword) {
            this.updateFieldStatus(
                this.confirmPasswordInput, 
                this.confirmPasswordError, 
                { isValid: false, message: 'As senhas não coincidem' }
            );
            return false;
        }
        
        this.updateFieldStatus(
            this.confirmPasswordInput, 
            this.confirmPasswordError, 
            { isValid: true, message: '' }
        );
        return true;
    }
    
    // Salvar nova senha
    saveNewPassword() {
        const password = this.newPasswordInput.value;
        const passwordResult = this.validatePassword(password);
        
        if (!passwordResult.isValid) {
            this.updateFieldStatus(this.newPasswordInput, this.newPasswordError, passwordResult);
            return;
        }
        
        if (!this.validatePasswordMatch()) {
            return;
        }
        
        // Atualizar a senha do usuário
        this.updateUserPassword(this.recoveryEmail, password);
        
        // Fechar o modal e mostrar mensagem de sucesso
        this.closeModal(this.newPasswordModal);
        alert('Senha alterada com sucesso! Faça login com sua nova senha.');
        
        // Limpar campos
        this.recoveryEmailInput.value = '';
        this.verificationCodeInput.value = '';
        this.newPasswordInput.value = '';
        this.confirmPasswordInput.value = '';
        
        // Preencher o campo de email no formulário de login
        this.emailInput.value = this.recoveryEmail;
        this.passwordInput.value = '';
        this.passwordInput.focus();
    }
    
    // Verificar se o email existe na base de usuários
    emailExists(email) {
        // Lista padrão de usuários válidos
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'user@example.com', password: 'user123' },
            { email: 'teste@teste.com', password: 'teste123' }
        ];
        
        // Verificar se há usuários adicionais no localStorage
        const storedValidUsers = localStorage.getItem('validUsers');
        if (storedValidUsers) {
            // Combinar os usuários padrão com os usuários armazenados
            validUsers = [...validUsers, ...JSON.parse(storedValidUsers)];
        }
        
        return validUsers.some(user => user.email === email);
    }
    
    // Atualizar a senha do usuário
    updateUserPassword(email, newPassword) {
        // Lista padrão de usuários válidos
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'user@example.com', password: 'user123' },
            { email: 'teste@teste.com', password: 'teste123' }
        ];
        
        // Verificar se há usuários adicionais no localStorage
        const storedValidUsers = localStorage.getItem('validUsers');
        if (storedValidUsers) {
            // Combinar os usuários padrão com os usuários armazenados
            validUsers = [...validUsers, ...JSON.parse(storedValidUsers)];
        }
        
        // Encontrar e atualizar o usuário
        const updatedUsers = validUsers.map(user => {
            if (user.email === email) {
                return { ...user, password: newPassword };
            }
            return user;
        });
        
        // Salvar os usuários atualizados no localStorage
        localStorage.setItem('validUsers', JSON.stringify(updatedUsers));
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});
