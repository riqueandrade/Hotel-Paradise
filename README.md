# Sistema de Gestão Hoteleira

Sistema completo para gerenciamento de hotéis, incluindo controle de reservas, clientes, funcionários, estoque e pagamentos.

## Funcionalidades

### Gestão de Usuários e Funcionários
- Sistema de roles (admin, manager, receptionist, housekeeper, client)
- Integração automática entre usuários e funcionários
- Controle de acesso baseado em permissões
- Autenticação local e Google OAuth

### Gestão de Quartos
- Cadastro e gerenciamento de quartos
- Diferentes tipos (standard, luxo, suite)
- Controle de status (disponível, ocupado, manutenção)
- Dashboard com métricas de ocupação

### Gestão de Reservas
- Sistema completo de reservas
- Verificação de disponibilidade
- Integração com pagamentos
- Histórico de reservas

### Gestão de Clientes
- Cadastro completo de clientes
- Histórico de hospedagens
- Preferências e dados pessoais
- Integração com redes sociais

### Controle de Estoque
- Gestão de produtos e suprimentos
- Controle de entrada e saída
- Alertas de estoque baixo
- Relatórios de movimentação

### Sistema Financeiro
- Controle de receitas e despesas
- Relatórios financeiros
- Integração com Mercado Pago
- Dashboard financeiro

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- MySQL
- Passport.js (Autenticação)
- JWT (Tokens)
- Bcrypt (Criptografia)

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Toastify (Notificações)

### Integrações
- Google OAuth
- Mercado Pago
- APIs RESTful

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Configure o arquivo `.env`:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=hotel_db
    JWT_SECRET=seu_jwt_secret
    GOOGLE_CLIENT_ID=seu_google_client_id
    GOOGLE_CLIENT_SECRET=seu_google_client_secret
    ```
4. Execute o script SQL para criar o banco de dados:
    ```bash
    mysql -u root -p < database_setup.sql
    ```

5. Crie o usuário admin:
    ```bash
    npm run create-admin
    ```

6. Popule o banco com dados de teste:
    ```bash
    npm run seed
    ```

7. Inicie o servidor:
    ```bash
    npm run dev
    ```

## Estrutura do Projeto

```
sistema-hotelaria/
├── config/             # Configurações (banco de dados, auth)
├── controllers/        # Controladores da aplicação
├── middlewares/       # Middlewares (auth, logs)
├── models/            # Modelos de dados
├── public/            # Arquivos estáticos
│   ├── css/          # Estilos
│   ├── js/           # Scripts
│   ├── html/         # Páginas HTML
│   └── images/       # Imagens
├── routes/            # Rotas da API
├── scripts/          # Scripts utilitários
└── app.js            # Arquivo principal
```

## Funcionalidades por Tipo de Usuário

### Administrador
- Acesso total ao sistema
- Gerenciamento de usuários
- Relatórios gerenciais
- Configurações do sistema

### Gerente
- Gestão de funcionários
- Relatórios operacionais
- Gestão financeira
- Controle de estoque

### Recepcionista
- Gestão de reservas
- Atendimento ao cliente
- Check-in/Check-out
- Relatórios básicos

### Governança
- Status dos quartos
- Controle de limpeza
- Requisição de materiais
- Manutenções

### Cliente
- Fazer reservas
- Ver histórico
- Atualizar perfil
- Avaliar serviços

## Segurança

- Autenticação JWT
- Criptografia de senhas
- Controle de sessão
- Proteção contra XSS e CSRF
- Validação de dados

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Henrique de Andrade Reynaud - [WhatsApp](https://wa.me/5547988231069)

Link do Projeto: [https://github.com/seu-usuario/sistema-hotelaria](https://github.com/seu-usuario/sistema-hotelaria)
