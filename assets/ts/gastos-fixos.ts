// Interface para tipagem dos gastos fixos
interface FixedExpense {
    id: string;
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    description: string;
    createdAt: string;
}

class FixedExpenseManager {
    private expenses: FixedExpense[] = [];
    private readonly STORAGE_KEY = 'fixed_expenses_data';
    
    // Elementos do DOM
    private form: HTMLFormElement;
    private nameInput: HTMLInputElement;
    private amountInput: HTMLInputElement;
    private dueDayInput: HTMLInputElement;
    private categoryInput: HTMLSelectElement;
    private descriptionInput: HTMLTextAreaElement;
    private expensesContainer: HTMLElement | null;
    private emptyState: HTMLElement | null;
    private totalMonthlyElement: HTMLElement | null;
    
    // Elementos de filtro
    private filterCategorySelect: HTMLSelectElement;
    private clearFiltersButton: HTMLElement | null;
    private registerAllButton: HTMLElement | null;
    
    // Modal de registro
    private registerModal: HTMLElement | null;
    private registerForm: HTMLFormElement;
    private registerExpenseIdInput: HTMLInputElement;
    private registerExpenseNameInput: HTMLInputElement;
    private registerExpenseAmountInput: HTMLInputElement;
    private registerExpenseDateInput: HTMLInputElement;
    private registerExpenseDescriptionInput: HTMLInputElement;
    private closeModalButton: HTMLElement | null;
    
    constructor() {
        // Inicializar elementos do DOM
        this.form = document.getElementById('fixed-expense-form') as HTMLFormElement;
        this.nameInput = document.getElementById('expense-name') as HTMLInputElement;
        this.amountInput = document.getElementById('expense-amount') as HTMLInputElement;
        this.dueDayInput = document.getElementById('expense-due-day') as HTMLInputElement;
        this.categoryInput = document.getElementById('expense-category') as HTMLSelectElement;
        this.descriptionInput = document.getElementById('expense-description') as HTMLTextAreaElement;
        this.expensesContainer = document.getElementById('fixed-expenses-container');
        this.emptyState = document.getElementById('empty-expenses-state');
        this.totalMonthlyElement = document.getElementById('total-monthly');
        
        // Inicializar elementos de filtro
        this.filterCategorySelect = document.getElementById('filter-expense-category') as HTMLSelectElement;
        this.clearFiltersButton = document.getElementById('clear-expense-filters');
        this.registerAllButton = document.getElementById('register-all-expenses');
        
        // Inicializar elementos do modal
        this.registerModal = document.getElementById('expense-register-modal');
        this.registerForm = document.getElementById('expense-register-form') as HTMLFormElement;
        this.registerExpenseIdInput = document.getElementById('register-expense-id') as HTMLInputElement;
        this.registerExpenseNameInput = document.getElementById('register-expense-name') as HTMLInputElement;
        this.registerExpenseAmountInput = document.getElementById('register-expense-amount') as HTMLInputElement;
        this.registerExpenseDateInput = document.getElementById('register-expense-date') as HTMLInputElement;
        this.registerExpenseDescriptionInput = document.getElementById('register-expense-description') as HTMLInputElement;
        this.closeModalButton = document.querySelector('.close-modal');
        
        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        this.registerExpenseDateInput.value = today;
        
        // Carregar gastos fixos do localStorage
        this.loadExpenses();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Atualizar UI
        this.updateUI();
    }
    
    private setupEventListeners(): void {
        // Event listener para adicionar gasto fixo
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
        
        // Event listener para filtros
        if (this.filterCategorySelect) {
            this.filterCategorySelect.addEventListener('change', () => this.applyFilters());
        }
        
        // Event listener para limpar filtros
        if (this.clearFiltersButton) {
            this.clearFiltersButton.addEventListener('click', () => {
                if (this.filterCategorySelect) {
                    this.filterCategorySelect.value = 'all';
                    this.applyFilters();
                }
            });
        }
        
        // Event listener para registrar todos os gastos
        if (this.registerAllButton) {
            this.registerAllButton.addEventListener('click', () => {
                this.registerAllExpenses();
            });
        }
        
        // Event listeners para o modal
        if (this.closeModalButton && this.registerModal) {
            this.closeModalButton.addEventListener('click', () => {
                if (this.registerModal) {
                    this.registerModal.style.display = 'none';
                }
            });
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.registerModal && this.registerModal) {
                this.registerModal.style.display = 'none';
            }
        });
        
        // Formulário de registro
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerExpense();
        });
    }
    
    private addExpense(): void {
        const name = this.nameInput.value;
        const amount = parseFloat(this.amountInput.value);
        const dueDay = parseInt(this.dueDayInput.value);
        const category = this.categoryInput.value;
        const description = this.descriptionInput.value;
        
        if (!name || isNaN(amount) || amount <= 0 || isNaN(dueDay) || dueDay < 1 || dueDay > 31 || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        const expense: FixedExpense = {
            id: this.generateId(),
            name,
            amount,
            dueDay,
            category,
            description,
            createdAt: new Date().toISOString()
        };
        
        // Adicionar à lista e salvar
        this.expenses.push(expense);
        this.saveExpenses();
        
        // Limpar formulário
        this.form.reset();
        
        // Atualizar UI
        this.updateUI();
    }
    
    private deleteExpense(id: string): void {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
        this.updateUI();
    }
    
    private openEditModal(id: string): void {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) return;
        
        // Preencher formulário com dados do gasto
        this.nameInput.value = expense.name;
        this.amountInput.value = expense.amount.toString();
        this.dueDayInput.value = expense.dueDay.toString();
        this.categoryInput.value = expense.category;
        this.descriptionInput.value = expense.description;
        
        // Remover gasto atual
        this.deleteExpense(id);
        
        // Focar no primeiro campo
        this.nameInput.focus();
    }
    
    private openRegisterModal(id: string): void {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) return;
        
        // Preencher formulário de registro
        this.registerExpenseIdInput.value = expense.id;
        this.registerExpenseNameInput.value = expense.name;
        this.registerExpenseAmountInput.value = expense.amount.toString();
        
        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        this.registerExpenseDateInput.value = today;
        
        // Mostrar modal
        if (this.registerModal) {
            this.registerModal.style.display = 'block';
        }
    }
    
    private registerExpense(): void {
        const expenseId = this.registerExpenseIdInput.value;
        const amount = parseFloat(this.registerExpenseAmountInput.value);
        const date = this.registerExpenseDateInput.value;
        const description = this.registerExpenseDescriptionInput.value;
        
        if (isNaN(amount) || amount <= 0 || !date) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        // Criar transação de gasto
        const transaction = {
            id: this.generateId(),
            type: 'expense',
            description: description || `Pagamento de ${expense.name}`,
            amount: amount,
            date,
            category: expense.category,
            fixedExpenseId: expenseId
        };
        
        // Salvar transação no localStorage
        const transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
        
        // Fechar modal
        if (this.registerModal) {
            this.registerModal.style.display = 'none';
        }
        
        // Limpar formulário
        this.registerForm.reset();
        
        // Mostrar confirmação
        alert(`Pagamento de ${expense.name} registrado com sucesso!`);
    }
    
    private registerAllExpenses(): void {
        if (this.expenses.length === 0) {
            alert('Não há gastos fixos cadastrados.');
            return;
        }
        
        if (!confirm('Deseja registrar todos os gastos fixos do mês atual?')) {
            return;
        }
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Criar uma transação para cada gasto fixo
        const transactions = this.getTransactions();
        let count = 0;
        
        this.expenses.forEach(expense => {
            // Criar data de vencimento para o mês atual
            const dueDate = new Date(currentYear, currentMonth, expense.dueDay);
            
            // Formatar a data no formato YYYY-MM-DD
            const formattedDate = dueDate.toISOString().split('T')[0];
            
            const transaction = {
                id: this.generateId(),
                type: 'expense',
                description: `Pagamento mensal de ${expense.name}`,
                amount: expense.amount,
                date: formattedDate,
                category: expense.category,
                fixedExpenseId: expense.id
            };
            
            transactions.push(transaction);
            count++;
        });
        
        // Salvar transações no localStorage
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
        
        // Mostrar confirmação
        alert(`${count} gastos fixos registrados com sucesso para o mês de ${this.getMonthName(currentMonth)}!`);
    }
    
    private getMonthName(month: number): string {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month];
    }
    
    private getTransactions(): any[] {
        const storedTransactions = localStorage.getItem('finance_transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    }
    
    private applyFilters(): void {
        const categoryFilter = this.filterCategorySelect.value;
        
        let filteredExpenses = this.expenses.slice();
        
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
        }
        
        this.renderExpenses(filteredExpenses);
    }
    
    private updateUI(): void {
        this.renderExpenses(this.expenses);
        this.updateTotalMonthly();
    }
    
    private renderExpenses(expenses: FixedExpense[]): void {
        // Verificar se o container existe
        if (!this.expensesContainer) return;
        
        // Limpar container
        this.expensesContainer.innerHTML = '';
        
        if (expenses.length === 0 && this.emptyState) {
            this.expensesContainer.appendChild(this.emptyState);
            return;
        }
        
        // Ordenar gastos por dia de vencimento
        const sortedExpenses = expenses.slice().sort((a, b) => a.dueDay - b.dueDay);
        
        sortedExpenses.forEach(expense => {
            const expenseElement = this.createExpenseElement(expense);
            if (this.expensesContainer) {
                this.expensesContainer.appendChild(expenseElement);
            }
        });
    }
    
    private createExpenseElement(expense: FixedExpense): HTMLElement {
        const { id, name, amount, dueDay, category, description } = expense;
        
        const expenseElement = document.createElement('div');
        expenseElement.classList.add('expense-item');
        
        // Obter nome da categoria para exibição
        const categoryName = this.getCategoryName(category);
        
        expenseElement.innerHTML = `
            <div class="expense-details">
                <div class="expense-header">
                    <h3 class="expense-name">${name}</h3>
                    <span class="expense-category category-${category}">${categoryName}</span>
                </div>
                <div class="expense-due">
                    <i class="fas fa-calendar-day"></i> Vencimento: dia ${dueDay}
                </div>
                ${description ? `<div class="expense-description">${description}</div>` : ''}
            </div>
            <div class="expense-amount">${this.formatCurrency(amount)}</div>
            <div class="expense-actions">
                <button class="btn-register" data-id="${id}">
                    <i class="fas fa-file-invoice-dollar"></i> Registrar
                </button>
                <button class="btn-edit" data-id="${id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Adicionar event listeners para botões
        const registerButton = expenseElement.querySelector('.btn-register');
        if (registerButton) {
            registerButton.addEventListener('click', () => {
                this.openRegisterModal(id);
            });
        }
        
        const editButton = expenseElement.querySelector('.btn-edit');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.openEditModal(id);
            });
        }
        
        const deleteButton = expenseElement.querySelector('.btn-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja excluir o gasto fixo "${name}"?`)) {
                    this.deleteExpense(id);
                }
            });
        }
        
        return expenseElement;
    }
    
    private updateTotalMonthly(): void {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        if (this.totalMonthlyElement) {
            this.totalMonthlyElement.textContent = this.formatCurrency(total);
        }
    }
    
    private getCategoryName(categoryValue: string): string {
        const option = document.querySelector(`option[value="${categoryValue}"]`);
        return option ? option.textContent || categoryValue : categoryValue;
    }
    
    private formatCurrency(value: number): string {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    private saveExpenses(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.expenses));
    }
    
    private loadExpenses(): void {
        const storedExpenses = localStorage.getItem(this.STORAGE_KEY);
        if (storedExpenses) {
            this.expenses = JSON.parse(storedExpenses);
        }
    }
}

// Inicializar o gerenciador de gastos fixos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FixedExpenseManager();
});
