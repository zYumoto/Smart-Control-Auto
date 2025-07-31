// Imagem de perfil padrão em base64 (avatar genérico)
const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjYWM1OGFhIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMTQsMjE0SDQyYzAtNDYsNDAtNzAsODYtNzBzODYsMjQsODYsNzBaIi8+PC9zdmc+';

// Classe para gerenciar o perfil do usuário
class UserProfile {
    constructor() {
        // Elementos do DOM
        this.profileBtn = document.getElementById('profile-btn');
        this.profileModal = document.getElementById('profile-modal');
        this.closeModalButtons = document.querySelectorAll('.close-modal');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.photoInput = document.getElementById('photo-input');
        this.userPhoto = document.getElementById('user-photo');
        this.saveProfileBtn = document.getElementById('save-profile-btn');
        this.changePasswordBtn = document.getElementById('change-password-btn');
        
        // Campos do formulário
        this.profileName = document.getElementById('profile-name');
        this.profileEmail = document.getElementById('profile-email');
        this.profileRole = document.getElementById('profile-role').querySelector('span');
        this.profileFirstname = document.getElementById('profile-firstname');
        this.profileLastname = document.getElementById('profile-lastname');
        this.profileUsername = document.getElementById('profile-username');
        this.profilePhone = document.getElementById('profile-phone');
        this.profileCep = document.getElementById('profile-cep');
        this.profileStreet = document.getElementById('profile-street');
        this.profileNumber = document.getElementById('profile-number');
        this.profileComplement = document.getElementById('profile-complement');
        this.profileNeighborhood = document.getElementById('profile-neighborhood');
        this.profileCity = document.getElementById('profile-city');
        this.profileState = document.getElementById('profile-state');
        
        // Inicializar eventos
        this.initEvents();
        
        // Carregar dados do usuário
        this.loadUserData();
    }
    
    // Inicializar eventos
    initEvents() {
        // Abrir modal de perfil
        if (this.profileBtn) {
            this.profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(this.profileModal);
            });
        }
        
        // Fechar modais
        this.closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Fechar modal ao clicar fora do conteúdo
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                this.closeModal(e.target);
            }
        });
        
        // Alternar entre abas
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.activateTab(tabId);
            });
        });
        
        // Carregar nova foto de perfil
        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }
        
        // Salvar alterações do perfil
        if (this.saveProfileBtn) {
            this.saveProfileBtn.addEventListener('click', () => {
                this.saveProfileChanges();
            });
        }
        
        // Alterar senha
        if (this.changePasswordBtn) {
            this.changePasswordBtn.addEventListener('click', () => {
                this.initiatePasswordChange();
            });
        }
        
        // Buscar endereço pelo CEP
        if (this.profileCep) {
            this.profileCep.addEventListener('blur', () => {
                this.fetchAddressByCep();
            });
            this.profileCep.addEventListener('input', (e) => this.formatCEP(e.target));
        }
        
        // Botão de busca de CEP
        const searchCepBtn = document.getElementById('search-cep-btn');
        if (searchCepBtn) {
            searchCepBtn.addEventListener('click', () => {
                this.fetchAddressByCep();
            });
        }
        
        // Formatar telefone
        if (this.profilePhone) {
            this.profilePhone.addEventListener('input', (e) => this.formatPhone(e.target));
        }
    }
    
    // Abrir modal
    openModal(modal) {
        modal.classList.add('active');
    }
    
    // Fechar modal
    closeModal(modal) {
        modal.classList.remove('active');
    }
    
    // Ativar aba
    activateTab(tabId) {
        // Desativar todas as abas
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.style.display = 'none');
        
        // Ativar a aba selecionada
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).style.display = 'grid';
    }
    
    // Carregar dados do usuário
    async loadUserData() {
        try {
            let userData = null;
            let userId = null;
            
            console.log('Iniciando carregamento de dados do usuário...');
            
            // Tentar obter dados do usuário do Firebase
            if (window.firebaseAuth && window.firebaseDB) {
                console.log('Firebase disponível, tentando obter dados...');
                const currentUser = window.firebaseAuth.getCurrentUser();
                
                if (currentUser) {
                    userId = currentUser.uid;
                    console.log('Usuário autenticado encontrado, ID:', userId);
                    
                    const result = await window.firebaseDB.getUser(userId);
                    if (result.success) {
                        userData = result.user;
                        console.log('Dados do usuário carregados do Firebase:', userData);
                        
                        // Verificar se há foto de perfil
                        if (userData.profilePhoto) {
                            console.log('Foto de perfil encontrada no Firebase, tamanho:', 
                                Math.round(userData.profilePhoto.length / 1024), 'KB');
                        } else {
                            console.log('Nenhuma foto de perfil encontrada no Firebase');
                        }
                        
                        // Atualizar localStorage com os dados mais recentes do Firebase
                        localStorage.setItem('currentUser', JSON.stringify({
                            uid: userId,
                            ...userData
                        }));
                        console.log('LocalStorage atualizado com dados do Firebase');
                    } else {
                        console.error('Erro ao obter dados do usuário do Firebase:', result.error);
                    }
                } else {
                    console.log('Nenhum usuário autenticado encontrado no Firebase');
                }
            } else {
                console.log('Firebase não disponível');
            }
            
            // Se não encontrou no Firebase, tentar localStorage
            if (!userData) {
                console.log('Tentando obter dados do localStorage...');
                const currentUserData = localStorage.getItem('currentUser');
                if (currentUserData) {
                    try {
                        userData = JSON.parse(currentUserData);
                        console.log('Dados do usuário carregados do localStorage:', userData);
                        
                        // Verificar se há foto de perfil no localStorage
                        if (userData.profilePhoto) {
                            console.log('Foto de perfil encontrada no localStorage, tamanho:', 
                                Math.round(userData.profilePhoto.length / 1024), 'KB');
                        } else {
                            console.log('Nenhuma foto de perfil encontrada no localStorage');
                        }
                    } catch (e) {
                        console.error('Erro ao processar dados do localStorage:', e);
                    }
                } else {
                    console.log('Nenhum dado de usuário encontrado no localStorage');
                }
            }
            
            // Se encontrou dados do usuário, preencher o formulário
            if (userData) {
                this.fillProfileForm(userData);
            } else {
                console.error('Não foi possível carregar os dados do usuário');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
    
    // Preencher formulário com dados do usuário
    fillProfileForm(userData) {
        console.log('Preenchendo formulário com dados do usuário:', userData);
        
        // Informações básicas
        let displayName = userData.email;
        let role = 'Usuário';
        
        // Verificar se temos informações pessoais
        if (userData.personalInfo) {
            // Nome completo
            if (userData.personalInfo.firstname && userData.personalInfo.lastname) {
                displayName = `${userData.personalInfo.firstname} ${userData.personalInfo.lastname}`;
                this.profileFirstname.value = userData.personalInfo.firstname;
                this.profileLastname.value = userData.personalInfo.lastname;
            } else if (userData.personalInfo.fullname) {
                displayName = userData.personalInfo.fullname;
                // Tentar dividir o nome completo em nome e sobrenome
                const nameParts = userData.personalInfo.fullname.split(' ');
                if (nameParts.length > 1) {
                    this.profileFirstname.value = nameParts[0];
                    this.profileLastname.value = nameParts.slice(1).join(' ');
                } else {
                    this.profileFirstname.value = userData.personalInfo.fullname;
                }
            }
            
            // Nome de usuário
            if (userData.personalInfo.username) {
                this.profileUsername.value = userData.personalInfo.username;
            }
            
            // Telefone
            if (userData.personalInfo.phone) {
                this.profilePhone.value = userData.personalInfo.phone;
            }
            
            console.log('Dados pessoais preenchidos com sucesso');
        } else {
            console.log('Nenhuma informação pessoal encontrada');
        }
        
        // Verificar informações profissionais
        if (userData.professionalInfo && userData.professionalInfo.role) {
            role = this.formatRole(userData.professionalInfo.role);
        }
        
        // Verificar informações de endereço
        if (userData.addressInfo) {
            this.profileCep.value = userData.addressInfo.cep || '';
            this.profileStreet.value = userData.addressInfo.street || '';
            this.profileNumber.value = userData.addressInfo.number || '';
            this.profileComplement.value = userData.addressInfo.complement || '';
            this.profileNeighborhood.value = userData.addressInfo.neighborhood || '';
            this.profileCity.value = userData.addressInfo.city || '';
            this.profileState.value = userData.addressInfo.state || '';
        }
        
        // Verificar foto de perfil
        if (userData.profilePhoto && userData.profilePhoto !== 'undefined' && userData.profilePhoto !== 'null') {
            console.log('Carregando foto de perfil do usuário, tamanho:', Math.round(userData.profilePhoto.length / 1024), 'KB');
            this.userPhoto.src = userData.profilePhoto;
            
            // Armazenar a foto para uso posterior
            this.tempPhotoData = userData.profilePhoto;
        } else {
            console.log('Usando imagem de perfil padrão');
            this.userPhoto.src = defaultProfileImage;
        }
        
        // Atualizar informações de exibição
        this.profileName.textContent = displayName;
        this.profileEmail.textContent = userData.email;
        this.profileRole.textContent = role;
    }
    
    // Formatar nome do cargo
    formatRole(role) {
        const roles = {
            'diretor': 'Diretor',
            'rh': 'Recursos Humanos',
            'gerente': 'Gerente',
            'funcionario': 'Funcionário',
            'user': 'Usuário'
        };
        
        return roles[role.toLowerCase()] || role;
    }
    
    // Lidar com upload de foto
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida.');
            return;
        }
        
        // Verificar tamanho (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Exibir a imagem
            this.userPhoto.src = e.target.result;
            console.log('Foto carregada com sucesso, tamanho:', Math.round(e.target.result.length / 1024), 'KB');
            
            // Armazenar temporariamente a foto para uso posterior
            this.tempPhotoData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Salvar alterações do perfil
    async saveProfileChanges() {
        try {
            // Mostrar indicador de carregamento
            const originalButtonText = this.saveProfileBtn.innerHTML;
            this.saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            this.saveProfileBtn.disabled = true;
            
            // Verificar se a foto foi alterada
            let photoSrc = this.tempPhotoData || this.userPhoto.src;
            
            // Garantir que a foto não seja undefined ou null
            if (!photoSrc || photoSrc === 'undefined' || photoSrc === 'null') {
                photoSrc = defaultProfileImage;
                console.log('Usando imagem padrão para foto de perfil');
            } else {
                console.log('Salvando foto de perfil personalizada, tamanho:', Math.round(photoSrc.length / 1024), 'KB');
            }
            
            // Validar campos obrigatórios
            if (!this.profileFirstname.value.trim() || !this.profileLastname.value.trim()) {
                this.saveProfileBtn.innerHTML = originalButtonText;
                this.saveProfileBtn.disabled = false;
                alert('Nome e sobrenome são campos obrigatórios.');
                return;
            }
            
            // Validar telefone (formato básico)
            const phoneRegex = /^\(?[0-9]{2}\)? ?[0-9]{4,5}-?[0-9]{4}$/;
            if (this.profilePhone.value.trim() && !phoneRegex.test(this.profilePhone.value.trim())) {
                this.saveProfileBtn.innerHTML = originalButtonText;
                this.saveProfileBtn.disabled = false;
                alert('Formato de telefone inválido. Use o formato (XX) XXXXX-XXXX.');
                return;
            }
            
            // Obter dados do formulário
            const updatedData = {
                personalInfo: {
                    firstname: this.profileFirstname.value.trim(),
                    lastname: this.profileLastname.value.trim(),
                    username: this.profileUsername.value.trim(),
                    phone: this.profilePhone.value.trim()
                },
                addressInfo: {
                    cep: this.profileCep.value.trim(),
                    street: this.profileStreet.value.trim(),
                    number: this.profileNumber.value.trim(),
                    complement: this.profileComplement.value.trim(),
                    neighborhood: this.profileNeighborhood.value.trim(),
                    city: this.profileCity.value.trim(),
                    state: this.profileState.value.trim()
                },
                profilePhoto: photoSrc
            };
            
            console.log('Dados atualizados para salvar:', updatedData);
            
            // Variáveis para controle
            let userId = null;
            let success = false;
            
            // Tentar salvar no Firebase primeiro
            if (window.firebaseAuth && window.firebaseDB) {
                console.log('Firebase disponível, tentando salvar...');
                
                // Obter ID do usuário de várias fontes possíveis
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    userId = currentUser.uid;
                    console.log('ID do usuário obtido do Firebase Auth:', userId);
                } else {
                    // Tentar obter do localStorage como fallback
                    const localUserData = localStorage.getItem('currentUser');
                    if (localUserData) {
                        try {
                            const parsedUser = JSON.parse(localUserData);
                            if (parsedUser && parsedUser.uid) {
                                userId = parsedUser.uid;
                                console.log('ID do usuário obtido do localStorage:', userId);
                            }
                        } catch (e) {
                            console.error('Erro ao analisar dados do usuário do localStorage:', e);
                        }
                    }
                }
                
                console.log('ID do usuário final para atualização:', userId);
                
                if (!userId) {
                    console.error('Não foi possível obter o ID do usuário');
                    this.saveProfileBtn.innerHTML = originalButtonText;
                    this.saveProfileBtn.disabled = false;
                    alert('Não foi possível identificar seu usuário. Tente fazer login novamente.');
                    return;
                }
                
                // Obter dados atuais do usuário
                console.log('Buscando dados atuais do usuário com ID:', userId);
                const result = await window.firebaseDB.getUser(userId);
                
                if (result.success) {
                    // Mesclar dados existentes com atualizações
                    const existingData = result.user;
                    console.log('Dados existentes:', existingData);
                    
                    // Garantir que as estruturas existam
                    if (!existingData.personalInfo) existingData.personalInfo = {};
                    if (!existingData.addressInfo) existingData.addressInfo = {};
                    
                    const mergedData = {
                        ...existingData,
                        personalInfo: {
                            ...existingData.personalInfo,
                            ...updatedData.personalInfo
                        },
                        addressInfo: {
                            ...existingData.addressInfo,
                            ...updatedData.addressInfo
                        },
                        profilePhoto: updatedData.profilePhoto
                    };
                    
                    console.log('Dados mesclados para salvar:', mergedData);
                    
                    try {
                        // Atualizar no Firebase
                        console.log('Enviando atualização para o Firebase...');
                        const updateResult = await window.firebaseDB.updateUser(userId, mergedData);
                        success = updateResult.success;
                        
                        if (success) {
                            console.log('Perfil atualizado com sucesso no Firebase');
                            
                            // Atualizar também no localStorage para manter consistência
                            localStorage.setItem('currentUser', JSON.stringify({
                                uid: userId,
                                ...mergedData
                            }));
                            console.log('LocalStorage atualizado após sucesso no Firebase');
                        } else {
                            console.error('Erro ao atualizar perfil no Firebase:', updateResult.error);
                        }
                    } catch (updateError) {
                        console.error('Erro durante a atualização do perfil:', updateError);
                    }
                } else {
                    console.error('Erro ao obter dados do usuário do Firebase:', result.error);
                }
            } else {
                console.warn('Firebase não disponível, usando apenas localStorage');
            }
            
            // Fallback para localStorage
            if (!success) {
                console.log('Tentando salvar no localStorage...');
                const currentUserData = localStorage.getItem('currentUser');
                if (currentUserData) {
                    try {
                        const userData = JSON.parse(currentUserData);
                        console.log('Dados existentes no localStorage:', userData);
                        
                        // Mesclar dados existentes com atualizações
                        const mergedData = {
                            ...userData,
                            personalInfo: {
                                ...userData.personalInfo || {},
                                ...updatedData.personalInfo
                            },
                            addressInfo: {
                                ...userData.addressInfo || {},
                                ...updatedData.addressInfo
                            },
                            profilePhoto: updatedData.profilePhoto
                        };
                        
                        console.log('Dados mesclados para salvar no localStorage:', mergedData);
                        
                        // Atualizar no localStorage
                        localStorage.setItem('currentUser', JSON.stringify(mergedData));
                        console.log('Perfil atualizado com sucesso no localStorage');
                        success = true;
                    } catch (parseError) {
                        console.error('Erro ao processar dados do localStorage:', parseError);
                    }
                } else {
                    console.error('Nenhum dado de usuário encontrado no localStorage');
                }
            }
            
            // Restaurar botão
            this.saveProfileBtn.innerHTML = originalButtonText;
            this.saveProfileBtn.disabled = false;
            
            if (success) {
                // Atualizar exibição
                const displayName = `${updatedData.personalInfo.firstname} ${updatedData.personalInfo.lastname}`;
                this.profileName.textContent = displayName;
                console.log('Nome de exibição atualizado para:', displayName);
                
                // Atualizar nome no cabeçalho do menu
                const userEmailElement = document.getElementById('user-email');
                if (userEmailElement) {
                    userEmailElement.textContent = displayName;
                    console.log('Nome atualizado no cabeçalho do menu');
                }
                
                // Atualizar foto de perfil em outros elementos da página
                const profileImages = document.querySelectorAll('.profile-image, #profile-image');
                if (profileImages.length > 0) {
                    profileImages.forEach(img => {
                        img.src = updatedData.profilePhoto;
                        console.log('Foto de perfil atualizada em elemento da página');
                    });
                }
                
                // Exibir mensagem de sucesso
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Perfil atualizado com sucesso!';
                successMessage.style.position = 'fixed';
                successMessage.style.top = '20px';
                successMessage.style.right = '20px';
                successMessage.style.padding = '10px 20px';
                successMessage.style.backgroundColor = '#4CAF50';
                successMessage.style.color = 'white';
                successMessage.style.borderRadius = '4px';
                successMessage.style.zIndex = '9999';
                document.body.appendChild(successMessage);
                
                // Remover mensagem após 3 segundos
                setTimeout(() => {
                    document.body.removeChild(successMessage);
                }, 3000);
                
                // Forçar atualização do localStorage para garantir persistência
                const currentUserData = localStorage.getItem('currentUser');
                if (currentUserData) {
                    try {
                        const userData = JSON.parse(currentUserData);
                        userData.profilePhoto = updatedData.profilePhoto;
                        userData.personalInfo = { ...userData.personalInfo, ...updatedData.personalInfo };
                        userData.addressInfo = { ...userData.addressInfo, ...updatedData.addressInfo };
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                        console.log('LocalStorage atualizado com sucesso após salvar perfil');
                    } catch (e) {
                        console.error('Erro ao atualizar localStorage após salvar perfil:', e);
                    }
                }
            } else {
                alert('Não foi possível atualizar o perfil. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao salvar alterações do perfil:', error);
            this.saveProfileBtn.innerHTML = originalButtonText;
            this.saveProfileBtn.disabled = false;
            alert('Erro ao salvar alterações. Tente novamente.');
        }
    }
    
    // Iniciar processo de alteração de senha
    async initiatePasswordChange() {
        try {
            // Mostrar indicador de carregamento
            const originalButtonText = this.changePasswordBtn.innerHTML;
            this.changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            this.changePasswordBtn.disabled = true;
            
            let userEmail = '';
            
            // Obter email do usuário
            if (window.firebaseAuth) {
                const currentUser = window.firebaseAuth.getCurrentUser();
                if (currentUser) {
                    userEmail = currentUser.email;
                    console.log('Email do usuário obtido do Firebase Auth:', userEmail);
                }
            }
            
            if (!userEmail) {
                userEmail = localStorage.getItem('userEmail');
                if (userEmail) {
                    console.log('Email do usuário obtido do localStorage:', userEmail);
                }
            }
            
            if (!userEmail) {
                this.changePasswordBtn.innerHTML = originalButtonText;
                this.changePasswordBtn.disabled = false;
                alert('Não foi possível identificar seu email. Tente fazer login novamente.');
                return;
            }
            
            // Enviar email de recuperação de senha
            if (window.firebaseAuth) {
                try {
                    console.log('Tentando enviar email de recuperação via Firebase para:', userEmail);
                    await window.firebaseAuth.resetPassword(userEmail);
                    this.changePasswordBtn.innerHTML = originalButtonText;
                    this.changePasswordBtn.disabled = false;
                    alert(`Um email de recuperação de senha foi enviado para ${userEmail}. Verifique sua caixa de entrada.`);
                    return;
                } catch (error) {
                    console.error('Erro ao enviar email de recuperação via Firebase:', error);
                    // Continuar com método alternativo
                }
            }
            
            // Método alternativo (usando EmailJS ou outro método implementado)
            if (window.LoginForm && window.LoginForm.prototype.sendVerificationCode) {
                console.log('Tentando enviar email de recuperação via método alternativo para:', userEmail);
                const loginForm = new LoginForm();
                loginForm.recoveryEmail = userEmail;
                loginForm.sendVerificationCode();
                this.changePasswordBtn.innerHTML = originalButtonText;
                this.changePasswordBtn.disabled = false;
            } else {
                console.error('Nenhum método de recuperação de senha disponível');
                this.changePasswordBtn.innerHTML = originalButtonText;
                this.changePasswordBtn.disabled = false;
                alert(`Não foi possível enviar o email de recuperação. Entre em contato com o administrador do sistema.`);
            }
        } catch (error) {
            console.error('Erro ao iniciar processo de alteração de senha:', error);
            this.changePasswordBtn.innerHTML = '<i class="fas fa-key"></i> Alterar Senha';
            this.changePasswordBtn.disabled = false;
            alert('Erro ao processar solicitação. Tente novamente.');
        }
    }
    
    // Formatar CEP
    formatCEP(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        input.value = value.substring(0, 9);
    }
    
    // Formatar telefone
    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '(' + value;
            if (value.length > 3) {
                value = value.substring(0, 3) + ') ' + value.substring(3);
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10);
            }
        }
        input.value = value.substring(0, 16);
    }
    
    // Buscar endereço pelo CEP
    async fetchAddressByCep() {
        const cep = this.profileCep.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            return;
        }
        
        try {
            // Adicionar classe de carregamento aos campos
            this.profileStreet.classList.add('loading');
            this.profileNeighborhood.classList.add('loading');
            this.profileCity.classList.add('loading');
            this.profileState.classList.add('loading');
            
            // Mostrar indicador de carregamento
            this.profileStreet.value = 'Carregando...';
            this.profileNeighborhood.value = 'Carregando...';
            this.profileCity.value = 'Carregando...';
            this.profileState.value = 'Carregando...';
            
            // Buscar CEP na API dos Correios (ViaCEP)
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            console.log('Dados do CEP:', data);
            
            if (data.erro) {
                console.error('CEP não encontrado');
                alert('CEP não encontrado');
                this.profileStreet.value = '';
                this.profileNeighborhood.value = '';
                this.profileCity.value = '';
                this.profileState.value = '';
                return;
            }
            
            // Preencher campos de endereço
            this.profileStreet.value = data.logradouro || '';
            this.profileNeighborhood.value = data.bairro || '';
            this.profileCity.value = data.localidade || '';
            this.profileState.value = data.uf || '';
            
            // Focar no campo de número se a rua foi preenchida
            if (data.logradouro) {
                this.profileNumber.focus();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP. Tente novamente.');
            
            this.profileStreet.value = '';
            this.profileNeighborhood.value = '';
            this.profileCity.value = '';
            this.profileState.value = '';
        } finally {
            // Remover classe de carregamento dos campos
            this.profileStreet.classList.remove('loading');
            this.profileNeighborhood.classList.remove('loading');
            this.profileCity.classList.remove('loading');
            this.profileState.classList.remove('loading');
        }
    }
}

// Inicializar o perfil quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new UserProfile();
});
