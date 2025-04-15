# Chat Dashboard

Uma aplicação de chat em tempo real com recursos de visualização em dashboard. Desenvolvido a fins educacionais por: Rafael Gomez.

## Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **Next.js 15** - Framework React com renderização do lado do servidor e roteamento
- **React 19** - Biblioteca JavaScript para construção de interfaces de usuário
- **TypeScript** - Superconjunto tipado de JavaScript
- **Socket.io-client** - Comunicação bidirecional baseada em eventos em tempo real
- **Tailwind CSS 4** - Framework CSS utilitário
- **Highcharts** - Biblioteca de gráficos JavaScript interativos
- **Geist Font** - Tipografia moderna e minimalista da Vercel

## Estrutura do Projeto

- `/src/app` - Páginas do roteador de aplicativos Next.js
- `/src/components` - Componentes de UI reutilizáveis
- `/src/context` - Provedores de contexto React
- `/src/types` - Definições de tipos TypeScript

## Funcionalidades

- Mensagens de chat em tempo real
- Autenticação de usuários
- Histórico de mensagens
- Lista de usuários ativos
- Visualização da distribuição de mensagens com gráficos de pizza
- Design responsivo para desktop e mobile

### Pré-requisitos

- Node.js (v18 ou mais recente recomendado)
- Gerenciador de pacotes Yarn

### Instalação

1. Clone o repositório, link https:

```bash
git clone <https://github.com/rafagomes10/chat-frontend.git>
cd chatDashboard/FrontEnd/chat-dashboard
```
## Como Começar
1. Instale as dependências:
```bash
yarn install
```
2. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```
### Compilando para Produção
1. Para compilar o projeto para produção, execute:
```bash
yarn build
```
2. Em seguida, inicie o servidor de produção:
```bash
yarn start
```

Thanks for reading!