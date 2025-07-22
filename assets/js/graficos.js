/**
 * Gerenciador de Gráficos Financeiros
 * Responsável por criar e atualizar gráficos baseados nos dados financeiros
 * e gerar previsões usando análise de tendências
 */
class ChartManager {
    constructor() {
        this.transactions = [];
        this.products = [];
        this.fixedExpenses = [];
        this.TRANSACTIONS_STORAGE_KEY = 'finance_transactions';
        this.PRODUCTS_STORAGE_KEY = 'products_data';
        this.FIXED_EXPENSES_STORAGE_KEY = 'fixed_expenses_data';
        
        // Elementos do DOM
        this.chartPeriodSelect = document.getElementById('chart-period');
        this.chartTypeSelect = document.getElementById('chart-type');
        this.generatePredictionBtn = document.getElementById('generate-prediction');
        
        // Instâncias de gráficos
        this.incomeExpenseChart = null;
        this.categoryChart = null;
        this.trendChart = null;
        this.productChart = null;
        this.predictionChart = null;
        
        // Carregar dados
        this.loadData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Inicializar gráficos
        this.initializeCharts();
    }
    
    /**
     * Configura os event listeners para os elementos interativos
     */
    setupEventListeners() {
        // Event listener para mudança de período
        if (this.chartPeriodSelect) {
            this.chartPeriodSelect.addEventListener('change', () => {
                this.updateAllCharts();
            });
        }
        
        // Event listener para mudança de tipo de gráfico
        if (this.chartTypeSelect) {
            this.chartTypeSelect.addEventListener('change', () => {
                this.updateAllCharts();
            });
        }
        
        // Event listener para botão de gerar previsão
        if (this.generatePredictionBtn) {
            this.generatePredictionBtn.addEventListener('click', () => {
                this.generatePrediction();
            });
        }
    }
    
    /**
     * Carrega os dados do localStorage
     */
    loadData() {
        // Carregar transações
        const storedTransactions = localStorage.getItem(this.TRANSACTIONS_STORAGE_KEY);
        if (storedTransactions) {
            this.transactions = JSON.parse(storedTransactions);
        }
        
        // Carregar produtos
        const storedProducts = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
        }
        
        // Carregar gastos fixos
        const storedFixedExpenses = localStorage.getItem(this.FIXED_EXPENSES_STORAGE_KEY);
        if (storedFixedExpenses) {
            this.fixedExpenses = JSON.parse(storedFixedExpenses);
        }
    }
    
    /**
     * Inicializa todos os gráficos
     */
    initializeCharts() {
        this.createIncomeExpenseChart();
        this.createCategoryChart();
        this.createTrendChart();
        this.createProductChart();
        this.initializePredictionChart();
    }
    
    /**
     * Atualiza todos os gráficos com base nos filtros selecionados
     */
    updateAllCharts() {
        this.updateIncomeExpenseChart();
        this.updateCategoryChart();
        this.updateTrendChart();
        this.updateProductChart();
    }
    
    /**
     * Filtra as transações com base no período selecionado
     */
    getFilteredTransactions() {
        const period = this.chartPeriodSelect ? this.chartPeriodSelect.value : 'month';
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
                break;
            default: // 'all'
                return this.transactions;
        }
        
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate;
        });
    }
    
    /**
     * Cria o gráfico de Entradas vs Saídas
     */
    createIncomeExpenseChart() {
        const ctx = document.getElementById('income-expense-chart');
        if (!ctx) return;
        
        const filteredTransactions = this.getFilteredTransactions();
        const incomeTotal = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenseTotal = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Entradas', 'Saídas'],
                datasets: [{
                    label: 'Valor (R$)',
                    data: [incomeTotal, expenseTotal],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(244, 67, 54, 0.7)'
                    ],
                    borderColor: [
                        'rgba(76, 175, 80, 1)',
                        'rgba(244, 67, 54, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Atualiza o gráfico de Entradas vs Saídas
     */
    updateIncomeExpenseChart() {
        if (!this.incomeExpenseChart) return;
        
        const filteredTransactions = this.getFilteredTransactions();
        const incomeTotal = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenseTotal = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.incomeExpenseChart.data.datasets[0].data = [incomeTotal, expenseTotal];
        this.incomeExpenseChart.update();
    }
    
    /**
     * Cria o gráfico de distribuição por categoria
     */
    createCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;
        
        const filteredTransactions = this.getFilteredTransactions();
        const categories = {};
        
        // Agrupar por categoria
        filteredTransactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
        });
        
        const categoryLabels = Object.keys(categories);
        const categoryData = Object.values(categories);
        const backgroundColors = this.generateColors(categoryLabels.length);
        
        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryLabels.map(cat => this.getCategoryName(cat)),
                datasets: [{
                    data: categoryData,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `R$ ${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    /**
     * Atualiza o gráfico de distribuição por categoria
     */
    updateCategoryChart() {
        if (!this.categoryChart) return;
        
        const filteredTransactions = this.getFilteredTransactions();
        const categories = {};
        
        // Agrupar por categoria
        filteredTransactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
        });
        
        const categoryLabels = Object.keys(categories);
        const categoryData = Object.values(categories);
        const backgroundColors = this.generateColors(categoryLabels.length);
        
        this.categoryChart.data.labels = categoryLabels.map(cat => this.getCategoryName(cat));
        this.categoryChart.data.datasets[0].data = categoryData;
        this.categoryChart.data.datasets[0].backgroundColor = backgroundColors;
        this.categoryChart.update();
    }
    
    /**
     * Cria o gráfico de tendência mensal
     */
    createTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;
        
        // Agrupar transações por mês
        const monthlyData = this.getMonthlyData();
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Entradas',
                        data: monthlyData.incomeData,
                        borderColor: 'rgba(76, 175, 80, 1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Saídas',
                        data: monthlyData.expenseData,
                        borderColor: 'rgba(244, 67, 54, 1)',
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Atualiza o gráfico de tendência mensal
     */
    updateTrendChart() {
        if (!this.trendChart) return;
        
        // Agrupar transações por mês
        const monthlyData = this.getMonthlyData();
        
        this.trendChart.data.labels = monthlyData.labels;
        this.trendChart.data.datasets[0].data = monthlyData.incomeData;
        this.trendChart.data.datasets[1].data = monthlyData.expenseData;
        this.trendChart.update();
    }
    
    /**
     * Cria o gráfico de vendas por produto
     */
    createProductChart() {
        const ctx = document.getElementById('product-chart');
        if (!ctx) return;
        
        const productSalesData = this.getProductSalesData();
        
        this.productChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productSalesData.labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: productSalesData.values,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Atualiza o gráfico de vendas por produto
     */
    updateProductChart() {
        if (!this.productChart) return;
        
        const productSalesData = this.getProductSalesData();
        
        this.productChart.data.labels = productSalesData.labels;
        this.productChart.data.datasets[0].data = productSalesData.values;
        this.productChart.update();
    }
    
    /**
     * Inicializa o gráfico de previsão
     */
    initializePredictionChart() {
        const ctx = document.getElementById('prediction-chart');
        if (!ctx) return;
        
        // Dados iniciais vazios
        this.predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Histórico de Entradas',
                        data: [],
                        borderColor: 'rgba(76, 175, 80, 1)',
                        backgroundColor: 'rgba(76, 175, 80, 0)',
                        borderWidth: 2,
                        pointRadius: 3
                    },
                    {
                        label: 'Previsão de Entradas',
                        data: [],
                        borderColor: 'rgba(76, 175, 80, 0.5)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 2,
                        fill: true
                    },
                    {
                        label: 'Histórico de Saídas',
                        data: [],
                        borderColor: 'rgba(244, 67, 54, 1)',
                        backgroundColor: 'rgba(244, 67, 54, 0)',
                        borderWidth: 2,
                        pointRadius: 3
                    },
                    {
                        label: 'Previsão de Saídas',
                        data: [],
                        borderColor: 'rgba(244, 67, 54, 0.5)',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
}
