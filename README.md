# Pronto - Serviços Rápidos 

O **Pronto** é um aplicativo mobile que conecta clientes a profissionais de serviços sob demanda, de forma rápida e inteligente. Inspirado na experiência do Uber, o usuário escolhe o que precisa, confirma sua localização e um profissional qualificado é enviado até ele.

## O problema

Encontrar um profissional confiável para serviços do dia a dia (eletricista, encanador, cabeleireiro, mecânico) é demorado e desorganizado. O cliente precisa pedir indicações, ligar para vários números e negociar sem garantia de qualidade.

## A solução

O Pronto centraliza tudo em um app:

1. O cliente abre o app e confirma sua localização
2. Escolhe a categoria do serviço que precisa
3. Cria um pedido descrevendo o que precisa
4. Um profissional próximo aceita e vai até o cliente
5. O pagamento e avaliação são feitos pelo app

## Categorias de serviço

- **Emergência** - atendimento prioritário
- **Casa e manutenção** - Pintor, Pedreiro, Gesseiro, Vidraceiro, Jardinagem, Dedetização
- **Tecnologia** - Assistência celular, Conserto de computador, Instalação de internet
- **Beleza e bem-estar** - Manicure/Pedicure, Cabeleireiro, Maquiagem, Massagem
- **Aulas e educação** - Reforço escolar, Inglês particular, Música, Personal trainer
- **Automotivo** - Mecânico, Guincho, Lava-jato delivery, Troca de bateria
- **Eventos** - Fotógrafo, DJ, Buffet, Decoração

## Tecnologias

- **Mobile**: React Native + Expo (TypeScript)
- **Backend**: NestJS (TypeScript)
- **Banco de dados**: PostgreSQL + Prisma
- **Mapas**: react-native-maps + OpenStreetMap (Nominatim)

## Como inicializar

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente
- App **Expo Go** no celular (Android/iOS)

### 1. Clonar o repositório

```bash
git clone https://github.com/carlabraga1/Pronto-APP.git
cd Pronto-APP
```

### 2. Instalar dependências

```bash
npm install
cd mobile && npm install && cd ..
cd backend && npm install && cd ..
```

### 3. Configurar o banco de dados

Crie um arquivo `backend/.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pronto?schema=public"
```

Rode as migrações:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Iniciar o projeto

Em terminais separados:

```bash
# Terminal 1 - Mobile
npm run mobile

# Terminal 2 - Backend
npm run backend
```

Escaneie o QR code com o Expo Go para abrir o app no celular.
