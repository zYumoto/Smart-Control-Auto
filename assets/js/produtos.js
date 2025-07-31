// Interface para tipagem dos produtos
var ProductManager = /** @class */ (function () {
    function ProductManager() {
        var _this = this;
        this.products = [];
        this.STORAGE_KEY = 'products_data';
        // Inicializar elementos do DOM
        this.form = document.getElementById('product-form');
        this.nameInput = document.getElementById('product-name');
        this.priceInput = document.getElementById('product-price');
        this.costInput = document.getElementById('product-cost');
        this.descriptionInput = document.getElementById('product-description');
        this.categoryInput = document.getElementById('product-category');
        this.productsContainer = document.getElementById('products-container');
        this.emptyState = document.getElementById('empty-products-state');
        // Inicializar elementos de filtro
        this.filterCategorySelect = document.getElementById('filter-product-category');
        this.searchInput = document.getElementById('search-product');
        this.clearFiltersButton = document.getElementById('clear-product-filters');
        // Inicializar modal de venda
        this.saleModal = document.getElementById('product-sale-modal');
        this.saleForm = document.getElementById('product-sale-form');
        this.saleProductIdInput = document.getElementById('sale-product-id');
        this.saleProductNameInput = document.getElementById('sale-product-name');
        this.saleQuantityInput = document.getElementById('sale-quantity');
        this.saleUnitPriceInput = document.getElementById('sale-unit-price');
        this.saleDateInput = document.getElementById('sale-date');
        this.saleDescriptionInput = document.getElementById('sale-description');
        this.closeModalButton = document.querySelector('.close-modal');
        // Definir data padrão como hoje
        var today = new Date().toISOString().split('T')[0];
        this.saleDateInput.value = today;
        // Carregar produtos do localStorage
        this.loadProducts();
        // Configurar event listeners
        this.setupEventListeners();
        // Atualizar UI
        this.updateUI();
    }
    ProductManager.prototype.setupEventListeners = function () {
        var _this = this;
        // Event listener para adicionar produto
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.addProduct();
        });
        // Event listener para filtros
        this.filterCategorySelect.addEventListener('change', function () { return _this.applyFilters(); });
        this.searchInput.addEventListener('input', function () { return _this.applyFilters(); });
        // Event listener para limpar filtros
        this.clearFiltersButton.addEventListener('click', function () {
            _this.filterCategorySelect.value = 'all';
            _this.searchInput.value = '';
            _this.applyFilters();
        });
        // Event listener para fechar modal
        this.closeModalButton.addEventListener('click', function () {
            _this.saleModal.style.display = 'none';
        });
        // Fechar modal ao clicar fora dele
        window.addEventListener('click', function (e) {
            if (e.target === _this.saleModal) {
                _this.saleModal.style.display = 'none';
            }
        });
        // Event listener para formulário de venda
        this.saleForm.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.registerSale();
        });
    };
    ProductManager.prototype.addProduct = function () {
        var name = this.nameInput.value;
        var price = parseFloat(this.priceInput.value);
        var cost = parseFloat(this.costInput.value);
        var description = this.descriptionInput.value;
        var category = this.categoryInput.value;
        if (!name || isNaN(price) || price <= 0 || isNaN(cost) || cost < 0 || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        var product = {
            id: this.generateId(),
            name: name,
            price: price,
            cost: cost,
            description: description,
            category: category,
            createdAt: new Date().toISOString()
        };
        // Adicionar à lista e salvar
        this.products.push(product);
        this.saveProducts();
        // Limpar formulário
        this.form.reset();
        // Atualizar UI
        this.updateUI();
    };
    ProductManager.prototype.deleteProduct = function (id) {
        this.products = this.products.filter(function (product) { return product.id !== id; });
        this.saveProducts();
        this.updateUI();
    };
    ProductManager.prototype.openEditModal = function (id) {
        var product = this.products.find(function (p) { return p.id === id; });
        if (!product)
            return;
        // Preencher formulário com dados do produto
        this.nameInput.value = product.name;
        this.priceInput.value = product.price.toString();
        this.costInput.value = product.cost.toString();
        this.descriptionInput.value = product.description;
        this.categoryInput.value = product.category;
        // Remover produto atual
        this.deleteProduct(id);
        // Focar no primeiro campo
        this.nameInput.focus();
    };
    ProductManager.prototype.openSaleModal = function (id) {
        var product = this.products.find(function (p) { return p.id === id; });
        if (!product)
            return;
        // Preencher formulário de venda
        this.saleProductIdInput.value = product.id;
        this.saleProductNameInput.value = product.name;
        this.saleUnitPriceInput.value = product.price.toString();
        this.saleQuantityInput.value = '1';
        // Definir data padrão como hoje
        var today = new Date().toISOString().split('T')[0];
        this.saleDateInput.value = today;
        // Mostrar modal
        this.saleModal.style.display = 'block';
    };
    ProductManager.prototype.registerSale = function () {
        var productId = this.saleProductIdInput.value;
        var quantity = parseInt(this.saleQuantityInput.value);
        var unitPrice = parseFloat(this.saleUnitPriceInput.value);
        var date = this.saleDateInput.value;
        var description = this.saleDescriptionInput.value;
        if (isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice <= 0 || !date) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        var product = this.products.find(function (p) { return p.id === productId; });
        if (!product)
            return;
        // Criar transação de venda
        var transaction = {
            id: this.generateId(),
            type: 'income',
            description: description || "Venda de ".concat(quantity, "x ").concat(product.name),
            amount: quantity * unitPrice,
            date: date,
            category: 'vendas',
            productId: productId,
            quantity: quantity
        };
        // Salvar transação no localStorage
        var transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
        // Fechar modal
        this.saleModal.style.display = 'none';
        // Limpar formulário
        this.saleForm.reset();
        // Mostrar confirmação
        alert("Venda registrada com sucesso! Valor total: ".concat(this.formatCurrency(transaction.amount)));
    };
    ProductManager.prototype.getTransactions = function () {
        var storedTransactions = localStorage.getItem('finance_transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    };
    ProductManager.prototype.applyFilters = function () {
        var categoryFilter = this.filterCategorySelect.value;
        var searchFilter = this.searchInput.value.toLowerCase();
        var filteredProducts = this.products.slice();
        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(function (p) { return p.category === categoryFilter; });
        }
        // Filtrar por texto de busca
        if (searchFilter) {
            filteredProducts = filteredProducts.filter(function (p) {
                return p.name.toLowerCase().includes(searchFilter) ||
                    p.description.toLowerCase().includes(searchFilter);
            });
        }
        this.renderProducts(filteredProducts);
    };
    ProductManager.prototype.updateUI = function () {
        this.renderProducts(this.products);
    };
    ProductManager.prototype.renderProducts = function (products) {
        var _this = this;
        // Limpar container
        this.productsContainer.innerHTML = '';
        if (products.length === 0) {
            this.productsContainer.appendChild(this.emptyState);
            return;
        }
        // Ordenar produtos por nome
        var sortedProducts = products.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
        sortedProducts.forEach(function (product) {
            var productElement = _this.createProductElement(product);
            _this.productsContainer.appendChild(productElement);
        });
    };
    ProductManager.prototype.createProductElement = function (product) {
        var _this = this;
        var id = product.id, name = product.name, price = product.price, cost = product.cost, description = product.description, category = product.category;
        var productElement = document.createElement('div');
        productElement.classList.add('product-item');
        // Obter nome da categoria para exibição
        var categoryName = this.getCategoryName(category);
        // Calcular margem de lucro
        var profit = price - cost;
        var profitMargin = (profit / price) * 100;
        productElement.innerHTML = "\n            <div class=\"product-header\">\n                <h3 class=\"product-name\">".concat(name, "</h3>\n                <span class=\"product-category category-").concat(category, "\">").concat(categoryName, "</span>\n            </div>\n            <div class=\"product-price\">").concat(this.formatCurrency(price), "</div>\n            <div class=\"product-cost\">Custo: ").concat(this.formatCurrency(cost), " (Margem: ").concat(profitMargin.toFixed(1), "%)</div>\n            <div class=\"product-description\">").concat(description || 'Sem descrição', "</div>\n            <div class=\"product-actions\">\n                <button class=\"btn-edit\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-edit\"></i> Editar\n                </button>\n                <button class=\"btn-sell\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-cash-register\"></i> Vender\n                </button>\n                <button class=\"btn-delete\" data-id=\"").concat(id, "\">\n                    <i class=\"fas fa-trash\"></i>\n                </button>\n            </div>\n        ");
        // Adicionar event listeners para botões
        var editButton = productElement.querySelector('.btn-edit');
        editButton.addEventListener('click', function () {
            _this.openEditModal(id);
        });
        var sellButton = productElement.querySelector('.btn-sell');
        sellButton.addEventListener('click', function () {
            _this.openSaleModal(id);
        });
        var deleteButton = productElement.querySelector('.btn-delete');
        deleteButton.addEventListener('click', function () {
            if (confirm("Tem certeza que deseja excluir o produto \"".concat(name, "\"?"))) {
                _this.deleteProduct(id);
            }
        });
        return productElement;
    };
    ProductManager.prototype.getCategoryName = function (categoryValue) {
        var option = document.querySelector("option[value=\"".concat(categoryValue, "\"]"));
        return option ? option.textContent || categoryValue : categoryValue;
    };
    ProductManager.prototype.formatCurrency = function (value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };
    ProductManager.prototype.generateId = function () {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    ProductManager.prototype.saveProducts = async function () {
        try {
            // Verificar se o Firebase está disponível
            if (!window.firebaseDB) {
                console.warn('Firebase não disponível, salvando produtos no localStorage');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
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
                console.warn('ID de usuário não encontrado, salvando produtos no localStorage');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
                return;
            }
            
            // Salvar cada produto no Firebase
            for (const product of this.products) {
                await window.firebaseDB.saveProduct(userId, product);
            }
            
            console.log('Produtos salvos no Firebase com sucesso');
            
            // Manter uma cópia no localStorage como backup
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
        } catch (error) {
            console.error('Erro ao salvar produtos:', error);
            // Fallback para localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
        }
    };
    
    ProductManager.prototype.loadProducts = async function () {
        try {
            // Verificar se o Firebase está disponível
            if (!window.firebaseDB) {
                console.warn('Firebase não disponível, carregando produtos do localStorage');
                const storedProducts = localStorage.getItem(this.STORAGE_KEY);
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
                const storedProducts = localStorage.getItem(this.STORAGE_KEY);
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
                
                // Atualizar localStorage como backup
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
            } else {
                console.error('Erro ao carregar produtos do Firebase:', result.error);
                // Fallback para localStorage
                const storedProducts = localStorage.getItem(this.STORAGE_KEY);
                if (storedProducts) {
                    this.products = JSON.parse(storedProducts);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Fallback para localStorage
            const storedProducts = localStorage.getItem(this.STORAGE_KEY);
            if (storedProducts) {
                this.products = JSON.parse(storedProducts);
            }
        }
    };
    return ProductManager;
}());
// Inicializar o gerenciador de produtos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    new ProductManager();
});
