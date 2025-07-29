// Função para garantir que os usuários padrão estejam disponíveis no localStorage
function ensureDefaultUsersInLocalStorage() {
    // Lista padrão de usuários válidos
    const defaultUsers = [
        { email: 'admin@example.com', password: 'admin123', professionalInfo: { role: 'diretor' } },
        { email: 'user@example.com', password: 'user123', professionalInfo: { role: 'analista' } },
        { email: 'teste@teste.com', password: 'teste123', professionalInfo: { role: 'assistente' } },
        { email: 'victorjuanrazer@gmail.com', password: 'nina2004', professionalInfo: { role: 'diretor' } }
    ];
    
    // Verificar se já existem usuários no localStorage
    let storedUsers = localStorage.getItem('validUsers');
    let validUsers = [];
    
    if (storedUsers) {
        try {
            validUsers = JSON.parse(storedUsers);
        } catch (e) {
            console.error('Erro ao analisar usuários do localStorage:', e);
            validUsers = [];
        }
    }
    
    // Adicionar usuários padrão se não existirem
    for (const defaultUser of defaultUsers) {
        const userExists = validUsers.some(user => user.email === defaultUser.email);
        if (!userExists) {
            validUsers.push(defaultUser);
        }
    }
    
    // Salvar usuários atualizados no localStorage
    localStorage.setItem('validUsers', JSON.stringify(validUsers));
    console.log('Usuários padrão adicionados ao localStorage para fallback');
}

// Garantir que os usuários padrão estejam disponíveis
ensureDefaultUsersInLocalStorage();

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
        // Validar email ao digitar ou ao perder o foco
        this.emailInput.addEventListener('input', () => {
            const result = this.validateEmail(this.emailInput.value);
            this.updateFieldStatus(this.emailInput, this.emailError, result);
            this.updateSubmitButtonState();
        });
        
        this.emailInput.addEventListener('blur', () => {
            const result = this.validateEmail(this.emailInput.value);
            this.updateFieldStatus(this.emailInput, this.emailError, result);
            this.updateSubmitButtonState();
        });
        
        // Validar senha ao digitar ou ao perder o foco
        this.passwordInput.addEventListener('input', () => {
            const result = this.validatePassword(this.passwordInput.value);
            this.updateFieldStatus(this.passwordInput, this.passwordError, result);
            this.updateSubmitButtonState();
        });
        
        this.passwordInput.addEventListener('blur', () => {
            const result = this.validatePassword(this.passwordInput.value);
            this.updateFieldStatus(this.passwordInput, this.passwordError, result);
            this.updateSubmitButtonState();
        });
        
        // Enviar formulário
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = this.emailInput.value;
            const password = this.passwordInput.value;
            
            // Desabilitar botão de login durante a verificação
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Entrando...';
            
            try {
                // Verificar credenciais (agora assíncrono)
                const isValid = await this.checkCredentials(email, password);
                
                if (isValid) {
                    // Redirecionar para a página do menu
                    window.location.href = 'menu.html';
                } else {
                    // Exibir mensagem de erro
                    this.passwordError.textContent = 'Email ou senha incorretos';
                    this.passwordInput.classList.add('error');
                    
                    // Reativar botão de login
                    this.submitButton.disabled = false;
                    this.submitButton.textContent = 'Entrar';
                }
            } catch (error) {
                console.error('Erro durante login:', error);
                this.passwordError.textContent = 'Erro ao fazer login. Tente novamente.';
                this.passwordInput.classList.add('error');
                
                // Reativar botão de login
                this.submitButton.disabled = false;
                this.submitButton.textContent = 'Entrar';
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
    async checkCredentials(email, password) {
        console.log(`Tentando login com email: ${email}`);
        
        // Garantir que os usuários padrão estejam disponíveis
        ensureDefaultUsersInLocalStorage();
        
        // Tentar autenticação com Firebase primeiro
        let firebaseSuccess = false;
        
        if (window.firebaseAuth) {
            try {
                console.log('Tentando autenticação via Firebase...');
                const result = await window.firebaseAuth.loginUser(email, password);
                firebaseSuccess = result.success;
                
                if (firebaseSuccess) {
                    console.log('Login via Firebase bem-sucedido!');
                    return true;
                } else {
                    console.log('Login via Firebase falhou, tentando localStorage...');
                }
            } catch (error) {
                console.error('Erro na autenticação Firebase:', error);
                console.log('Erro no Firebase, tentando localStorage...');
            }
        } else {
            console.warn('Firebase Auth não disponível, usando autenticação local');
        }
        
        // Fallback para autenticação local via localStorage
        try {
            // Obter usuários do localStorage
            const storedValidUsers = localStorage.getItem('validUsers');
            if (storedValidUsers) {
                const validUsers = JSON.parse(storedValidUsers);
                
                // Verificar se as credenciais correspondem a um usuário válido
                const userMatch = validUsers.some(user => user.email === email && user.password === password);
                
                if (userMatch) {
                    console.log('Login via localStorage bem-sucedido!');
                    
                    // Salvar informações do usuário no localStorage para persistência da sessão
                    const matchedUser = validUsers.find(user => user.email === email);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('currentUser', JSON.stringify({
                        email: email,
                        ...matchedUser
                    }));
                    
                    return true;
                } else {
                    console.log('Credenciais inválidas no localStorage');
                    return false;
                }
            } else {
                console.log('Nenhum usuário encontrado no localStorage');
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar credenciais no localStorage:', error);
            return false;
        }
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
        try {
            // Verificar se o EmailJS está disponível
            if (typeof emailjs === 'undefined') {
                console.error('EmailJS não está disponível. Verifique se o script foi carregado corretamente.');
                return false;
            }
            
            // Inicializar EmailJS com seu User ID
            emailjs.init("fDDaMG8CObKrhTjAYPZXP");
            console.log('EmailJS inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar EmailJS:', error);
            return false;
        }
    }
    
    // Enviar código de verificação para recuperação de senha
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
        
        console.log(`Processando recuperação de senha para: ${email}`);
        
        // Tentar usar Firebase Authentication primeiro
        firebaseAuth.resetPassword(email)
            .then((result) => {
                // Restaurar o botão
                this.sendCodeBtn.textContent = 'Enviar Código';
                this.sendCodeBtn.disabled = false;
                
                if (result.success) {
                    console.log(`Email de recuperação enviado para ${email}`);
                    
                    // Fechar o modal de recuperação de senha
                    this.closeModal(this.forgotPasswordModal);
                    
                    // Mostrar mensagem de sucesso
                    alert(`Um email de recuperação de senha foi enviado para ${email}. Por favor, verifique sua caixa de entrada e spam e siga as instruções para redefinir sua senha.`);
                } else {
                    console.error('Erro ao enviar email de recuperação via Firebase:', result.error);
                    
                    // Usar método alternativo com código de verificação
                    this.useFallbackPasswordRecovery(email);
                }
            })
            .catch((error) => {
                console.error('Erro ao enviar email de recuperação via Firebase:', error);
                
                // Restaurar o botão
                this.sendCodeBtn.textContent = 'Enviar Código';
                this.sendCodeBtn.disabled = false;
                
                // Usar método alternativo com código de verificação
                this.useFallbackPasswordRecovery(email);
            });
    }
    
    // Método alternativo de recuperação de senha usando código de verificação
    useFallbackPasswordRecovery(email) {
        console.log(`Usando método alternativo de recuperação para: ${email}`);
        console.log(`Código de verificação gerado: ${this.generatedCode}`);
        
        // Mostrar o código diretamente ao usuário
        alert(`Devido a um problema na configuração do servidor de email, não foi possível enviar o email de recuperação. Por favor, use o seguinte código para redefinir sua senha: ${this.generatedCode}`);
        
        // Fechar o modal atual e abrir o modal de verificação de código
        this.closeModal(this.forgotPasswordModal);
        this.openModal(this.verificationCodeModal);
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
    async emailExists(email) {
        // Verificar primeiro no Firebase se disponível
        if (window.firebaseAuth) {
            try {
                // Usar Firebase Auth para verificar se o email existe
                const result = await window.firebaseAuth.checkEmailExists(email);
                if (result.success) {
                    return result.exists;
                }
            } catch (error) {
                console.error('Erro ao verificar email no Firebase:', error);
                // Continuar com o fallback para localStorage
            }
        }
        
        // Fallback para localStorage
        // Lista padrão de usuários válidos
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123', professionalInfo: { role: 'diretor' } },
            { email: 'user@example.com', password: 'user123', professionalInfo: { role: 'analista' } },
            { email: 'teste@teste.com', password: 'teste123', professionalInfo: { role: 'assistente' } }
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
    async updateUserPassword(email, newPassword) {
        // Verificar primeiro se o Firebase está disponível
        if (window.firebaseAuth) {
            try {
                // Usar Firebase Auth para resetar a senha
                const result = await window.firebaseAuth.resetPassword(email);
                if (result.success) {
                    console.log('Email de recuperação de senha enviado via Firebase Auth');
                    return;
                }
            } catch (error) {
                console.error('Erro ao resetar senha no Firebase:', error);
                // Continuar com o fallback para localStorage
            }
        }
        
        // Fallback para localStorage
        // Lista padrão de usuários válidos
        let validUsers = [
            { email: 'admin@example.com', password: 'admin123', professionalInfo: { role: 'diretor' } },
            { email: 'user@example.com', password: 'user123', professionalInfo: { role: 'analista' } },
            { email: 'teste@teste.com', password: 'teste123', professionalInfo: { role: 'assistente' } }
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
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar o formulário de login
    new LoginForm();
    
    // Adicionar usuários padrão ao Firebase se estiver disponível
    if (window.firebaseDB && typeof window.firebaseDB.addDefaultUsers === 'function') {
        try {
            console.log('Inicializando usuários padrão no Firebase...');
            await window.firebaseDB.addDefaultUsers();
            console.log('Usuários padrão inicializados com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar usuários padrão:', error);
        }
    }
});
