/**
 * Admin Users Manager
 * Gerencia a listagem, edição e exclusão de usuários (exclusivo para diretores)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const adminUsersTile = document.getElementById('admin-users-tile');
    const adminUsersModal = document.getElementById('admin-users-modal');
    const editUserModal = document.getElementById('edit-user-modal');
    const userSearchInput = document.getElementById('user-search');
    const usersList = document.getElementById('users-list');
    const editUserForm = document.getElementById('edit-user-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // Variáveis de estado
    let allUsers = [];
    let currentUser = null;
    
    // Inicialização
    init();
    
    /**
     * Inicializa o gerenciador de usuários
     */
    function init() {
        // Verificar se o usuário atual é diretor
        checkUserRole();
        
        // Event listeners
        setupEventListeners();
    }
    
    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Abrir modal de gerenciamento de usuários
        if (adminUsersTile) {
            adminUsersTile.addEventListener('click', function(e) {
                e.preventDefault();
                openAdminUsersModal();
            });
        }
        
        // Fechar modais
        document.querySelectorAll('.close-modal').forEach(function(closeBtn) {
            closeBtn.addEventListener('click', function() {
                const modalId = this.getAttribute('data-modal');
                if (modalId) {
                    document.getElementById(modalId).style.display = 'none';
                } else {
                    // Fallback para modais sem data-modal
                    if (this.closest('.modal')) {
                        this.closest('.modal').style.display = 'none';
                    }
                }
            });
        });
        
        // Busca de usuários
        if (userSearchInput) {
            userSearchInput.addEventListener('input', function() {
                filterUsers(this.value);
            });
        }
        
        // Formulário de edição de usuário
        if (editUserForm) {
            editUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveUserChanges();
            });
        }
        
        // Botão cancelar edição
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
                editUserModal.style.display = 'none';
            });
        }
        
        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    /**
     * Verifica se o usuário atual é diretor e mostra/esconde o ícone de gerenciamento
     */
    function checkUserRole() {
        // Verificar se o Firebase está disponível
        if (!window.firebaseAuth) {
            console.warn('Firebase Auth não disponível para verificar cargo do usuário');
            return;
        }
        
        // Obter usuário atual
        const currentUser = window.firebaseAuth.getCurrentUser();
        if (!currentUser) {
            console.warn('Usuário não autenticado');
            return;
        }
        
        // Verificar se o usuário é diretor
        window.firebaseDB.getUserData(currentUser.uid)
            .then(userData => {
                if (userData && userData.professionalInfo && userData.professionalInfo.role === 'diretor') {
                    // Mostrar ícone de gerenciamento para diretores
                    if (adminUsersTile) {
                        adminUsersTile.style.display = 'flex';
                    }
                    console.log('Usuário é diretor, ícone de gerenciamento de usuários habilitado');
                } else {
                    console.log('Usuário não é diretor, ícone de gerenciamento de usuários desabilitado');
                }
            })
            .catch(error => {
                console.error('Erro ao verificar cargo do usuário:', error);
            });
    }
    
    /**
     * Abre o modal de gerenciamento de usuários e carrega a lista
     */
    function openAdminUsersModal() {
        try {
            console.log('Abrindo modal de gerenciamento de usuários');
            
            // Verificar se o modal existe
            const modal = document.getElementById('admin-users-modal');
            if (!modal) {
                console.error('Modal de gerenciamento de usuários não encontrado');
                return;
            }
            
            // Mostrar modal
            modal.style.display = 'block';
            
            // Carregar lista de usuários
            loadAllUsers();
        } catch (error) {
            console.error('Erro ao abrir modal de gerenciamento de usuários:', error);
        }
    }
    
    /**
     * Carrega todos os usuários do Firebase
     */
    function loadAllUsers() {
        // Verificar se o Firebase está disponível
        if (!window.firebaseDB) {
            console.error('Firebase DB não disponível para carregar usuários');
            return;
        }
        
        // Mostrar indicador de carregamento
        usersList.innerHTML = '<tr><td colspan="4" class="loading-message">Carregando usuários...</td></tr>';
        
        // Carregar usuários do Firebase
        window.firebaseDB.getAllUsers()
            .then(result => {
                console.log('Resultado de getAllUsers:', result);
                if (result.success && Array.isArray(result.users)) {
                    allUsers = result.users;
                    renderUsersList(result.users);
                } else {
                    console.error('Formato de resposta inválido:', result);
                    usersList.innerHTML = '<tr><td colspan="4" class="error-message">Formato de dados inválido. Contate o administrador.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Erro ao carregar usuários:', error);
                usersList.innerHTML = '<tr><td colspan="4" class="error-message">Erro ao carregar usuários. Tente novamente.</td></tr>';
            });
    }
    
    /**
     * Renderiza a lista de usuários na tabela
     */
    function renderUsersList(users) {
        if (!users || users.length === 0) {
            usersList.innerHTML = '<tr><td colspan="4" class="empty-message">Nenhum usuário encontrado.</td></tr>';
            return;
        }
        
        // Limpar lista atual
        usersList.innerHTML = '';
        
        // Adicionar cada usuário à tabela
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Nome completo
            const nameCell = document.createElement('td');
            // Verificar diferentes estruturas possíveis para o nome
            const firstName = user.personalInfo?.firstName || user.personalInfo?.firstname || '';
            const lastName = user.personalInfo?.lastName || user.personalInfo?.lastname || '';
            nameCell.textContent = `${firstName} ${lastName}`;
            row.appendChild(nameCell);
            
            // Email
            const emailCell = document.createElement('td');
            // Verificar diferentes estruturas possíveis para o email
            emailCell.textContent = user.email || user.personalInfo?.email || '';
            row.appendChild(emailCell);
            
            // Cargo
            const roleCell = document.createElement('td');
            roleCell.textContent = user.professionalInfo?.role || 'Não definido';
            row.appendChild(roleCell);
            
            // Ações
            const actionsCell = document.createElement('td');
            actionsCell.classList.add('user-actions');
            
            // Botão Editar
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.classList.add('action-btn', 'edit-btn');
            editBtn.title = 'Editar usuário';
            editBtn.addEventListener('click', () => openEditUserModal(user));
            actionsCell.appendChild(editBtn);
            
            // Botão Excluir
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.classList.add('action-btn', 'delete-btn');
            deleteBtn.title = 'Excluir usuário';
            deleteBtn.addEventListener('click', () => confirmDeleteUser(user));
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(actionsCell);
            usersList.appendChild(row);
        });
    }
    
    /**
     * Filtra a lista de usuários com base na busca
     */
    function filterUsers(searchTerm) {
        if (!searchTerm) {
            renderUsersList(allUsers);
            return;
        }
        
        searchTerm = searchTerm.toLowerCase();
        
        const filteredUsers = allUsers.filter(user => {
            const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.toLowerCase();
            const email = (user.email || '').toLowerCase();
            const username = (user.username || '').toLowerCase();
            
            return fullName.includes(searchTerm) || 
                   email.includes(searchTerm) || 
                   username.includes(searchTerm);
        });
        
        renderUsersList(filteredUsers);
    }
    
    /**
     * Abre o modal de edição de usuário
     */
    function openEditUserModal(user) {
        try {
            console.log('Abrindo modal de edição para usuário:', user);
            
            // Guardar referência ao usuário atual
            currentUser = user;
            
            // Verificar se os elementos existem antes de definir seus valores
            const idField = document.getElementById('edit-user-id');
            const nameField = document.getElementById('edit-user-name');
            const lastnameField = document.getElementById('edit-user-lastname');
            const emailField = document.getElementById('edit-user-email');
            const usernameField = document.getElementById('edit-user-username');
            const roleField = document.getElementById('edit-user-role');
            
            // Preencher formulário com dados do usuário (com verificações de nulidade)
            if (idField) idField.value = user.uid || '';
            if (nameField) nameField.value = user.personalInfo?.firstName || '';
            if (lastnameField) lastnameField.value = user.personalInfo?.lastName || '';
            if (emailField) emailField.value = user.email || '';
            if (usernameField) usernameField.value = user.username || '';
            if (roleField) roleField.value = user.professionalInfo?.role || 'funcionario';
            
            // Exibir o modal de edição
            const editModal = document.getElementById('edit-user-modal');
            if (editModal) {
                editModal.style.display = 'block';
            } else {
                console.error('Modal de edição não encontrado');
            }
            // Adicionar outros campos do formulário com verificações de nulidade
            const phoneField = document.getElementById('edit-user-phone');
            if (phoneField) phoneField.value = user.contactInfo?.phone || '';
            
            // Nota: O modal já está sendo exibido acima, não precisamos fazer isso novamente
        } catch (error) {
            console.error('Erro ao abrir modal de edição:', error);
        }
    }
    
    /**
     * Salva as alterações do usuário
     */
    function saveUserChanges() {
        // Verificar se há um usuário selecionado
        if (!currentUser) {
            console.error('Nenhum usuário selecionado para edição');
            return;
        }
        
        // Obter dados do formulário
        const userId = document.getElementById('edit-user-id').value;
        const updatedUser = {
            uid: userId,
            personalInfo: {
                ...currentUser.personalInfo,
                firstName: document.getElementById('edit-user-name').value,
                lastName: document.getElementById('edit-user-lastname').value
            },
            contactInfo: {
                ...currentUser.contactInfo,
                phone: document.getElementById('edit-user-phone').value
            },
            professionalInfo: {
                ...currentUser.professionalInfo,
                role: document.getElementById('edit-user-role').value
            },
            email: document.getElementById('edit-user-email').value,
            username: document.getElementById('edit-user-username').value
        };
        
        // Atualizar usuário no Firebase
        window.firebaseDB.updateUser(userId, updatedUser)
            .then(() => {
                alert('Usuário atualizado com sucesso!');
                
                // Fechar modal e recarregar lista
                editUserModal.style.display = 'none';
                loadAllUsers();
            })
            .catch(error => {
                console.error('Erro ao atualizar usuário:', error);
                alert('Erro ao atualizar usuário. Por favor, tente novamente.');
            });
    }
    
    /**
     * Confirma e exclui um usuário
     */
    function confirmDeleteUser(user) {
        const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`;
        
        if (confirm(`Tem certeza que deseja excluir o usuário ${fullName}?`)) {
            deleteUser(user.uid);
        }
    }
    
    /**
     * Exclui um usuário do Firebase
     */
    function deleteUser(userId) {
        // Verificar se o Firebase está disponível
        if (!window.firebaseDB) {
            console.error('Firebase DB não disponível para excluir usuário');
            return;
        }
        
        // Excluir usuário
        window.firebaseDB.deleteUser(userId)
            .then(() => {
                alert('Usuário excluído com sucesso!');
                
                // Recarregar lista de usuários
                loadAllUsers();
            })
            .catch(error => {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário. Por favor, tente novamente.');
            });
    }
});
