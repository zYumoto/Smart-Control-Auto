// Interface para validação de formulário
interface ValidationResult {
    isValid: boolean;
    message: string;
}

// Classe para gerenciar a validação e o estado do formulário
class LoginForm {
    private emailInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private emailError: HTMLElement;
    private passwordError: HTMLElement;
    private submitButton: HTMLButtonElement;
    private form: HTMLFormElement;

    constructor() {
        // Obter elementos do DOM
        this.emailInput = document.getElementById('email') as HTMLInputElement;
        this.passwordInput = document.getElementById('password') as HTMLInputElement;
        this.emailError = document.getElementById('email-error') as HTMLElement;
        this.passwordError = document.getElementById('password-error') as HTMLElement;
        this.submitButton = document.getElementById('login-button') as HTMLButtonElement;
        this.form = document.getElementById('login-form') as HTMLFormElement;

        // Inicializar eventos
        this.initEvents();
    }

    private initEvents(): void {
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
                // Simular autenticação (em um sistema real, isso seria feito no backend)
                const userEmail = this.emailInput.value;
                
                // Salvar informações do usuário no localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', userEmail);
                
                // Redirecionar para a página do menu
                window.location.href = 'menu.html';
            }
        });
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
        const emailValid = this.validateEmail(this.emailInput.value).isValid;
        const passwordValid = this.validatePassword(this.passwordInput.value).isValid;
        
        this.submitButton.disabled = !(emailValid && passwordValid);
    }
}

// Inicializar o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});
