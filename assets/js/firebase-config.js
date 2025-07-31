// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqBSpnNAnCNpXhJbrE_7LpouzfXiSkxTQ",
  authDomain: "sistemascontrole.firebaseapp.com",
  projectId: "sistemascontrole",
  storageBucket: "sistemascontrole.firebasestorage.app",
  databaseURL: "https://sistemascontrole-default-rtdb.firebaseio.com",
  messagingSenderId: "759682576010",
  appId: "1:759682576010:web:b5a81bf0626555d4904773",
  measurementId: "G-DZF8ZM9M8E"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências para serviços do Firebase
const auth = firebase.auth();
const database = firebase.database();

// Funções de autenticação
const firebaseAuth = {
  // Registrar um novo usuário
  registerUser: async (email, password, userData) => {
    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Salvar dados adicionais do usuário no Realtime Database
      await database.ref('users/' + user.uid).set({
        email: email,
        ...userData,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true, user };
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Buscar usuário por nome de usuário
  getUserByUsername: async (username) => {
    try {
      // Buscar no Realtime Database todos os usuários
      const snapshot = await database.ref('users').once('value');
      const users = snapshot.val();
      
      // Procurar por um usuário com o nome de usuário fornecido
      if (users) {
        for (const userId in users) {
          const userData = users[userId];
          if (userData.personalInfo && userData.personalInfo.username && 
              userData.personalInfo.username.toLowerCase() === username.toLowerCase()) {
            return { success: true, userId, email: userData.email };
          }
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      console.error("Erro ao buscar usuário por nome de usuário:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Fazer login (com email ou nome de usuário)
  loginUser: async (emailOrUsername, password) => {
    try {
      let email = emailOrUsername;
      
      // Verificar se o input é um email ou nome de usuário
      if (!emailOrUsername.includes('@')) {
        // É um nome de usuário, buscar o email correspondente
        const userResult = await firebaseAuth.getUserByUsername(emailOrUsername);
        if (!userResult.success) {
          return { success: false, error: 'Nome de usuário não encontrado' };
        }
        email = userResult.email;
      }
      
      // Fazer login com o email
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Obter dados adicionais do usuário do Realtime Database
      const snapshot = await database.ref('users/' + user.uid).once('value');
      const userData = snapshot.val();
      
      // Verificar e garantir que a foto de perfil seja carregada corretamente
      if (userData && userData.profilePhoto && userData.profilePhoto !== 'undefined' && userData.profilePhoto !== 'null') {
        console.log('Foto de perfil encontrada no Firebase, tamanho:', Math.round(userData.profilePhoto.length / 1024), 'KB');
      } else {
        console.log('Nenhuma foto de perfil válida encontrada no Firebase');
        
        // Definir foto padrão se não houver foto válida
        userData.profilePhoto = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjYWM1OGFhIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMTQsMjE0SDQyYzAtNDYsNDAtNzAsODYtNzBzODYsMjQsODYsNzBaIi8+PC9zdmc+';        
      }
      
      // Salvar informações do usuário no localStorage para persistência da sessão
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: email,
        ...userData
      }));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Fazer logout
  logoutUser: async () => {
    try {
      await auth.signOut();
      
      // Limpar dados de autenticação do localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('currentUser');
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Recuperar senha
  resetPassword: async (email) => {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Verificar estado de autenticação
  checkAuthState: (callback) => {
    return auth.onAuthStateChanged(callback);
  },
  
  // Obter usuário atual
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  // Verificar se um email existe no Firebase Authentication
  checkEmailExists: async (email) => {
    try {
      // Usar o método fetchSignInMethodsForEmail para verificar se o email existe
      const signInMethods = await auth.fetchSignInMethodsForEmail(email);
      
      // Se o array de métodos de login não estiver vazio, o email existe
      return { success: true, exists: signInMethods.length > 0 };
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return { success: false, error: error.message };
    }
  }
};

// Funções de banco de dados
const firebaseDB = {
  // FUNÇÕES PARA PRODUTOS
  
  // Salvar um produto para um usuário específico
  saveProduct: async (userId, product) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para saveProduct');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      // Se o produto não tiver ID, gerar um novo
      if (!product.id) {
        product.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
      
      // Salvar o produto no nó do usuário
      await database.ref(`users/${userId}/produtos/${product.id}`).set({
        ...product,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true, productId: product.id };
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Obter todos os produtos de um usuário
  getUserProducts: async (userId) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para getUserProducts');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      const snapshot = await database.ref(`users/${userId}/produtos`).once('value');
      const products = snapshot.val() || {};
      
      // Converter objeto em array
      const productsArray = Object.keys(products).map(key => ({
        id: key,
        ...products[key]
      }));
      
      return { success: true, products: productsArray };
    } catch (error) {
      console.error('Erro ao obter produtos do usuário:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Atualizar um produto específico
  updateProduct: async (userId, productId, productData) => {
    try {
      if (!userId || !productId) {
        console.error('ID de usuário ou produto não fornecido para updateProduct');
        return { success: false, error: 'ID de usuário ou produto não fornecido' };
      }
      
      await database.ref(`users/${userId}/produtos/${productId}`).update({
        ...productData,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Excluir um produto
  deleteProduct: async (userId, productId) => {
    try {
      if (!userId || !productId) {
        console.error('ID de usuário ou produto não fornecido para deleteProduct');
        return { success: false, error: 'ID de usuário ou produto não fornecido' };
      }
      
      await database.ref(`users/${userId}/produtos/${productId}`).remove();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return { success: false, error: error.message };
    }
  },
  
  // FUNÇÕES PARA TRANSAÇÕES
  
  // Salvar uma transação para um usuário específico
  saveTransaction: async (userId, transaction) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para saveTransaction');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      // Se a transação não tiver ID, gerar um novo
      if (!transaction.id) {
        transaction.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
      
      // Salvar a transação no nó do usuário
      await database.ref(`users/${userId}/transacoes/${transaction.id}`).set({
        ...transaction,
        createdAt: transaction.createdAt || firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true, transactionId: transaction.id };
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Obter todas as transações de um usuário
  getUserTransactions: async (userId) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para getUserTransactions');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      const snapshot = await database.ref(`users/${userId}/transacoes`).once('value');
      const transactions = snapshot.val() || {};
      
      // Converter objeto em array
      const transactionsArray = Object.keys(transactions).map(key => ({
        id: key,
        ...transactions[key]
      }));
      
      return { success: true, transactions: transactionsArray };
    } catch (error) {
      console.error('Erro ao obter transações do usuário:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Atualizar uma transação específica
  updateTransaction: async (userId, transactionId, transactionData) => {
    try {
      if (!userId || !transactionId) {
        console.error('ID de usuário ou transação não fornecido para updateTransaction');
        return { success: false, error: 'ID de usuário ou transação não fornecido' };
      }
      
      await database.ref(`users/${userId}/transacoes/${transactionId}`).update({
        ...transactionData,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Excluir uma transação
  deleteTransaction: async (userId, transactionId) => {
    try {
      if (!userId || !transactionId) {
        console.error('ID de usuário ou transação não fornecido para deleteTransaction');
        return { success: false, error: 'ID de usuário ou transação não fornecido' };
      }
      
      await database.ref(`users/${userId}/transacoes/${transactionId}`).remove();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return { success: false, error: error.message };
    }
  },
  
  // FUNÇÕES PARA GASTOS FIXOS
  
  // Salvar um gasto fixo para um usuário específico
  saveFixedExpense: async (userId, expense) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para saveFixedExpense');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      // Se o gasto não tiver ID, gerar um novo
      if (!expense.id) {
        expense.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
      
      // Salvar o gasto fixo no nó do usuário
      await database.ref(`users/${userId}/gastosFixos/${expense.id}`).set({
        ...expense,
        createdAt: expense.createdAt || firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true, expenseId: expense.id };
    } catch (error) {
      console.error('Erro ao salvar gasto fixo:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Obter todos os gastos fixos de um usuário
  getUserFixedExpenses: async (userId) => {
    try {
      if (!userId) {
        console.error('ID de usuário não fornecido para getUserFixedExpenses');
        return { success: false, error: 'ID de usuário não fornecido' };
      }
      
      const snapshot = await database.ref(`users/${userId}/gastosFixos`).once('value');
      const expenses = snapshot.val() || {};
      
      // Converter objeto em array
      const expensesArray = Object.keys(expenses).map(key => ({
        id: key,
        ...expenses[key]
      }));
      
      return { success: true, expenses: expensesArray };
    } catch (error) {
      console.error('Erro ao obter gastos fixos do usuário:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Atualizar um gasto fixo específico
  updateFixedExpense: async (userId, expenseId, expenseData) => {
    try {
      if (!userId || !expenseId) {
        console.error('ID de usuário ou gasto fixo não fornecido para updateFixedExpense');
        return { success: false, error: 'ID de usuário ou gasto fixo não fornecido' };
      }
      
      await database.ref(`users/${userId}/gastosFixos/${expenseId}`).update({
        ...expenseData,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Excluir um gasto fixo
  deleteFixedExpense: async (userId, expenseId) => {
    try {
      if (!userId || !expenseId) {
        console.error('ID de usuário ou gasto fixo não fornecido para deleteFixedExpense');
        return { success: false, error: 'ID de usuário ou gasto fixo não fornecido' };
      }
      
      await database.ref(`users/${userId}/gastosFixos/${expenseId}`).remove();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir gasto fixo:', error);
      return { success: false, error: error.message };
    }
  },
  // Obter todos os usuários
  getAllUsers: async () => {
    try {
      console.log('Carregando todos os usuários do Firebase...');
      const snapshot = await database.ref('users').once('value');
      const usersData = snapshot.val();
      const users = [];
      
      // Converter objeto em array
      if (usersData) {
        Object.keys(usersData).forEach(key => {
          // Garantir que o ID do usuário esteja correto
          const userData = {
            uid: key,
            ...usersData[key]
          };
          
          // Garantir que as estruturas de dados estejam presentes
          if (!userData.personalInfo) userData.personalInfo = {};
          if (!userData.contactInfo) userData.contactInfo = {};
          if (!userData.addressInfo) userData.addressInfo = {};
          if (!userData.professionalInfo) userData.professionalInfo = {};
          
          users.push(userData);
        });
        console.log(`${users.length} usuários encontrados`);
      } else {
        console.log('Nenhum usuário encontrado no banco de dados');
      }
      
      return { success: true, users };
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Obter um usuário específico
  getUser: async (userId) => {
    try {
      const snapshot = await database.ref('users/' + userId).once('value');
      const userData = snapshot.val();
      
      if (userData) {
        return { success: true, user: { id: userId, ...userData } };
      } else {
        return { success: false, error: "Usuário não encontrado" };
      }
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Atualizar dados de um usuário
  updateUser: async (userId, userData) => {
    try {
      console.log('Iniciando atualização do usuário com ID:', userId);
      console.log('Dados recebidos para atualização:', userData);
      
      // Verificar se o ID do usuário é válido
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('ID do usuário inválido:', userId);
        return { success: false, error: "ID de usuário inválido" };
      }
      
      // Verificar se o usuário existe
      const snapshot = await database.ref('users/' + userId).once('value');
      if (!snapshot.exists()) {
        console.error('Usuário não encontrado no banco de dados:', userId);
        return { success: false, error: "Usuário não encontrado" };
      }
      
      // Obter dados atuais do usuário
      const existingData = snapshot.val();
      console.log('Dados atuais do usuário:', existingData);
      
      // Remover campos que não devem ser atualizados
      const { id, createdAt, ...updateData } = userData;
      
      // Verificar se há foto de perfil para salvar
      if (updateData.profilePhoto) {
        console.log('Salvando foto de perfil para o usuário:', userId);
        // Verificar se a foto é válida
        if (updateData.profilePhoto === 'undefined' || updateData.profilePhoto === 'null' || !updateData.profilePhoto) {
          console.warn('Foto de perfil inválida detectada, usando imagem padrão');
          // Usar imagem padrão se a foto for inválida
          updateData.profilePhoto = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCBmaWxsPSIjYWM1OGFhIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjEyOCIgY3k9IjkwIiByPSI0MCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMTQsMjE0SDQyYzAtNDYsNDAtNzAsODYtNzBzODYsMjQsODYsNzBaIi8+PC9zdmc+';
        } else {
          console.log('Foto de perfil válida detectada, tamanho aproximado:', Math.round(updateData.profilePhoto.length / 1024), 'KB');
          
          // Verificar se a foto é diferente da existente
          if (existingData.profilePhoto !== updateData.profilePhoto) {
            console.log('Foto de perfil foi alterada, atualizando...');
          } else {
            console.log('Foto de perfil não foi alterada');
          }
        }
      } else {
        console.warn('Nenhuma foto de perfil fornecida para o usuário:', userId);
        
        // Manter a foto existente se houver
        if (existingData.profilePhoto) {
          console.log('Mantendo foto de perfil existente');
          updateData.profilePhoto = existingData.profilePhoto;
        }
      }
      
      // Preparar dados para atualização, garantindo que as estruturas existam
      const updateObject = {
        ...updateData,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };
      
      // Garantir que as estruturas de dados sejam preservadas
      if (!updateObject.personalInfo && existingData.personalInfo) {
        updateObject.personalInfo = existingData.personalInfo;
      }
      
      if (!updateObject.addressInfo && existingData.addressInfo) {
        updateObject.addressInfo = existingData.addressInfo;
      }
      
      if (!updateObject.profilePhoto && existingData.profilePhoto) {
        updateObject.profilePhoto = existingData.profilePhoto;
      }
      
      console.log('Dados preparados para atualização:', updateObject);
      
      // Atualizar no Realtime Database
      console.log('Enviando atualização para o Firebase...');
      await database.ref('users/' + userId).update(updateObject);
      console.log('Atualização no Firebase concluída com sucesso');
      
      // Verificar se a atualização foi bem-sucedida
      const verifySnapshot = await database.ref('users/' + userId).once('value');
      const verifiedData = verifySnapshot.val();
      
      if (verifiedData) {
        console.log('Verificação após atualização:');
        
        // Verificar se a foto foi salva corretamente
        if (updateObject.profilePhoto && verifiedData.profilePhoto) {
          const photoSaved = updateObject.profilePhoto === verifiedData.profilePhoto;
          console.log('Foto de perfil salva corretamente?', photoSaved ? 'Sim' : 'Não');
          
          if (!photoSaved) {
            console.warn('A foto de perfil não foi salva corretamente. Tentando novamente...');
            // Tentar salvar apenas a foto novamente
            await database.ref('users/' + userId + '/profilePhoto').set(updateObject.profilePhoto);
            console.log('Segunda tentativa de salvar a foto concluída');
          }
        }
      } else {
        console.error('Falha ao verificar dados após atualização');
      }
      
      // Atualizar dados no localStorage também para manter consistência
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        try {
          const currentUser = JSON.parse(currentUserData);
          if (currentUser.uid === userId) {
            // Mesclar dados existentes com atualizações
            const updatedUser = { ...currentUser };
            
            // Atualizar dados pessoais
            if (updateObject.personalInfo) {
              updatedUser.personalInfo = {
                ...(updatedUser.personalInfo || {}),
                ...updateObject.personalInfo
              };
            }
            
            // Atualizar dados de endereço
            if (updateObject.addressInfo) {
              updatedUser.addressInfo = {
                ...(updatedUser.addressInfo || {}),
                ...updateObject.addressInfo
              };
            }
            
            // Atualizar foto de perfil
            if (updateObject.profilePhoto) {
              updatedUser.profilePhoto = updateObject.profilePhoto;
            }
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('Dados do usuário atualizados no localStorage');
          }
        } catch (e) {
          console.error('Erro ao atualizar dados no localStorage:', e);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Excluir um usuário
  deleteUser: async (userId) => {
    try {
      await database.ref('users/' + userId).remove();
      
      // Nota: Isso apenas exclui os dados do Realtime Database
      // Para excluir a conta de autenticação, é necessário usar auth.currentUser.delete()
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Adicionar usuários padrão ao Realtime Database (para inicialização)
  addDefaultUsers: async () => {
    try {
      // Adicionar o usuário específico solicitado
      await firebaseDB.addSpecificUser('victorjuanrazer@gmail.com', 'nina2004', 'Victor Juan', 'diretor');
      
      // Continuar com a adição dos usuários padrão
    } catch (error) {
      console.error('Erro ao adicionar usuário específico:', error);
    }
    
  },
  
  // Adicionar um usuário específico com cargo personalizado
  addSpecificUser: async (email, password, displayName, role = 'diretor') => {
    try {
      console.log(`Adicionando usuário específico: ${email}`);
      
      // Verificar se o usuário já existe no Firebase Auth
      const signInMethods = await auth.fetchSignInMethodsForEmail(email);
      
      if (signInMethods.length === 0) {
        // Usuário não existe, criar no Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        
        // Adicionar dados do usuário ao Realtime Database
        await database.ref('users/' + uid).set({
          email: email,
          displayName: displayName || email.split('@')[0],
          professionalInfo: { 
            role: role,
            department: 'Diretoria',
            hireDate: new Date().toISOString().split('T')[0]
          },
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log(`Usuário específico criado com sucesso: ${email}`);
        return { success: true, message: `Usuário ${email} criado com sucesso como ${role}!` };
      } else {
        // Usuário já existe, atualizar seu papel para diretor
        try {
          // Tentar fazer login para obter o UID
          const userCredential = await auth.signInWithEmailAndPassword(email, password);
          const uid = userCredential.user.uid;
          
          // Atualizar dados no Realtime Database
          await database.ref('users/' + uid).update({
            displayName: displayName || email.split('@')[0],
            'professionalInfo/role': role,
            'professionalInfo/department': 'Diretoria',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
          });
          
          // Fazer logout após a atualização
          await auth.signOut();
          
          console.log(`Papel do usuário ${email} atualizado para ${role}`);
          return { success: true, message: `Papel do usuário ${email} atualizado para ${role}!` };
        } catch (loginError) {
          console.error(`Erro ao fazer login com usuário existente ${email}:`, loginError);
          return { success: false, error: `Usuário existe, mas não foi possível atualizar: ${loginError.message}` };
        }
      }
    } catch (error) {
      console.error(`Erro ao adicionar usuário específico ${email}:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Verificar se já existem usuários padrão
  _checkDefaultUsers: async () => {
    try {
      const snapshot = await database.ref('users').orderByChild('isDefaultUser').equalTo(true).once('value');
      const defaultUsersData = snapshot.val();
      
      if (defaultUsersData && Object.keys(defaultUsersData).length > 0) {
        console.log("Usuários padrão já existem.");
        return { success: true };
      }
      
      // Usuários padrão
      const defaultUsers = [
        {
          email: 'admin@example.com',
          password: 'admin123', // Nota: Em produção, nunca armazene senhas em texto simples
          fullname: 'Administrador',
          professionalInfo: { role: 'diretor' },
          isDefaultUser: true
        },
        {
          email: 'user@example.com',
          password: 'user123',
          fullname: 'Usuário Padrão',
          professionalInfo: { role: 'analista' },
          isDefaultUser: true
        },
        {
          email: 'teste@teste.com',
          password: 'teste123',
          fullname: 'Usuário Teste',
          professionalInfo: { role: 'assistente' },
          isDefaultUser: true
        }
      ];
      
      // Criar usuários padrão no Firebase Authentication e Realtime Database
      for (const user of defaultUsers) {
        try {
          // Criar usuário no Authentication
          const userCredential = await auth.createUserWithEmailAndPassword(user.email, user.password);
          const uid = userCredential.user.uid;
          
          // Salvar dados no Realtime Database
          await database.ref('users/' + uid).set({
            email: user.email,
            fullname: user.fullname,
            professionalInfo: user.professionalInfo,
            isDefaultUser: true,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          });
          
          console.log(`Usuário padrão criado: ${user.email}`);
        } catch (error) {
          // Se o usuário já existe, apenas atualizar os dados no Realtime Database
          if (error.code === 'auth/email-already-in-use') {
            try {
              // Tentar fazer login para obter o UID
              const userCredential = await auth.signInWithEmailAndPassword(user.email, user.password);
              const uid = userCredential.user.uid;
              
              // Atualizar dados no Realtime Database
              await database.ref('users/' + uid).update({
                fullname: user.fullname,
                professionalInfo: user.professionalInfo,
                isDefaultUser: true,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
              });
              
              // Fazer logout após a atualização
              await auth.signOut();
              
              console.log(`Usuário padrão atualizado: ${user.email}`);
            } catch (loginError) {
              console.error(`Erro ao atualizar usuário padrão ${user.email}:`, loginError);
            }
          } else {
            console.error(`Erro ao criar usuário padrão ${user.email}:`, error);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao adicionar usuários padrão:", error);
      return { success: false, error: error.message };
    }
  }
};

// Exportar módulos
window.firebaseAuth = firebaseAuth;
window.firebaseDB = firebaseDB;
