// Interface para tipagem dos gastos fixos
var FixedExpenseManager = /** @class */ (function () {
    function FixedExpenseManager() {
        var _this = this;
        this.expenses = [];
        this.STORAGE_KEY = 'fixed_expenses_data';
        // Inicializar elementos do DOM
        this.form = document.getElementById('fixed-expense-form');
        this.nameInput = document.getElementById('expense-name');
        this.amountInput = document.getElementById('expense-amount');
        this.dueDayInput = document.getElementById('expense-due-day');
        this.categoryInput = document.getElementById('expense-category');
        this.descriptionInput = document.getElementById('expense-description');
        this.expensesContainer = document.getElementById('fixed-expenses-container');
        this.emptyState = document.getElementById('empty-expenses-state');
        this.totalMonthlyElement = document.getElementById('total-monthly');
        // Inicializar elementos de filtro
        this.filterCategorySelect = document.getElementById('filter-expense-category');
        this.clearFiltersButton = document.getElementById('clear-expense-filters');
        this.registerAllButton = document.getElementById('register-all-expenses');
        // Inicializar elementos do modal
        this.registerModal = document.getElementById('expense-register-modal');
        this.registerForm = document.getElementById('expense-register-form');
        this.registerExpenseIdInput = document.getElementById('register-expense-id');
        this.registerExpenseNameInput = document.getElementById('register-expense-name');
        this.registerExpenseAmountInput = document.getElementById('register-expense-amount');
        this.registerExpenseDateInput = document.getElementById('register-expense-date');
        this.registerExpenseDescriptionInput = document.getElementById('register-expense-description');
        this.closeModalButton = document.querySelector('.close-modal');
        // Definir data padrão como hoje
        var today = new Date().toISOString().split('T')[0];
        if (this.registerExpenseDateInput) {
            this.registerExpenseDateInput.value = today;
        }
        // Carregar gastos fixos do localStorage
        this.loadExpenses();
        // Configurar event listeners
        this.setupEventListeners();
        // Atualizar UI
        this.updateUI();
    }
    FixedExpenseManager.prototype.setupEventListeners = function () {
        var _this = this;
        // Event listener para adicionar gasto fixo
        if (this.form) {
            this.form.addEventListener('submit', function (e) {
                e.preventDefault();
                _this.addExpense();
            });
        }
        // Event listener para filtros
        if (this.filterCategorySelect) {
            this.filterCategorySelect.addEventListener('change', function () { return _this.applyFilters(); });
        }
        // Event listener para limpar filtros
        if (this.clearFiltersButton) {
            this.clearFiltersButton.addEventListener('click', function () {
                if (_this.filterCategorySelect) {
                    _this.filterCategorySelect.value = 'all';
                    _this.applyFilters();
                }
            });
        }
        // Event listener para registrar todos os gastos
        if (this.registerAllButton) {
            this.registerAllButton.addEventListener('click', function () {
                _this.registerAllExpenses();
            });
        }
        // Event listeners para o modal
        if (this.closeModalButton && this.registerModal) {
            this.closeModalButton.addEventListener('click', function () {
                if (_this.registerModal) {
                    _this.registerModal.style.display = 'none';
                }
            });
        }
        // Fechar modal ao clicar fora
        window.addEventListener('click', function (e) {
            if (e.target === _this.registerModal && _this.registerModal) {
                _this.registerModal.style.display = 'none';
            }
        });
        // Formulário de registro
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', function (e) {
                e.preventDefault();
                _this.registerExpense();
            });
        }
    };
    FixedExpenseManager.prototype.addExpense = function () {
        var name = this.nameInput.value;
        var amount = parseFloat(this.amountInput.value);
        var dueDay = parseInt(this.dueDayInput.value);
        var category = this.categoryInput.value;
        var description = this.descriptionInput.value;
        if (!name || isNaN(amount) || amount <= 0 || isNaN(dueDay) || dueDay < 1 || dueDay > 31 || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        var expense = {
            id: this.generateId(),
            name: name,
            amount: amount,
            dueDay: dueDay,
            category: category,
            description: description,
            createdAt: new Date().toISOString()
        };
        // Adicionar à lista e salvar
        this.expenses.push(expense);
        this.saveExpenses();
        // Limpar formulário
        this.form.reset();
        // Atualizar UI
        this.updateUI();
    };
    FixedExpenseManager.prototype.deleteExpense = function (id) {
        this.expenses = this.expenses.filter(function (expense) { return expense.id !== id; });
        this.saveExpenses();
        this.updateUI();
    };
    FixedExpenseManager.prototype.openEditModal = function (id) {
        var expense = this.expenses.find(function (e) { return e.id === id; });
        if (!expense)
            return;
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
    };
    FixedExpenseManager.prototype.openRegisterModal = function (id) {
        var expense = this.expenses.find(function (e) { return e.id === id; });
        if (!expense)
            return;
        // Preencher formulário de registro
        if (this.registerExpenseIdInput) {
            this.registerExpenseIdInput.value = expense.id;
        }
        if (this.registerExpenseNameInput) {
            this.registerExpenseNameInput.value = expense.name;
        }
        if (this.registerExpenseAmountInput) {
            this.registerExpenseAmountInput.value = expense.amount.toString();
        }
        // Definir data padrão como hoje
        var today = new Date().toISOString().split('T')[0];
        if (this.registerExpenseDateInput) {
            this.registerExpenseDateInput.value = today;
        }
        // Mostrar modal
        if (this.registerModal) {
            this.registerModal.style.display = 'block';
        }
    };
    FixedExpenseManager.prototype.registerExpense = function () {
        var expenseId = this.registerExpenseIdInput.value;
        var amount = parseFloat(this.registerExpenseAmountInput.value);
        var date = this.registerExpenseDateInput.value;
        var description = this.registerExpenseDescriptionInput.value;
        if (isNaN(amount) || amount <= 0 || !date) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        var expense = this.expenses.find(function (e) { return e.id === expenseId; });
        if (!expense)
            return;
        // Criar transação de gasto
        var transaction = {
            id: this.generateId(),
            type: 'expense',
            description: description || "Pagamento de ".concat(expense.name),
            amount: amount,
            date: date,
            category: expense.category,
            fixedExpenseId: expenseId
        };
        // Salvar transação no localStorage
        var transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
        // Fechar modal
        if (this.registerModal) {
            this.registerModal.style.display = 'none';
        }
        // Limpar formulário
        this.registerForm.reset();
        // Mostrar confirmação
        alert("Pagamento de ".concat(expense.name, " registrado com sucesso!"));
    };
    FixedExpenseManager.prototype.registerAllExpenses = function () {
        if (this.expenses.length === 0) {
            alert('Não há gastos fixos cadastrados.');
            return;
        }
        if (!confirm('Deseja registrar todos os gastos fixos do mês atual?')) {
            return;
        }
        var today = new Date();
        var currentMonth = today.getMonth();
        var currentYear = today.getFullYear();
        // Criar uma transação para cada gasto fixo
        var transactions = this.getTransactions();
        var count = 0;
        this.expenses.forEach(function (expense) {
            // Criar data de vencimento para o mês atual
            var dueDate = new Date(currentYear, currentMonth, expense.dueDay);
            // Formatar a data no formato YYYY-MM-DD
            var formattedDate = dueDate.toISOString().split('T')[0];
            var transaction = {
                id: this.generateId(),
                type: 'expense',
                description: "Pagamento mensal de ".concat(expense.name),
                amount: expense.amount,
                date: formattedDate,
                category: expense.category,
                fixedExpenseId: expense.id
            };
            transactions.push(transaction);
            count++;
        }, this);
        // Salvar transações no localStorage
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
        // Mostrar confirmação
        alert("".concat(count, " gastos fixos registrados com sucesso para o m\u00EAs de ").concat(this.getMonthName(currentMonth), "!"));
    };
    FixedExpenseManager.prototype.getMonthName = function (month) {
        var months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month];
    };
    FixedExpenseManager.prototype.getTransactions = function () {
        var storedTransactions = localStorage.getItem('finance_transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    };
    FixedExpenseManager.prototype.applyFilters = function () {
        var categoryFilter = this.filterCategorySelect.value;
        var filteredExpenses = this.expenses.slice();
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(function (e) { return e.category === categoryFilter; });
        }
        this.renderExpenses(filteredExpenses);
    };
    FixedExpenseManager.prototype.updateUI = function () {
        this.renderExpenses(this.expenses);
        this.updateTotalMonthly();
    };
    FixedExpenseManager.prototype.renderExpenses = function (expenses) {
        var _this = this;
        // Verificar se o container existe
        if (!this.expensesContainer) return;
        
        // Limpar container
        this.expensesContainer.innerHTML = '';
        if (expenses.length === 0 && this.emptyState) {
            this.expensesContainer.appendChild(this.emptyState);
            return;
        }
        // Ordenar gastos por dia de vencimento
        var sortedExpenses = expenses.slice().sort(function (a, b) { return a.dueDay - b.dueDay; });
        sortedExpenses.forEach(function (expense) {
            var expenseElement = _this.createExpenseElement(expense);
            if (_this.expensesContainer) {
                _this.expensesContainer.appendChild(expenseElement);
            }
        });
    };
    FixedExpenseManager.prototype.createExpenseElement = function (expense) {
        var _this = this;
        var id = expense.id, name = expense.name, amount = expense.amount, dueDay = expense.dueDay, category = expense.category, description = expense.description;
        var expenseElement = document.createElement('div');
        expenseElement.classList.add('expense-item');
        // Obter nome da categoria para exibição
        var categoryName = this.getCategoryName(category);
        expenseElement.innerHTML = "\n            <div class=\"expense-details\">\n                <div class=\"expense-header\">\n                    <h3 class=\"expense-name\">".concat(name, "</h3>\n                    <span class=\"expense-category category-").concat(category, "\">").concat(categoryName, "</span>\n                </div>\n                <div class=\"expense-due\">\n                    <i class=\"fas fa-calendar-day\"></i> Vencimento: dia ").concat(dueDay, "\n                </div>\n                ").concat(description ? "<div class=\"expense-description\">".concat(description, "</div>") : '', "\n            </div>\n            <div class=\"expense-amount\">").concat(this.formatCurrency(amount), "</div>\n            <div class=\"expense-actions\">\n                <button class=\"btn-register\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-file-invoice-dollar\"></i> Registrar\n                </button>\n                <button class=\"btn-edit\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-edit\"></i> Editar\n                </button>\n                <button class=\"btn-delete\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-trash\"></i>\n                </button>\n            </div>\n        ");
        // Adicionar event listeners para botões
        var registerButton = expenseElement.querySelector('.btn-register');
        registerButton.addEventListener('click', function () {
            _this.openRegisterModal(id);
        });
        var editButton = expenseElement.querySelector('.btn-edit');
        editButton.addEventListener('click', function () {
            _this.openEditModal(id);
        });
        var deleteButton = expenseElement.querySelector('.btn-delete');
        deleteButton.addEventListener('click', function () {
            if (confirm("Tem certeza que deseja excluir o gasto fixo \"".concat(name, "\"?"))) {
                _this.deleteExpense(id);
            }
        });
        return expenseElement;
    };
    FixedExpenseManager.prototype.updateTotalMonthly = function () {
        var total = this.expenses.reduce(function (sum, expense) { return sum + expense.amount; }, 0);
        if (this.totalMonthlyElement) {
            this.totalMonthlyElement.textContent = this.formatCurrency(total);
        }
    };
    FixedExpenseManager.prototype.getCategoryName = function (categoryValue) {
        var option = document.querySelector("option[value=\"".concat(categoryValue, "\"]"));
        return option ? option.textContent || categoryValue : categoryValue;
    };
    FixedExpenseManager.prototype.formatCurrency = function (value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };
    FixedExpenseManager.prototype.generateId = function () {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    FixedExpenseManager.prototype.saveExpenses = function () {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.expenses));
    };
    FixedExpenseManager.prototype.loadExpenses = function () {
        var storedExpenses = localStorage.getItem(this.STORAGE_KEY);
        if (storedExpenses) {
            this.expenses = JSON.parse(storedExpenses);
        }
    };
    return FixedExpenseManager;
}());
// Inicializar o gerenciador de gastos fixos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    new FixedExpenseManager();
});
