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
  
  // Fazer login
  loginUser: async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Obter dados adicionais do usuário do Realtime Database
      const snapshot = await database.ref('users/' + user.uid).once('value');
      const userData = snapshot.val();
      
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
  // Obter todos os usuários
  getAllUsers: async () => {
    try {
      const snapshot = await database.ref('users').once('value');
      const usersData = snapshot.val();
      const users = [];
      
      // Converter objeto em array
      if (usersData) {
        Object.keys(usersData).forEach(key => {
          users.push({
            id: key,
            ...usersData[key]
          });
        });
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
      // Remover campos que não devem ser atualizados
      const { id, createdAt, ...updateData } = userData;
      
      // Atualizar no Realtime Database
      await database.ref('users/' + userId).update({
        ...updateData,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
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
