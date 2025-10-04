# Cliqfy Backend

Backend da aplicação Cliqfy desenvolvido em Node.js com NestJS, TypeORM e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeORM** - ORM para TypeScript e JavaScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação com tokens
- **Bcrypt** - Hash de senhas
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 13+
- pnpm (gerenciador de pacotes)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd cliqfy-backend
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados PostgreSQL e atualize as variáveis no `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=cliqfy
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

5. Execute as migrations:
```bash
pnpm migration:run
```

## 🚀 Executando a aplicação

### Desenvolvimento
```bash
pnpm start:dev
```

### Produção
```bash
pnpm build
pnpm start:prod
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com cobertura
pnpm test:cov

# Executar testes em modo watch
pnpm test:watch
```

## 📊 Scripts disponíveis

- `pnpm start:dev` - Inicia em modo desenvolvimento
- `pnpm build` - Compila o projeto
- `pnpm start:prod` - Inicia em modo produção
- `pnpm test` - Executa testes
- `pnpm test:cov` - Executa testes com cobertura
- `pnpm migration:generate` - Gera nova migration
- `pnpm migration:run` - Executa migrations
- `pnpm migration:revert` - Reverte última migration

## 🏗️ Estrutura do projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Guards de autenticação
│   └── strategies/      # Estratégias JWT
├── users/               # Módulo de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── entities/
├── ordens/              # Módulo de ordens de serviço
│   ├── ordens.controller.ts
│   ├── ordens.service.ts
│   └── entities/
├── database/            # Configurações do banco
│   └── migrations/
├── common/              # Utilitários comuns
└── main.ts              # Ponto de entrada
```

## 🔐 Autenticação

A aplicação utiliza JWT para autenticação com refresh tokens:

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias, armazenado em HTTP-only cookies
- **Estratégia**: JWT Strategy para validação de tokens

### Endpoints de autenticação:
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout do usuário
- `GET /auth/me` - Obter dados do usuário logado

## 👥 Sistema de Roles

A aplicação implementa RBAC (Role-Based Access Control):

- **admin**: Acesso total ao sistema
- **agent**: Pode gerenciar ordens atribuídas
- **viewer**: Apenas visualização

## 📋 Ordens de Serviço

### Status disponíveis:
- `aberta` - Ordem criada, aguardando atribuição
- `em_andamento` - Ordem em execução
- `concluida` - Ordem finalizada
- `cancelada` - Ordem cancelada

### Endpoints principais:
- `GET /ordens` - Listar ordens (com filtros)
- `POST /ordens` - Criar nova ordem
- `GET /ordens/:id` - Obter ordem específica
- `PUT /ordens/:id` - Atualizar ordem
- `POST /ordens/:id/check-in` - Iniciar ordem (agent)
- `POST /ordens/:id/check-out` - Finalizar ordem (agent)
- `GET /ordens/reports/daily` - Relatórios diários

## 🐳 Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instalar pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start:prod"]
```

### Build e execução
```bash
# Build da imagem
docker build -t cliqfy-backend .

# Executar container
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=password \
  -e DB_DATABASE=cliqfy \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  cliqfy-backend
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - DB_DATABASE=cliqfy
      - JWT_SECRET=your-secret-key
      - JWT_REFRESH_SECRET=your-refresh-secret
    depends_on:
      - postgres
    volumes:
      - ./logs:/app/logs

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: cliqfy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Executar com Docker Compose
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## 📝 API Documentation

A documentação da API está disponível em `/api` quando a aplicação está rodando em modo desenvolvimento.

## 🔧 Configuração do banco

### Migrations
```bash
# Gerar nova migration
pnpm migration:generate -- -n NomeDaMigration

# Executar migrations
pnpm migration:run

# Reverter última migration
pnpm migration:revert
```

## 🚨 Troubleshooting

### Problemas comuns:

1. **Erro de conexão com banco**:
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env`

2. **Erro de migration**:
   - Verifique se o banco existe
   - Execute `pnpm migration:run`

3. **Erro de JWT**:
   - Verifique se as variáveis `JWT_SECRET` e `JWT_REFRESH_SECRET` estão definidas

## 🚧 Melhorias Futuras

### Funcionalidades Planejadas
- **Logs estruturados**: Implementar logging com Winston ou Pino
- **Rate limiting**: Proteção contra ataques de força bruta
- **Validação de entrada**: Sanitização e validação mais robusta
- **Cache**: Implementar Redis para cache de consultas frequentes
- **Websockets**: Notificações em tempo real para mudanças de status
- **Upload de arquivos**: Anexos nas ordens de serviço
- **Auditoria**: Log de todas as ações dos usuários
- **Backup automático**: Rotinas de backup do banco de dados

### Melhorias Técnicas
- **Testes de integração**: Cobertura completa com testes E2E
- **Monitoramento**: Health checks e métricas de performance
- **Documentação**: Swagger/OpenAPI mais detalhada
- **Segurança**: Implementar CORS, helmet, e outras medidas
- **Performance**: Otimização de queries e índices do banco
- **CI/CD**: Pipeline automatizado de deploy

### Arquitetura
- **Microserviços**: Separar módulos em serviços independentes
- **Message Queue**: Implementar RabbitMQ ou Apache Kafka
- **API Gateway**: Centralizar roteamento e autenticação
- **Service Discovery**: Consul ou Eureka para descoberta de serviços

## 📄 Licença

Este projeto está sob a licença MIT.