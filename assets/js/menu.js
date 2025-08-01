document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está logado usando Firebase ou localStorage
    const checkAuthState = async () => {
        console.log('Verificando estado de autenticação...');
        
        // Verificar primeiro no Firebase
        let isAuthenticated = false;
        let userEmail = null;
        let userId = null;
        let userProfilePhoto = null; // Armazenar a foto de perfil do usuário
        
        if (window.firebaseAuth) {
            try {
                console.log('Tentando verificar autenticação via Firebase...');
                
                // Usar uma Promise para aguardar o resultado do checkAuthState
                const user = await new Promise((resolve) => {
                    window.firebaseAuth.checkAuthState((user) => {
                        resolve(user);
                    });
                });
                
                if (user) {
                    console.log('Usuário autenticado no Firebase:', user.email);
                    isAuthenticated = true;
                    userEmail = user.email;
                    userId = user.uid;
                } else {
                    console.log('Não autenticado no Firebase, verificando localStorage...');
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação Firebase:', error);
                console.log('Verificando fallback no localStorage...');
            }
        } else {
            console.warn('Firebase Auth não está disponível, verificando localStorage...');
        }
        
        // Se não estiver autenticado no Firebase, verificar no localStorage
        if (!isAuthenticated) {
            console.log('Verificando autenticação no localStorage...');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            userEmail = localStorage.getItem('userEmail');
            const currentUser = localStorage.getItem('currentUser');
            
            if (isLoggedIn === 'true' && userEmail && currentUser) {
                console.log('Usuário autenticado via localStorage:', userEmail);
                isAuthenticated = true;
                try {
                    const userData = JSON.parse(currentUser);
                    userId = userData.uid || 'local-' + userEmail.replace(/[^a-zA-Z0-9]/g, '-');
                } catch (e) {
                    console.error('Erro ao analisar dados do usuário:', e);
                    userId = 'local-' + userEmail.replace(/[^a-zA-Z0-9]/g, '-');
                }
            } else {
                console.log('Não autenticado no localStorage');
            }
        }
        
        // Decidir o que fazer com base no estado de autenticação
        if (isAuthenticated && userEmail) {
            console.log('Autenticação confirmada, configurando UI...');
            
            // Buscar dados do usuário para exibir o nome em vez do email
            let userName = userEmail; // Valor padrão caso não encontre o nome
            
            // Tentar obter o nome do usuário do Firebase ou localStorage
            if (userId) {
                if (window.firebaseDB) {
                    try {
                        const result = await window.firebaseDB.getUser(userId);
                        if (result.success && result.user) {
                            // Verificar se temos o nome completo do usuário
                            if (result.user.personalInfo) {
                                if (result.user.personalInfo.firstname && result.user.personalInfo.lastname) {
                                    userName = `${result.user.personalInfo.firstname} ${result.user.personalInfo.lastname}`;
                                } else if (result.user.personalInfo.username) {
                                    userName = result.user.personalInfo.username;
                                } else if (result.user.personalInfo.fullname) {
                                    userName = result.user.personalInfo.fullname;
                                }
                            } else if (result.user.fullname) {
                                userName = result.user.fullname;
                            } else if (result.user.displayName) {
                                userName = result.user.displayName;
                            }
                            
                            // Verificar se há foto de perfil
                            if (result.user.profilePhoto && result.user.profilePhoto !== 'undefined') {
                                userProfilePhoto = result.user.profilePhoto;
                                console.log('Foto de perfil encontrada no Firebase:', userProfilePhoto.substring(0, 30) + '...');
                            } else {
                                console.log('Nenhuma foto de perfil encontrada no Firebase para o usuário');
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao buscar dados do usuário:', error);
                    }
                } else {
                    // Tentar obter do localStorage
                    try {
                        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        if (currentUser) {
                            if (currentUser.personalInfo) {
                                if (currentUser.personalInfo.firstname && currentUser.personalInfo.lastname) {
                                    userName = `${currentUser.personalInfo.firstname} ${currentUser.personalInfo.lastname}`;
                                } else if (currentUser.personalInfo.username) {
                                    userName = currentUser.personalInfo.username;
                                } else if (currentUser.personalInfo.fullname) {
                                    userName = currentUser.personalInfo.fullname;
                                }
                            } else if (currentUser.fullname) {
                                userName = currentUser.fullname;
                            } else if (currentUser.displayName) {
                                userName = currentUser.displayName;
                            }
                            
                            // Verificar se há foto de perfil no localStorage
                            if (currentUser.profilePhoto && currentUser.profilePhoto !== 'undefined') {
                                userProfilePhoto = currentUser.profilePhoto;
                                console.log('Foto de perfil encontrada no localStorage:', userProfilePhoto.substring(0, 30) + '...');
                            } else {
                                console.log('Nenhuma foto de perfil encontrada no localStorage para o usuário');
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao analisar dados do usuário do localStorage:', e);
                    }
                }
            }
            
            // Exibir o nome do usuário
            const userEmailElement = document.getElementById('user-email');
            if (userEmailElement) {
                userEmailElement.textContent = userName;
            }
            
            // Exibir a foto de perfil se disponível
            if (userProfilePhoto) {
                // Verificar se existe o elemento de foto no header (pode ser adicionado futuramente)
                const headerProfilePhoto = document.getElementById('header-profile-photo');
                if (headerProfilePhoto) {
                    headerProfilePhoto.src = userProfilePhoto;
                }
                
                // Atualizar a foto no modal de perfil
                const userPhoto = document.getElementById('user-photo');
                if (userPhoto) {
                    console.log('Atualizando foto de perfil no modal');
                    userPhoto.src = userProfilePhoto;
                }
            } else {
                console.log('Nenhuma foto de perfil disponível para exibir');
            }
            
            // Verificar o papel do usuário
            await checkUserRole(userId, userEmail);
            
            // Configurar eventos e UI
            setupUI();
        } else {
            console.error('Autenticação falhou, redirecionando para login...');
            // Redirecionar para a página de login
            window.location.href = 'index.html';
        }
    };
    
    // Iniciar verificação de autenticação
    checkAuthState();

    // Configurar UI e eventos
    const setupUI = () => {
        // Funcionalidade do botão de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                try {
                    if (window.firebaseAuth) {
                        // Usar Firebase Auth para logout
                        await window.firebaseAuth.logoutUser();
                    } else {
                        // Fallback para localStorage
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('currentUser');
                    }
                    
                    // Redirecionar para a página de login
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    alert('Erro ao fazer logout. Tente novamente.');
                }
            });
        }
        
        // Adicionar classe 'active' ao tile do menu correspondente à página atual
        const currentPage = window.location.pathname.split('/').pop();
        const menuTiles = document.querySelectorAll('.menu-tile');
        
        menuTiles.forEach(tile => {
            const tileHref = tile.getAttribute('href');
            if (tileHref === currentPage) {
                tile.classList.add('active');
            }
        });

        // Adicionar evento de clique ao tile de visualização de usuários
        const viewUsersTile = document.getElementById('view-users-tile');
        if (viewUsersTile) {
            viewUsersTile.addEventListener('click', (e) => {
                e.preventDefault();
                showUsersModal();
            });
        }
    };
    
    // Adicionar classe 'active' ao tile do menu correspondente à página atual
    const currentPage = window.location.pathname.split('/').pop();
    const menuTiles = document.querySelectorAll('.menu-tile');
    
    menuTiles.forEach(tile => {
        const tileHref = tile.getAttribute('href');
        if (tileHref === currentPage) {
            tile.classList.add('active');
        }
    });

    // Adicionar evento de clique ao tile de visualização de usuários
    const viewUsersTile = document.getElementById('view-users-tile');
    if (viewUsersTile) {
        viewUsersTile.addEventListener('click', (e) => {
            e.preventDefault();
            showUsersModal();
        });
    }
});

// Função para verificar o cargo do usuário
async function checkUserRole(userId = null, userEmail = null) {
    try {
        console.log(`Verificando papel do usuário (userId: ${userId}, email: ${userEmail})`);
        let isDirector = false;
        let userData = null;
        
        // Tentar primeiro via Firebase
        if (window.firebaseAuth && window.firebaseDB) {
            console.log('Tentando verificar papel via Firebase...');
            if (userId) {
                // Se temos o ID do usuário, buscar diretamente
                const result = await window.firebaseDB.getUser(userId);
                if (result.success) {
                    console.log('Usuário encontrado no Firebase:', result.user);
                    userData = result.user;
                    isDirector = userData.professionalInfo && userData.professionalInfo.role === 'diretor';
                    console.log(`Papel do usuário no Firebase: ${userData.professionalInfo?.role}, isDirector: ${isDirector}`);
                } else {
                    console.log('Usuário não encontrado no Firebase, verificando localStorage...');
                }
            } else {
                // Tentar obter o usuário atual do Firebase Auth
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    const result = await window.firebaseDB.getUser(currentUser.uid);
                    if (result.success) {
                        console.log('Usuário atual encontrado no Firebase:', result.user);
                        userData = result.user;
                        isDirector = userData.professionalInfo && userData.professionalInfo.role === 'diretor';
                        console.log(`Papel do usuário atual no Firebase: ${userData.professionalInfo?.role}, isDirector: ${isDirector}`);
                    } else {
                        console.log('Usuário atual não encontrado no Firebase, verificando localStorage...');
                    }
                } else {
                    console.log('Nenhum usuário atual no Firebase, verificando localStorage...');
                }
            }
        } else {
            console.warn('Firebase não está disponível, verificando localStorage...');
        }
        
        // Se não encontrou no Firebase ou não tem Firebase, verificar no localStorage
        if (!userData) {
            console.log('Verificando papel do usuário no localStorage...');
            const currentUserData = localStorage.getItem('currentUser');
            
            if (currentUserData) {
                try {
                    userData = JSON.parse(currentUserData);
                    console.log('Dados do usuário encontrados no localStorage:', userData);
                    
                    // Verificar se o email corresponde (se fornecido)
                    if (!userEmail || userData.email === userEmail) {
                        isDirector = userData.professionalInfo && userData.professionalInfo.role === 'diretor';
                        console.log(`Papel do usuário no localStorage: ${userData.professionalInfo?.role}, isDirector: ${isDirector}`);
                    } else {
                        console.log(`Email no localStorage (${userData.email}) não corresponde ao email fornecido (${userEmail})`);
                    }
                } catch (e) {
                    console.error('Erro ao analisar dados do usuário do localStorage:', e);
                }
            } else {
                console.log('Nenhum dado de usuário encontrado no localStorage');
            }
        }
        
        // Se o usuário é diretor, mostrar o tile de gerenciamento de usuários
        if (isDirector) {
            console.log('Usuário é diretor, exibindo botão de gerenciamento de usuários');
            // Mostrar o botão de gerenciamento de usuários que já existe no HTML
            const adminUsersTile = document.getElementById('admin-users-tile');
            if (adminUsersTile) {
                adminUsersTile.style.display = 'flex';
                
                // Adicionar evento de clique se ainda não tiver
                if (!adminUsersTile.hasAttribute('data-event-attached')) {
                    adminUsersTile.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Mostrar o modal de gerenciamento de usuários
                        const adminUsersModal = document.getElementById('admin-users-modal');
                        if (adminUsersModal) {
                            adminUsersModal.style.display = 'block';
                            // Carregar a lista de usuários
                            loadUsersList();
                        }
                    });
                    adminUsersTile.setAttribute('data-event-attached', 'true');
                }
            } else {
                console.error('Elemento admin-users-tile não encontrado no HTML');
            }
        } else {
            console.log('Usuário não é diretor, ocultando botão de gerenciamento de usuários');
            const adminUsersTile = document.getElementById('admin-users-tile');
            if (adminUsersTile) {
                adminUsersTile.style.display = 'none';
            }
        }
        
        return isDirector;
    } catch (error) {
        console.error('Erro ao verificar o cargo do usuário:', error);
        return false;
    }
}

// Função para obter a lista de usuários registrados
async function getRegisteredUsers() {
    try {
        if (window.firebaseDB) {
            // Usar Firebase Realtime Database
            const result = await window.firebaseDB.getAllUsers();
            if (result.success) {
                return result.users;
            } else {
                console.error('Erro ao obter usuários do Firebase:', result.error);
                // Fallback para localStorage
                return getLocalUsers();
            }
        } else {
            // Fallback para localStorage
            return getLocalUsers();
        }
    } catch (error) {
        console.error('Erro ao obter usuários:', error);
        return getLocalUsers();
    }
}

// Função auxiliar para obter usuários do localStorage (fallback)
function getLocalUsers() {
    // Usuários padrão do sistema
    const defaultUsers = [
        { email: 'admin@example.com', fullname: 'Administrador', professionalInfo: { role: 'diretor' } },
        { email: 'user@example.com', fullname: 'Usuário Padrão', professionalInfo: { role: 'analista' } },
        { email: 'teste@teste.com', fullname: 'Usuário Teste', professionalInfo: { role: 'assistente' } }
    ];
    
    // Obter usuários registrados do localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Combinar os usuários padrão com os registrados
    return [...defaultUsers, ...registeredUsers];
}

// Função para mostrar o modal com os usuários cadastrados
async function showUsersModal() {
    // Criar o modal dinamicamente
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'users-modal';
    
    // Criar o conteúdo inicial do modal com indicador de carregamento
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Usuários Cadastrados</h2>
            <div class="users-list">
                <p>Carregando usuários...</p>
            </div>
        </div>
    `;
    
    // Adicionar o modal ao DOM
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar o modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    try {
        // Obter a lista de usuários registrados (agora assíncrono)
        const registeredUsers = await getRegisteredUsers();
        
        // Atualizar o conteúdo do modal com os usuários
        const usersList = modal.querySelector('.users-list');
        if (usersList) {
            usersList.innerHTML = registeredUsers.length > 0 
                ? createUsersList(registeredUsers) 
                : '<p>Nenhum usuário cadastrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        
        // Mostrar mensagem de erro
        const usersList = modal.querySelector('.users-list');
        if (usersList) {
            usersList.innerHTML = '<p class="error">Erro ao carregar usuários. Tente novamente.</p>';
        }
    }
}

// Função para criar a lista HTML de usuários
function createUsersList(users) {
    return users.map(user => {
        const role = user.professionalInfo?.role || 'Não definido';
        const roleName = getRoleName(role);
        
        return `
            <div class="user-item">
                <div class="user-info">
                    <h3>${user.fullname || user.email}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Cargo:</strong> ${roleName}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Função para obter o nome formatado do cargo
function getRoleName(role) {
    switch(role) {
        case 'diretor':
            return 'Diretor';
        case 'rh':
            return 'RH';
        case 'gerente':
            return 'Gerente';
        case 'supervisor':
            return 'Supervisor';
        default:
            return 'Usuário';
    }
}

// Função para carregar a lista de usuários no modal de gerenciamento
async function loadUsersList() {
    console.log('Carregando lista de usuários para o modal de gerenciamento...');
    
    const usersTableBody = document.querySelector('#admin-users-modal .users-table tbody');
    const loadingMessage = document.querySelector('#admin-users-modal .loading-message');
    const errorMessage = document.querySelector('#admin-users-modal .error-message');
    
    if (!usersTableBody) {
        console.error('Elemento da tabela de usuários não encontrado');
        return;
    }

    // Mostrar mensagem de carregamento
    if (loadingMessage) loadingMessage.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    usersTableBody.innerHTML = '';

    try {
        // Verificar se o Firebase está disponível
        if (!window.firebaseDB) {
            console.error('Firebase não está disponível - window.firebaseDB é undefined');
            throw new Error('Firebase não está disponível');
        }
        
        console.log('Firebase disponível, verificando método getAllUsers:', typeof window.firebaseDB.getAllUsers);

        // Buscar todos os usuários do Firebase
        console.log('Chamando firebaseDB.getAllUsers()...');
        const result = await window.firebaseDB.getAllUsers();
        console.log('Resultado de getAllUsers:', result);

        if (result.success && result.users && result.users.length > 0) {
            console.log(`${result.users.length} usuários encontrados:`, result.users);

            // Ocultar mensagem de carregamento
            if (loadingMessage) loadingMessage.style.display = 'none';

            // Preencher a tabela com os dados dos usuários
            result.users.forEach(user => {
                console.log('Processando usuário:', user);
                const row = document.createElement('tr');

                // Obter informações do usuário de forma segura
                const firstName = user.personalInfo?.firstname || '';
                const lastName = user.personalInfo?.lastname || '';
                const fullName = firstName && lastName ? `${firstName} ${lastName}` : (user.personalInfo?.username || 'Nome indisponível');
                const email = user.personalInfo?.email || user.email || 'Email indisponível';
                const role = user.professionalInfo?.role ? getRoleName(user.professionalInfo.role) : 'Usuário';
                
                console.log(`Usuário ${user.uid}: Nome=${fullName}, Email=${email}, Cargo=${role}`);

                // Criar células da tabela
                row.innerHTML = `
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${role}</td>
                    <td class="user-actions">
                        <button class="action-btn edit-btn" data-user-id="${user.uid}" title="Editar usuário">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-user-id="${user.uid}" title="Excluir usuário">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;

                usersTableBody.appendChild(row);
            });

            // Adicionar eventos aos botões de ação
            setupUserActionButtons();

        } else {
            console.log('Nenhum usuário encontrado ou erro ao buscar usuários. Resultado:', result);
            usersTableBody.innerHTML = `<tr><td colspan="4" class="empty-message">Nenhum usuário encontrado</td></tr>`;
            if (loadingMessage) loadingMessage.style.display = 'none';
        }

    } catch (error) {
        console.error('Erro ao carregar lista de usuários:', error);
        usersTableBody.innerHTML = `<tr><td colspan="4" class="error-message">Erro ao carregar usuários: ${error.message}</td></tr>`;
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) {
            errorMessage.textContent = `Erro: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    }
}

// Função para configurar os botões de ação da tabela de usuários
function setupUserActionButtons() {
    // Botões de edição
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            openEditUserModal(userId);
        });
    });

    // Botões de exclusão
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            confirmDeleteUser(userId);
        });
    });
}

// Função para abrir o modal de edição de usuário
async function openEditUserModal(userId) {
    console.log('Abrindo modal de edição para o usuário:', userId);

    try {
        // Verificar se o Firebase está disponível
        if (!window.firebaseDB) {
            throw new Error('Firebase não está disponível');
        }

        // Buscar dados do usuário
        const result = await window.firebaseDB.getUser(userId);

        if (result.success && result.user) {
            const user = result.user;

            // Preencher o formulário de edição
            document.getElementById('edit-user-id').value = userId;
            document.getElementById('edit-user-name').value = user.personalInfo?.firstname || '';
            document.getElementById('edit-user-lastname').value = user.personalInfo?.lastname || '';
            document.getElementById('edit-user-email').value = user.personalInfo?.email || user.email || '';
            document.getElementById('edit-user-username').value = user.personalInfo?.username || '';
            document.getElementById('edit-user-role').value = user.professionalInfo?.role || 'usuario';

            // Abrir o modal
            const editUserModal = document.getElementById('edit-user-modal');
            if (editUserModal) {
                editUserModal.style.display = 'block';
            }
        } else {
            alert('Erro ao buscar dados do usuário. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        alert(`Erro: ${error.message}`);
    }
}

// Função para confirmar a exclusão de um usuário
function confirmDeleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        deleteUser(userId);
    }
}

// Função para excluir um usuário
async function deleteUser(userId) {
    console.log('Excluindo usuário:', userId);

    try {
        // Verificar se o Firebase está disponível
        if (!window.firebaseDB) {
            throw new Error('Firebase não está disponível');
        }

        // Excluir usuário
        const result = await window.firebaseDB.deleteUser(userId);

        if (result.success) {
            alert('Usuário excluído com sucesso!');
            // Recarregar a lista de usuários
            loadUsersList();
        } else {
            alert(`Erro ao excluir usuário: ${result.error || 'Erro desconhecido'}`);
        }

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert(`Erro: ${error.message}`);
    }
}
