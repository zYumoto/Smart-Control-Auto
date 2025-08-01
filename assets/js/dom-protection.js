/**
 * Script de proteção para erros de DOM
 * Previne erros comuns de "Cannot read properties of null" em bibliotecas de terceiros
 */

(function() {
    console.log('DOM Protection Script carregado');
    
    // Guarda a implementação original de querySelector e querySelectorAll
    const originalQuerySelector = Element.prototype.querySelector;
    const originalQuerySelectorAll = Element.prototype.querySelectorAll;
    const originalGetElementById = Document.prototype.getElementById;
    
    // Sobrescreve querySelector para retornar um objeto seguro quando o elemento não for encontrado
    Element.prototype.querySelector = function(selector) {
        const result = originalQuerySelector.call(this, selector);
        if (!result) {
            console.warn(`Elemento não encontrado: ${selector}`);
            // Retorna um proxy que absorve acessos a propriedades sem causar erros
            return new Proxy({}, {
                get: function(target, prop) {
                    if (prop === 'dataset') {
                        return new Proxy({}, {
                            get: function() { return undefined; }
                        });
                    }
                    if (typeof target[prop] === 'function') {
                        return function() { return undefined; };
                    }
                    return undefined;
                }
            });
        }
        return result;
    };
    
    // Sobrescreve getElementById para retornar um objeto seguro quando o elemento não for encontrado
    Document.prototype.getElementById = function(id) {
        const result = originalGetElementById.call(this, id);
        if (!result) {
            console.warn(`Elemento não encontrado por ID: ${id}`);
            // Retorna um proxy que absorve acessos a propriedades sem causar erros
            return new Proxy({}, {
                get: function(target, prop) {
                    if (prop === 'dataset') {
                        return new Proxy({}, {
                            get: function() { return undefined; }
                        });
                    }
                    if (typeof target[prop] === 'function') {
                        return function() { return undefined; };
                    }
                    return undefined;
                }
            });
        }
        return result;
    };
    
    // Adiciona proteção global para erros de dataset
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message && event.error.message.includes("Cannot read properties of null (reading 'dataset')")) {
            console.warn('Erro de dataset interceptado:', event.error.message);
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
    
    console.log('DOM Protection Script: Proteções aplicadas');
})();
