// Interface para tipagem dos produtos
interface Product {
    id: string;
    name: string;
    price: number;
    cost: number;
    description: string;
    category: string;
    createdAt: string;
}

class ProductManager {
    private products: Product[] = [];
    private readonly STORAGE_KEY = 'products_data';

    // Elementos do DOM
    private form: HTMLFormElement;
    private nameInput: HTMLInputElement;
    private priceInput: HTMLInputElement;
    private costInput: HTMLInputElement;
    private descriptionInput: HTMLTextAreaElement;
    private categoryInput: HTMLSelectElement;
    private productsContainer: HTMLElement;
    private emptyState: HTMLElement;

    // Elementos de filtro
    private filterCategorySelect: HTMLSelectElement;
    private searchInput: HTMLInputElement;
    private clearFiltersButton: HTMLElement;

    // Modal de venda
    private saleModal: HTMLElement;
    private saleForm: HTMLFormElement;
    private saleProductIdInput: HTMLInputElement;
    private saleProductNameInput: HTMLInputElement;
    private saleQuantityInput: HTMLInputElement;
    private saleUnitPriceInput: HTMLInputElement;
    private saleDateInput: HTMLInputElement;
    private saleDescriptionInput: HTMLInputElement;
    private closeModalButton: HTMLElement;

    constructor() {
        // Inicializar elementos do DOM
        this.form = document.getElementById('product-form') as HTMLFormElement;
        this.nameInput = document.getElementById('product-name') as HTMLInputElement;
        this.priceInput = document.getElementById('product-price') as HTMLInputElement;
        this.costInput = document.getElementById('product-cost') as HTMLInputElement;
        this.descriptionInput = document.getElementById('product-description') as HTMLTextAreaElement;
        this.categoryInput = document.getElementById('product-category') as HTMLSelectElement;
        this.productsContainer = document.getElementById('products-container');
        this.emptyState = document.getElementById('empty-products-state');

        // Inicializar elementos de filtro
        this.filterCategorySelect = document.getElementById('filter-product-category') as HTMLSelectElement;
        this.searchInput = document.getElementById('search-product') as HTMLInputElement;
        this.clearFiltersButton = document.getElementById('clear-product-filters');

        // Inicializar modal de venda
        this.saleModal = document.getElementById('product-sale-modal');
        this.saleForm = document.getElementById('product-sale-form') as HTMLFormElement;
        this.saleProductIdInput = document.getElementById('sale-product-id') as HTMLInputElement;
        this.saleProductNameInput = document.getElementById('sale-product-name') as HTMLInputElement;
        this.saleQuantityInput = document.getElementById('sale-quantity') as HTMLInputElement;
        this.saleUnitPriceInput = document.getElementById('sale-unit-price') as HTMLInputElement;
        this.saleDateInput = document.getElementById('sale-date') as HTMLInputElement;
        this.saleDescriptionInput = document.getElementById('sale-description') as HTMLInputElement;
        this.closeModalButton = document.querySelector('.close-modal');

        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        this.saleDateInput.value = today;

        // Carregar produtos do localStorage
        this.loadProducts();

        // Configurar event listeners
        this.setupEventListeners();

        // Atualizar UI
        this.updateUI();
    }

    private setupEventListeners(): void {
        // Event listener para adicionar produto
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Event listener para filtros
        this.filterCategorySelect.addEventListener('change', () => this.applyFilters());
        this.searchInput.addEventListener('input', () => this.applyFilters());

        // Event listener para limpar filtros
        this.clearFiltersButton.addEventListener('click', () => {
            this.filterCategorySelect.value = 'all';
            this.searchInput.value = '';
            this.applyFilters();
        });

        // Event listener para fechar modal
        this.closeModalButton.addEventListener('click', () => {
            this.saleModal.style.display = 'none';
        });

        // Fechar modal ao clicar fora dele
        window.addEventListener('click', (e) => {
            if (e.target === this.saleModal) {
                this.saleModal.style.display = 'none';
            }
        });

        // Event listener para formulário de venda
        this.saleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerSale();
        });
    }

    private addProduct(): void {
        const name = this.nameInput.value;
        const price = parseFloat(this.priceInput.value);
        const cost = parseFloat(this.costInput.value);
        const description = this.descriptionInput.value;
        const category = this.categoryInput.value;

        if (!name || isNaN(price) || price <= 0 || isNaN(cost) || cost < 0 || !category) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const product: Product = {
            id: this.generateId(),
            name,
            price,
            cost,
            description,
            category,
            createdAt: new Date().toISOString()
        };

        // Adicionar à lista e salvar
        this.products.push(product);
        this.saveProducts();

        // Limpar formulário
        this.form.reset();

        // Atualizar UI
        this.updateUI();
    }

    private deleteProduct(id: string): void {
        this.products = this.products.filter(product => product.id !== id);
        this.saveProducts();
        this.updateUI();
    }

    private openEditModal(id: string): void {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

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
    }

    private openSaleModal(id: string): void {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        // Preencher formulário de venda
        this.saleProductIdInput.value = product.id;
        this.saleProductNameInput.value = product.name;
        this.saleUnitPriceInput.value = product.price.toString();
        this.saleQuantityInput.value = '1';

        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        this.saleDateInput.value = today;

        // Mostrar modal
        this.saleModal.style.display = 'block';
    }

    private registerSale(): void {
        const productId = this.saleProductIdInput.value;
        const quantity = parseInt(this.saleQuantityInput.value);
        const unitPrice = parseFloat(this.saleUnitPriceInput.value);
        const date = this.saleDateInput.value;
        const description = this.saleDescriptionInput.value;

        if (isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice <= 0 || !date) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Criar transação de venda
        const transaction = {
            id: this.generateId(),
            type: 'income',
            description: description || `Venda de ${quantity}x ${product.name}`,
            amount: quantity * unitPrice,
            date,
            category: 'vendas',
            productId,
            quantity
        };

        // Salvar transação no localStorage
        const transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));

        // Fechar modal
        this.saleModal.style.display = 'none';

        // Limpar formulário
        this.saleForm.reset();

        // Mostrar confirmação
        alert(`Venda registrada com sucesso! Valor total: ${this.formatCurrency(transaction.amount)}`);
    }

    private getTransactions(): any[] {
        const storedTransactions = localStorage.getItem('finance_transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    }

    private applyFilters(): void {
        const categoryFilter = this.filterCategorySelect.value;
        const searchFilter = this.searchInput.value.toLowerCase();

        let filteredProducts = this.products.slice();

        // Filtrar por categoria
        if (categoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
        }

        // Filtrar por texto de busca
        if (searchFilter) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchFilter) || 
                p.description.toLowerCase().includes(searchFilter)
            );
        }

        this.renderProducts(filteredProducts);
    }

    private updateUI(): void {
        this.renderProducts(this.products);
    }

    private renderProducts(products: Product[]): void {
        // Limpar container
        this.productsContainer.innerHTML = '';

        if (products.length === 0) {
            this.productsContainer.appendChild(this.emptyState);
            return;
        }

        // Ordenar produtos por nome
        const sortedProducts = products.slice().sort((a, b) => a.name.localeCompare(b.name));

        sortedProducts.forEach(product => {
            const productElement = this.createProductElement(product);
            this.productsContainer.appendChild(productElement);
        });
    }

    private createProductElement(product: Product): HTMLElement {
        const { id, name, price, cost, description, category } = product;

        const productElement = document.createElement('div');
        productElement.classList.add('product-item');

        // Obter nome da categoria para exibição
        const categoryName = this.getCategoryName(category);

        // Calcular margem de lucro
        const profit = price - cost;
        const profitMargin = (profit / price) * 100;

        productElement.innerHTML = `
            <div class="product-header">
                <h3 class="product-name">${name}</h3>
                <span class="product-category category-${category}">${categoryName}</span>
            </div>
            <div class="product-price">${this.formatCurrency(price)}</div>
            <div class="product-cost">Custo: ${this.formatCurrency(cost)} (Margem: ${profitMargin.toFixed(1)}%)</div>
            <div class="product-description">${description || 'Sem descrição'}</div>
            <div class="product-actions">
                <button class="btn-edit" data-id="${id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-sell" data-id="${id}">
                    <i class="fas fa-cash-register"></i> Vender
                </button>
                <button class="btn-delete" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Adicionar event listeners para botões
        const editButton = productElement.querySelector('.btn-edit');
        editButton.addEventListener('click', () => {
            this.openEditModal(id);
        });

        const sellButton = productElement.querySelector('.btn-sell');
        sellButton.addEventListener('click', () => {
            this.openSaleModal(id);
        });

        const deleteButton = productElement.querySelector('.btn-delete');
        deleteButton.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
                this.deleteProduct(id);
            }
        });

        return productElement;
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

    private saveProducts(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    }

    private loadProducts(): void {
        const storedProducts = localStorage.getItem(this.STORAGE_KEY);
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
        }
    }
}

// Inicializar o gerenciador de produtos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});
