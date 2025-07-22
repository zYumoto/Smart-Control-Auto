// Interface para validação de formulário
interface ValidationResult {
    isValid: boolean;
    message: string;
}

// Classe para gerenciar a validação e o estado do formulário de cadastro
class SignupForm {
    private fullnameInput: HTMLInputElement;
    private emailInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private confirmPasswordInput: HTMLInputElement;
    private fullnameError: HTMLElement;
    private emailError: HTMLElement;
    private passwordError: HTMLElement;
    private confirmPasswordError: HTMLElement;
    private submitButton: HTMLButtonElement;
    private form: HTMLFormElement;

    constructor() {
        // Obter elementos do DOM
        this.fullnameInput = document.getElementById('fullname') as HTMLInputElement;
        this.emailInput = document.getElementById('email') as HTMLInputElement;
        this.passwordInput = document.getElementById('password') as HTMLInputElement;
        this.confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
        this.fullnameError = document.getElementById('fullname-error') as HTMLElement;
        this.emailError = document.getElementById('email-error') as HTMLElement;
        this.passwordError = document.getElementById('password-error') as HTMLElement;
        this.confirmPasswordError = document.getElementById('confirm-password-error') as HTMLElement;
        this.submitButton = document.getElementById('signup-button') as HTMLButtonElement;
        this.form = document.getElementById('signup-form') as HTMLFormElement;

        // Inicializar eventos
        this.initEvents();
    }

    private initEvents(): void {
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
            
            if (fullnameValid && emailValid && passwordValid && confirmPasswordValid) {
                // Aqui você pode adicionar o código para enviar os dados para o servidor
                alert('Cadastro realizado com sucesso! Redirecionando...');
                console.log('Formulário enviado com:', {
                    fullname: this.fullnameInput.value,
                    email: this.emailInput.value,
                    password: '********' // Não exibir a senha real no console
                });
                
                // Redirecionar para a página de login após o cadastro
                // window.location.href = 'index.html';
            }
        });
    }

    // Validar nome completo
    private validateFullname(fullname: string): ValidationResult {
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

    // Validar formato de e-mail
    private validateEmail(email: string): ValidationResult {
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
    private validatePassword(password: string): ValidationResult {
        if (!password) {
            return { isValid: false, message: 'Senha é obrigatória' };
        }
        
        if (password.length < 6) {
            return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
        }
        
        return { isValid: true, message: '' };
    }

    // Validar confirmação de senha
    private validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
        if (!confirmPassword) {
            return { isValid: false, message: 'Confirmação de senha é obrigatória' };
        }
        
        if (password !== confirmPassword) {
            return { isValid: false, message: 'As senhas não coincidem' };
        }
        
        return { isValid: true, message: '' };
    }

    // Atualizar o status visual do campo
    private updateFieldStatus(input: HTMLInputElement, errorElement: HTMLElement, result: ValidationResult): void {
        if (result.isValid) {
            input.classList.remove('error');
            errorElement.textContent = '';
        } else {
            input.classList.add('error');
            errorElement.textContent = result.message;
        }
    }

    // Atualizar o estado do botão de envio
    private updateSubmitButtonState(): void {
        const fullnameValid = this.validateFullname(this.fullnameInput.value).isValid;
        const emailValid = this.validateEmail(this.emailInput.value).isValid;
        const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
        const confirmPasswordValid = this.validateConfirmPassword(
            this.passwordInput.value, 
            this.confirmPasswordInput.value
        ).isValid;
        
        this.submitButton.disabled = !(fullnameValid && emailValid && passwordValid && confirmPasswordValid);
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SignupForm();
});
