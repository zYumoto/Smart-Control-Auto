# Sistema de Login e Cadastro Responsivo

## Descrição
Este projeto implementa telas de login e cadastro responsivas com validação em tempo real usando HTML, CSS e JavaScript (compilado de TypeScript).

## Funcionalidades
- Design responsivo para desktop e mobile
- Validação em tempo real para todos os campos
- Interface de usuário moderna e intuitiva
- Feedback visual para erros de validação
- Navegação entre telas de login e cadastro
- Recuperação de senha via email com código de verificação

## Requisitos de Validação
### Tela de Login
- E-mail: formato válido (exemplo@dominio.com)
- Senha: mínimo de 6 caracteres

### Tela de Cadastro
- Nome completo: obrigatório e deve conter nome e sobrenome
- E-mail: formato válido (exemplo@dominio.com)
- Senha: mínimo de 6 caracteres
- Confirmação de senha: deve ser idêntica à senha

## Como Usar
- Abra o arquivo `index.html` em qualquer navegador moderno para visualizar a tela de login.
- Abra o arquivo `cadastro.html` para visualizar a tela de cadastro.
- Você também pode navegar entre as telas usando os links disponíveis em cada página.

## Estrutura do Projeto

```
├── index.html              # Página de login
├── cadastro.html           # Página de cadastro
├── README.md               # Documentação do projeto
└── assets/                 # Pasta de recursos
    ├── css/                # Estilos CSS
    │   ├── styles.css      # Estilos da tela de login
    │   └── styles-cadastro.css  # Estilos da tela de cadastro
    ├── js/                 # JavaScript compilado
    │   ├── script.js       # Lógica da tela de login
    │   └── cadastro.js     # Lógica da tela de cadastro
    └── ts/                 # Código fonte TypeScript
        ├── script.ts       # Código fonte da tela de login
        ├── cadastro.ts     # Código fonte da tela de cadastro
        └── tsconfig.json   # Configuração do TypeScript
```

## Tecnologias Utilizadas
- HTML5
- CSS3
- TypeScript/JavaScript
- EmailJS (para envio de emails de recuperação de senha)

## Configuração do EmailJS para Recuperação de Senha

Para que o sistema de recuperação de senha funcione corretamente, é necessário configurar o serviço EmailJS seguindo os passos abaixo:

### 1. Criar uma conta no EmailJS

1. Acesse [EmailJS](https://www.emailjs.com/) e crie uma conta gratuita
2. Faça login na sua conta

### 2. Configurar um serviço de email

1. No painel do EmailJS, vá para "Email Services" e clique em "Add New Service"
2. Escolha seu provedor de email (Gmail, Outlook, etc.)
3. Siga as instruções para conectar sua conta de email
4. Dê um nome ao serviço (por exemplo, "default_service")

### 3. Criar um template de email

1. No painel do EmailJS, vá para "Email Templates" e clique em "Create New Template"
2. Dê um nome ao template (por exemplo, "template_recovery")
3. Configure o assunto do email: "Código de Verificação para Recuperação de Senha"
4. No corpo do email, adicione o seguinte conteúdo:

```html
<h2>Olá {{to_name}},</h2>
<p>Você solicitou a recuperação de senha para sua conta.</p>
<p>Seu código de verificação é: <strong>{{verification_code}}</strong></p>
<p>Este código é válido por 10 minutos.</p>
<p>Se você não solicitou esta recuperação de senha, ignore este email.</p>
<p>Atenciosamente,<br>Equipe de Suporte</p>
```

5. Salve o template

### 4. Obter as chaves de API

1. No painel do EmailJS, vá para "Integration" e copie seu "User ID"
2. Abra o arquivo `assets/js/script.js`
3. Substitua "YOUR_USER_ID" pelo ID copiado na função `initEmailJS()`

```javascript
initEmailJS() {
    // Inicializar EmailJS com seu User ID
    emailjs.init("seu_user_id_aqui");
}
```

4. Verifique se os nomes do serviço e do template no código correspondem aos que você criou:

```javascript
emailjs.send('default_service', 'template_recovery', templateParams)
```

### Observações

- A versão gratuita do EmailJS permite enviar até 200 emails por mês
- Para ambiente de desenvolvimento, o código de verificação também é mostrado em um alerta caso ocorra algum erro no envio do email
- Em um ambiente de produção, recomenda-se implementar medidas adicionais de segurança, como limitar tentativas de recuperação de senha e implementar captcha
