// Definindo interfaces para tipagem
var FinanceManager = /** @class */ (function () {
    function FinanceManager() {
        var _this = this;
        this.transactions = [];
        this.products = [];
        this.STORAGE_KEY = 'finance_transactions';
        this.PRODUCTS_STORAGE_KEY = 'products_data';
        // Inicializar elementos do DOM
        this.form = document.getElementById('transaction-form');
        this.typeInputs = document.querySelectorAll('input[name="type"]');
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.dateInput = document.getElementById('date');
        this.categoryInput = document.getElementById('category');
        
        // Elementos para seleção de produtos
        this.productSelectionContainer = document.getElementById('product-selection-container');
        this.productSelect = document.getElementById('product-select');
        this.productQuantityContainer = document.getElementById('product-quantity-container');
        this.productQuantityInput = document.getElementById('product-quantity');
        this.productUnitPriceInput = document.getElementById('product-unit-price');
        this.registerProductSaleCheckbox = document.getElementById('register-product-sale');
        this.transactionsContainer = document.getElementById('transactions-container');
        this.emptyState = document.getElementById('empty-state');
        this.totalBalanceElement = document.getElementById('total-balance');
        this.totalIncomeElement = document.getElementById('total-income');
        this.totalExpensesElement = document.getElementById('total-expenses');
        // Inicializar elementos de filtro
        this.filterTypeSelect = document.getElementById('filter-type');
        this.filterCategorySelect = document.getElementById('filter-category');
        this.filterDateInput = document.getElementById('filter-date');
        this.clearFiltersButton = document.getElementById('clear-filters');
        // Definir data padrão como hoje
        var today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        
        // Carregar transações e produtos do localStorage
        this.loadTransactions();
        this.loadProducts();
        
        // Preencher o select de produtos
        this.populateProductSelect();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Atualizar UI
        this.updateUI();
    }
    FinanceManager.prototype.setupEventListeners = function () {
        var _this = this;
        // Event listener para adicionar transação
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.addTransaction();
        });
        // Event listener para filtros
        this.filterTypeSelect.addEventListener('change', function () { return _this.applyFilters(); });
        this.filterCategorySelect.addEventListener('change', function () { return _this.applyFilters(); });
        this.filterDateInput.addEventListener('change', function () { return _this.applyFilters(); });
        // Event listener para limpar filtros
        this.clearFiltersButton.addEventListener('click', function () {
            _this.filterTypeSelect.value = 'all';
            _this.filterCategorySelect.value = 'all';
            _this.filterDateInput.value = '';
            _this.applyFilters();
        });
        // Atualizar categorias com base no tipo selecionado
        this.typeInputs.forEach(function (input) {
            input.addEventListener('change', function () {
                _this.updateCategoryOptions();
                _this.toggleProductSelection();
            });
        });
        
        // Event listener para seleção de produto
        if (this.productSelect) {
            this.productSelect.addEventListener('change', function () {
                _this.handleProductSelection();
            });
        }
        
        // Event listener para checkbox de registro de venda de produto
        if (this.registerProductSaleCheckbox) {
            this.registerProductSaleCheckbox.addEventListener('change', function () {
                _this.toggleProductSelection();
            });
        }
    };
    FinanceManager.prototype.updateCategoryOptions = function () {
        var selectedType = document.querySelector('input[name="type"]:checked');
        var incomeOptions = this.categoryInput.querySelectorAll('optgroup[label="Entradas"] option');
        var expenseOptions = this.categoryInput.querySelectorAll('optgroup[label="Saídas"] option');
        if (selectedType.value === 'income') {
            incomeOptions.forEach(function (option) { return option.disabled = false; });
            expenseOptions.forEach(function (option) { return option.disabled = true; });
        }
        else {
            incomeOptions.forEach(function (option) { return option.disabled = true; });
            expenseOptions.forEach(function (option) { return option.disabled = false; });
        }
        // Resetar seleção
        this.categoryInput.value = '';
        
        // Desmarcar checkbox de registro de venda de produto quando mudar para despesa
        if (selectedType.value === 'expense' && this.registerProductSaleCheckbox) {
            this.registerProductSaleCheckbox.checked = false;
        }
    };
    
    FinanceManager.prototype.toggleProductSelection = function () {
        var selectedType = document.querySelector('input[name="type"]:checked');
        var isProductSaleChecked = this.registerProductSaleCheckbox && this.registerProductSaleCheckbox.checked;
        
        // Mostrar seleção de produtos apenas para transações de entrada (vendas) e quando o checkbox estiver marcado
        if (selectedType.value === 'income' && isProductSaleChecked && this.products.length > 0) {
            this.productSelectionContainer.style.display = 'block';
            
            // Atualizar categoria para 'vendas' automaticamente
            if (this.categoryInput) {
                this.categoryInput.value = 'vendas';
            }
        } else {
            this.productSelectionContainer.style.display = 'none';
            this.productQuantityContainer.style.display = 'none';
            this.productSelect.value = '';
        }
    };
    
    FinanceManager.prototype.handleProductSelection = function () {
        var selectedProductId = this.productSelect.value;
        
        if (selectedProductId) {
            // Encontrar o produto selecionado
            var selectedProduct = this.products.find(function (p) { return p.id === selectedProductId; });
            
            if (selectedProduct) {
                // Mostrar campos de quantidade e preço unitário
                this.productQuantityContainer.style.display = 'flex';
                
                // Preencher preço unitário com o preço do produto
                this.productUnitPriceInput.value = selectedProduct.price.toString();
                
                // Preencher descrição com nome do produto
                this.descriptionInput.value = "Venda de " + selectedProduct.name;
                
                // Calcular valor total
                this.updateTotalAmount();
            }
        } else {
            // Esconder campos de quantidade e preço unitário
            this.productQuantityContainer.style.display = 'none';
            this.descriptionInput.value = '';
        }
    };
    
    FinanceManager.prototype.updateTotalAmount = function () {
        var quantity = parseInt(this.productQuantityInput.value) || 0;
        var unitPrice = parseFloat(this.productUnitPriceInput.value) || 0;
        var totalAmount = quantity * unitPrice;
        
        // Atualizar campo de valor
        if (totalAmount > 0) {
            this.amountInput.value = totalAmount.toFixed(2);
        }
    };
    
    FinanceManager.prototype.populateProductSelect = function () {
        var _this = this;
        
        if (!this.productSelect) return;
        
        // Limpar opções atuais, mantendo apenas a primeira (placeholder)
        while (this.productSelect.options.length > 1) {
            this.productSelect.remove(1);
        }
        
        // Adicionar produtos ao select
        this.products.forEach(function (product) {
            var option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name + " - " + _this.formatCurrency(product.price);
            _this.productSelect.appendChild(option);
        });
        
        // Configurar event listeners para atualização de valor total
        if (this.productQuantityInput && this.productUnitPriceInput) {
            this.productQuantityInput.addEventListener('input', function () { return _this.updateTotalAmount(); });
            this.productUnitPriceInput.addEventListener('input', function () { return _this.updateTotalAmount(); });
        }
    };
    FinanceManager.prototype.addTransaction = function () {
        var selectedType = document.querySelector('input[name="type"]:checked');
        var type = selectedType.value;
        var description = this.descriptionInput.value;
        var amount = parseFloat(this.amountInput.value);
        var date = this.dateInput.value;
        var category = this.categoryInput.value;
        
        if (!description || isNaN(amount) || amount <= 0 || !date || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        var transaction = {
            id: this.generateId(),
            type: type,
            description: description,
            amount: amount,
            date: date,
            category: category
        };
        
        // Adicionar informações do produto se for uma venda de produto
        var selectedProductId = this.productSelect ? this.productSelect.value : '';
        if (type === 'income' && selectedProductId) {
            var quantity = parseInt(this.productQuantityInput.value) || 1;
            var unitPrice = parseFloat(this.productUnitPriceInput.value) || 0;
            
            transaction.productId = selectedProductId;
            transaction.quantity = quantity;
            transaction.unitPrice = unitPrice;
        }
        
        // Adicionar à lista e salvar
        this.transactions.push(transaction);
        this.saveTransactions();
        
        // Limpar formulário
        this.form.reset();
        
        // Esconder campos de produto
        if (this.productSelectionContainer) {
            this.productSelectionContainer.style.display = 'none';
        }
        if (this.productQuantityContainer) {
            this.productQuantityContainer.style.display = 'none';
        }
        
        // Definir data padrão como hoje novamente
        var today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        // Atualizar UI
        this.updateUI();
    };
    FinanceManager.prototype.deleteTransaction = function (id) {
        this.transactions = this.transactions.filter(function (transaction) { return transaction.id !== id; });
        this.saveTransactions();
        this.updateUI();
    };
    FinanceManager.prototype.applyFilters = function () {
        var typeFilter = this.filterTypeSelect.value;
        var categoryFilter = this.filterCategorySelect.value;
        var dateFilter = this.filterDateInput.value;
        var filteredTransactions = this.transactions.slice();
        // Filtrar por tipo
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(function (t) { return t.type === typeFilter; });
        }
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(function (t) { return t.category === categoryFilter; });
        }
        // Filtrar por mês/ano
        if (dateFilter) {
            var _a = dateFilter.split('-'), filterYear_1 = _a[0], filterMonth_1 = _a[1];
            filteredTransactions = filteredTransactions.filter(function (t) {
                var _a = t.date.split('-'), transactionYear = _a[0], transactionMonth = _a[1];
                return transactionYear === filterYear_1 && transactionMonth === filterMonth_1;
            });
        }
        this.renderTransactions(filteredTransactions);
    };
    FinanceManager.prototype.updateUI = function () {
        this.renderTransactions(this.transactions);
        this.updateBalanceSummary();
    };
    FinanceManager.prototype.renderTransactions = function (transactions) {
        var _this = this;
        // Limpar container
        this.transactionsContainer.innerHTML = '';
        if (transactions.length === 0) {
            this.transactionsContainer.appendChild(this.emptyState);
            return;
        }
        // Ordenar transações por data (mais recentes primeiro)
        var sortedTransactions = transactions.slice().sort(function (a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        sortedTransactions.forEach(function (transaction) {
            var transactionElement = _this.createTransactionElement(transaction);
            _this.transactionsContainer.appendChild(transactionElement);
        });
    };
    FinanceManager.prototype.createTransactionElement = function (transaction) {
        var _this = this;
        var transactionElement = document.createElement('div');
        transactionElement.className = "transaction-item " + transaction.type;
        var categoryName = this.getCategoryName(transaction.category);
        var formattedDate = this.formatDate(transaction.date);
        var formattedAmount = this.formatCurrency(transaction.amount);
        var iconClass = transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
        
        // Informações adicionais para transações de produtos
        var productInfo = '';
        if (transaction.productId && transaction.quantity && transaction.unitPrice) {
            var product = this.products.find(function (p) { return p.id === transaction.productId; });
            var productName = product ? product.name : 'Produto';
            
            productInfo = "<div class=\"transaction-product-info\">\n                <span class=\"product-name\">" + productName + "</span>\n                <span class=\"product-quantity\">Qtd: " + transaction.quantity + "</span>\n                <span class=\"product-unit-price\">" + this.formatCurrency(transaction.unitPrice) + " cada</span>\n            </div>";
        }
        
        transactionElement.innerHTML = "\n            <div class=\"transaction-info\">\n                <div class=\"transaction-icon\">\n                    <i class=\"fas " + iconClass + "\"></i>\n                </div>\n                <div class=\"transaction-details\">\n                    <div class=\"transaction-description\">" + transaction.description + "</div>\n                    " + productInfo + "\n                    <div class=\"transaction-meta\">\n                        <span class=\"transaction-category\">" + categoryName + "</span>\n                        <span class=\"transaction-date\">" + formattedDate + "</span>\n                    </div>\n                </div>\n            </div>\n            <div class=\"transaction-amount\">" + formattedAmount + "</div>\n            <button class=\"delete-btn\"><i class=\"fas fa-trash\"></i></button>\n        ";
        var deleteButton = transactionElement.querySelector('.delete-btn');
        deleteButton.addEventListener('click', function () {
            _this.deleteTransaction(transaction.id);
        });
        return transactionElement;
    };
    FinanceManager.prototype.updateBalanceSummary = function () {
        var totalIncome = 0;
        var totalExpenses = 0;
        this.transactions.forEach(function (transaction) {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            }
            else {
                totalExpenses += transaction.amount;
            }
        });
        var balance = totalIncome - totalExpenses;
        this.totalBalanceElement.textContent = this.formatCurrency(balance);
        this.totalIncomeElement.textContent = this.formatCurrency(totalIncome);
        this.totalExpensesElement.textContent = this.formatCurrency(totalExpenses);
        // Alterar cor do saldo com base no valor
        if (balance > 0) {
            this.totalBalanceElement.style.color = 'var(--income-color)';
        }
        else if (balance < 0) {
            this.totalBalanceElement.style.color = 'var(--expense-color)';
        }
        else {
            this.totalBalanceElement.style.color = 'var(--text-color)';
        }
    };
    FinanceManager.prototype.formatCurrency = function (value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };
    FinanceManager.prototype.formatDate = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };
    FinanceManager.prototype.getCategoryName = function (categoryValue) {
        var option = document.querySelector("option[value=\"".concat(categoryValue, "\"]"));
        return option ? option.textContent || categoryValue : categoryValue;
    };
    FinanceManager.prototype.generateId = function () {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    FinanceManager.prototype.saveTransactions = async function () {
        try {
            // Verificar se o Firebase está disponível
            if (!window.firebaseDB) {
                console.warn('Firebase não disponível, salvando transações no localStorage');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
                return;
            }
            
            // Obter ID do usuário atual
            let userId = null;
            
            if (window.firebaseAuth) {
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    userId = currentUser.uid;
                }
            }
            
            if (!userId) {
                // Tentar obter do localStorage como fallback
                const localUserData = localStorage.getItem('currentUser');
                if (localUserData) {
                    try {
                        const parsedUser = JSON.parse(localUserData);
                        if (parsedUser && parsedUser.uid) {
                            userId = parsedUser.uid;
                        }
                    } catch (e) {
                        console.error('Erro ao analisar dados do usuário do localStorage:', e);
                    }
                }
            }
            
            if (!userId) {
                console.warn('ID de usuário não encontrado, salvando transações no localStorage');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
                return;
            }
            
            // Salvar cada transação no Firebase
            for (const transaction of this.transactions) {
                await window.firebaseDB.saveTransaction(userId, transaction);
            }
            
            console.log('Transações salvas no Firebase com sucesso');
            
            // Manter uma cópia no localStorage como backup
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Erro ao salvar transações:', error);
            // Fallback para localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
        }
    };
    
    FinanceManager.prototype.loadTransactions = async function () {
        try {
            // Verificar se o Firebase está disponível
            if (!window.firebaseDB) {
                console.warn('Firebase não disponível, carregando transações do localStorage');
                const storedTransactions = localStorage.getItem(this.STORAGE_KEY);
                if (storedTransactions) {
                    this.transactions = JSON.parse(storedTransactions);
                }
                return;
            }
            
            // Obter ID do usuário atual
            let userId = null;
            
            if (window.firebaseAuth) {
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    userId = currentUser.uid;
                }
            }
            
            if (!userId) {
                // Tentar obter do localStorage como fallback
                const localUserData = localStorage.getItem('currentUser');
                if (localUserData) {
                    try {
                        const parsedUser = JSON.parse(localUserData);
                        if (parsedUser && parsedUser.uid) {
                            userId = parsedUser.uid;
                        }
                    } catch (e) {
                        console.error('Erro ao analisar dados do usuário do localStorage:', e);
                    }
                }
            }
            
            if (!userId) {
                console.warn('ID de usuário não encontrado, carregando transações do localStorage');
                const storedTransactions = localStorage.getItem(this.STORAGE_KEY);
                if (storedTransactions) {
                    this.transactions = JSON.parse(storedTransactions);
                }
                return;
            }
            
            // Carregar transações do Firebase
            const result = await window.firebaseDB.getUserTransactions(userId);
            
            if (result.success) {
                this.transactions = result.transactions;
                console.log('Transações carregadas do Firebase com sucesso:', this.transactions.length);
                
                // Atualizar localStorage como backup
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
            } else {
                console.error('Erro ao carregar transações do Firebase:', result.error);
                // Fallback para localStorage
                const storedTransactions = localStorage.getItem(this.STORAGE_KEY);
                if (storedTransactions) {
                    this.transactions = JSON.parse(storedTransactions);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            // Fallback para localStorage
            const storedTransactions = localStorage.getItem(this.STORAGE_KEY);
            if (storedTransactions) {
                this.transactions = JSON.parse(storedTransactions);
            }
        }
    };
    
    FinanceManager.prototype.loadProducts = async function () {
        try {
            // Verificar se o Firebase está disponível
            if (!window.firebaseDB) {
                console.warn('Firebase não disponível, carregando produtos do localStorage');
                const storedProducts = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
                if (storedProducts) {
                    this.products = JSON.parse(storedProducts);
                }
                return;
            }
            
            // Obter ID do usuário atual
            let userId = null;
            
            if (window.firebaseAuth) {
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    userId = currentUser.uid;
                }
            }
            
            if (!userId) {
                // Tentar obter do localStorage como fallback
                const localUserData = localStorage.getItem('currentUser');
                if (localUserData) {
                    try {
                        const parsedUser = JSON.parse(localUserData);
                        if (parsedUser && parsedUser.uid) {
                            userId = parsedUser.uid;
                        }
                    } catch (e) {
                        console.error('Erro ao analisar dados do usuário do localStorage:', e);
                    }
                }
            }
            
            if (!userId) {
                console.warn('ID de usuário não encontrado, carregando produtos do localStorage');
                const storedProducts = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
                if (storedProducts) {
                    this.products = JSON.parse(storedProducts);
                }
                return;
            }
            
            // Carregar produtos do Firebase
            const result = await window.firebaseDB.getUserProducts(userId);
            
            if (result.success) {
                this.products = result.products;
                console.log('Produtos carregados do Firebase com sucesso:', this.products.length);
            } else {
                console.error('Erro ao carregar produtos do Firebase:', result.error);
                // Fallback para localStorage
                const storedProducts = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
                if (storedProducts) {
                    this.products = JSON.parse(storedProducts);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Fallback para localStorage
            const storedProducts = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
            if (storedProducts) {
                this.products = JSON.parse(storedProducts);
            }
        }
    };
    return FinanceManager;
}());
// Inicializar o gerenciador financeiro quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    new FinanceManager();
});
