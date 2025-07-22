// Definindo interfaces para tipagem
interface Transaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    category: string;
}

class FinanceManager {
    private transactions: Transaction[] = [];
    private readonly STORAGE_KEY = 'finance_transactions';

    // Elementos do DOM
    private form: HTMLFormElement;
    private typeInputs: NodeListOf<HTMLInputElement>;
    private descriptionInput: HTMLInputElement;
    private amountInput: HTMLInputElement;
    private dateInput: HTMLInputElement;
    private categoryInput: HTMLSelectElement;
    private transactionsContainer: HTMLElement;
    private emptyState: HTMLElement;
    private totalBalanceElement: HTMLElement;
    private totalIncomeElement: HTMLElement;
    private totalExpensesElement: HTMLElement;
    
    // Elementos de filtro
    private filterTypeSelect: HTMLSelectElement;
    private filterCategorySelect: HTMLSelectElement;
    private filterDateInput: HTMLInputElement;
    private clearFiltersButton: HTMLButtonElement;

    constructor() {
        // Inicializar elementos do DOM
        this.form = document.getElementById('transaction-form') as HTMLFormElement;
        this.typeInputs = document.querySelectorAll('input[name="type"]') as NodeListOf<HTMLInputElement>;
        this.descriptionInput = document.getElementById('description') as HTMLInputElement;
        this.amountInput = document.getElementById('amount') as HTMLInputElement;
        this.dateInput = document.getElementById('date') as HTMLInputElement;
        this.categoryInput = document.getElementById('category') as HTMLSelectElement;
        this.transactionsContainer = document.getElementById('transactions-container') as HTMLElement;
        this.emptyState = document.getElementById('empty-state') as HTMLElement;
        this.totalBalanceElement = document.getElementById('total-balance') as HTMLElement;
        this.totalIncomeElement = document.getElementById('total-income') as HTMLElement;
        this.totalExpensesElement = document.getElementById('total-expenses') as HTMLElement;
        
        // Inicializar elementos de filtro
        this.filterTypeSelect = document.getElementById('filter-type') as HTMLSelectElement;
        this.filterCategorySelect = document.getElementById('filter-category') as HTMLSelectElement;
        this.filterDateInput = document.getElementById('filter-date') as HTMLInputElement;
        this.clearFiltersButton = document.getElementById('clear-filters') as HTMLButtonElement;
        
        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        
        // Carregar transações do localStorage
        this.loadTransactions();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Atualizar UI
        this.updateUI();
    }
    
    private setupEventListeners(): void {
        // Event listener para adicionar transação
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });
        
        // Event listener para filtros
        this.filterTypeSelect.addEventListener('change', () => this.applyFilters());
        this.filterCategorySelect.addEventListener('change', () => this.applyFilters());
        this.filterDateInput.addEventListener('change', () => this.applyFilters());
        
        // Event listener para limpar filtros
        this.clearFiltersButton.addEventListener('click', () => {
            this.filterTypeSelect.value = 'all';
            this.filterCategorySelect.value = 'all';
            this.filterDateInput.value = '';
            this.applyFilters();
        });
        
        // Atualizar categorias com base no tipo selecionado
        this.typeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCategoryOptions();
            });
        });
    }
    
    private updateCategoryOptions(): void {
        const selectedType = document.querySelector('input[name="type"]:checked') as HTMLInputElement;
        const incomeOptions = this.categoryInput.querySelectorAll('optgroup[label="Entradas"] option');
        const expenseOptions = this.categoryInput.querySelectorAll('optgroup[label="Saídas"] option');
        
        if (selectedType.value === 'income') {
            incomeOptions.forEach(option => (option as HTMLOptionElement).disabled = false);
            expenseOptions.forEach(option => (option as HTMLOptionElement).disabled = true);
        } else {
            incomeOptions.forEach(option => (option as HTMLOptionElement).disabled = true);
            expenseOptions.forEach(option => (option as HTMLOptionElement).disabled = false);
        }
        
        // Resetar seleção
        this.categoryInput.value = '';
    }
    
    private addTransaction(): void {
        const selectedType = document.querySelector('input[name="type"]:checked') as HTMLInputElement;
        const type = selectedType.value as 'income' | 'expense';
        const description = this.descriptionInput.value;
        const amount = parseFloat(this.amountInput.value);
        const date = this.dateInput.value;
        const category = this.categoryInput.value;
        
        if (!description || isNaN(amount) || amount <= 0 || !date || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        const transaction: Transaction = {
            id: this.generateId(),
            type,
            description,
            amount,
            date,
            category
        };
        
        // Adicionar à lista e salvar
        this.transactions.push(transaction);
        this.saveTransactions();
        
        // Limpar formulário
        this.form.reset();
        
        // Definir data padrão como hoje novamente
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        
        // Atualizar UI
        this.updateUI();
    }
    
    private deleteTransaction(id: string): void {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveTransactions();
        this.updateUI();
    }
    
    private applyFilters(): void {
        const typeFilter = this.filterTypeSelect.value;
        const categoryFilter = this.filterCategorySelect.value;
        const dateFilter = this.filterDateInput.value;
        
        let filteredTransactions = [...this.transactions];
        
        // Filtrar por tipo
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }
        
        // Filtrar por mês/ano
        if (dateFilter) {
            const [filterYear, filterMonth] = dateFilter.split('-');
            filteredTransactions = filteredTransactions.filter(t => {
                const [transactionYear, transactionMonth] = t.date.split('-');
                return transactionYear === filterYear && transactionMonth === filterMonth;
            });
        }
        
        this.renderTransactions(filteredTransactions);
    }
    
    private updateUI(): void {
        this.renderTransactions(this.transactions);
        this.updateBalanceSummary();
    }
    
    private renderTransactions(transactions: Transaction[]): void {
        // Limpar container
        this.transactionsContainer.innerHTML = '';
        
        if (transactions.length === 0) {
            this.transactionsContainer.appendChild(this.emptyState);
            return;
        }
        
        // Ordenar transações por data (mais recentes primeiro)
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        sortedTransactions.forEach(transaction => {
            const transactionElement = this.createTransactionElement(transaction);
            this.transactionsContainer.appendChild(transactionElement);
        });
    }
    
    private createTransactionElement(transaction: Transaction): HTMLElement {
        const { id, type, description, amount, date, category } = transaction;
        
        const transactionElement = document.createElement('div');
        transactionElement.classList.add('transaction-item', type);
        
        // Formatar data para exibição
        const formattedDate = this.formatDate(date);
        
        // Formatar valor para exibição
        const formattedAmount = this.formatCurrency(amount);
        
        // Obter nome da categoria para exibição
        const categoryName = this.getCategoryName(category);
        
        transactionElement.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-description">${description}</div>
                <div class="transaction-category">${categoryName}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount ${type}">${type === 'income' ? '+' : '-'} ${formattedAmount}</div>
            <div class="transaction-actions">
                <button class="btn-delete" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Adicionar event listener para botão de excluir
        const deleteButton = transactionElement.querySelector('.btn-delete') as HTMLButtonElement;
        deleteButton.addEventListener('click', () => {
            this.deleteTransaction(id);
        });
        
        return transactionElement;
    }
    
    private updateBalanceSummary(): void {
        let totalIncome = 0;
        let totalExpenses = 0;
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });
        
        const balance = totalIncome - totalExpenses;
        
        this.totalBalanceElement.textContent = this.formatCurrency(balance);
        this.totalIncomeElement.textContent = this.formatCurrency(totalIncome);
        this.totalExpensesElement.textContent = this.formatCurrency(totalExpenses);
        
        // Alterar cor do saldo com base no valor
        if (balance > 0) {
            this.totalBalanceElement.style.color = 'var(--income-color)';
        } else if (balance < 0) {
            this.totalBalanceElement.style.color = 'var(--expense-color)';
        } else {
            this.totalBalanceElement.style.color = 'var(--text-color)';
        }
    }
    
    private formatCurrency(value: number): string {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    private getCategoryName(categoryValue: string): string {
        const option = document.querySelector(`option[value="${categoryValue}"]`) as HTMLOptionElement;
        return option ? option.textContent || categoryValue : categoryValue;
    }
    
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    private saveTransactions(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
    }
    
    private loadTransactions(): void {
        const storedTransactions = localStorage.getItem(this.STORAGE_KEY);
        if (storedTransactions) {
            this.transactions = JSON.parse(storedTransactions);
        }
    }
}

// Inicializar o gerenciador financeiro quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FinanceManager();
});
