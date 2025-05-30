const express = require('express');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const cors = require('cors');
const { setupTicTacToe, handlePlayerDisconnect, activeGames, playersInGame } = require('./ticTacToe');
// Correct the import to use the proper function names
const { setupUnoEvents, unoRooms, connectedUsers: unoConnectedUsers } = require('./unoGame');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    //origin: "https://chatfrontend-rg.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Habilitar CORS para todas as rotas
app.use(cors());

// Rota básica para teste
app.get('/', (req, res) => {
  res.send(`
    API do Chat está funcionando!<br>
    Desenvolvido por: Rafael Gomez!<br>
    Version: 1.2.2<br>
    New features:<br>
    - Game TicTacToe!<br>
    - Auto-Ping<br>
    - No duplicate login!<br>
    - New autoPing teste!
  `);
});

// Rota para ping (manter servidor ativo)
app.get('/ping', (req, res) => {
  console.log('Servidor pingado em:', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  res.status(200).send('pong');
});

// Definir a porta antes de usar na função
const PORT = process.env.PORT || 4000;

// Função para manter o servidor ativo no Render.com
function manterServidorAtivo() {
  // Só executar o auto-ping em produção
  if (process.env.NODE_ENV === 'production') {
    const intervalo = 13 * 60 * 1000;
    const pingURL = process.env.APP_URL || 'https://chat-backend-6r2a.onrender.com/ping';

    setInterval(() => {
      console.log('Iniciando auto-ping em:', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

      // Usando o módulo https nativo do Node.js
      https.get(pingURL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('Auto-ping realizado com sucesso:', data);
        });
      }).on('error', (err) => {
        console.error('Erro no auto-ping:', err);
        // Tentar novamente após 1 minuto em caso de falha
        setTimeout(() => {
          console.log('Tentando auto-ping novamente após falha...');
          https.get(pingURL).on('error', (e) => console.error('Falha na nova tentativa:', e));
        }, 60000);
      });
    }, intervalo);
    console.log('Auto-ping configurado para ambiente de produção');
  } else {
    console.log('Auto-ping não é necessário em ambiente de desenvolvimento local');
  }
}

// Lista de usuários conectados
const connectedUsers = new Map();
// Lista de mensagens (para manter histórico temporário)
const messages = [];

function getHorarioBrasilia() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Configuração do Socket.io
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  // Quando um usuário se conecta
  socket.on('user-join', (username) => {
    // Verificar se o nome de usuário já está em uso
    const isUsernameTaken = Array.from(connectedUsers.values()).includes(username);

    if (isUsernameTaken) {
      // Enviar mensagem de erro para o cliente
      socket.emit('login-error', 'Este nome de usuário já está em uso. Por favor, escolha outro nome.');
      return;
    }

    // Armazenar o nome do usuário
    connectedUsers.set(socket.id, username);

    // Mensagem de boas-vindas
    const welcomeMessage = {
      user: 'Sistema',
      text: `Bem-vindo ao chat, ${username}!`,
      time: getHorarioBrasilia()
    };

    // Adicionar à lista de mensagens
    messages.push(welcomeMessage);

    // Enviar mensagem de boas-vindas
    socket.emit('message', welcomeMessage);

    // Informar ao cliente que o login foi bem-sucedido
    socket.emit('login-success');

    // Enviar histórico de mensagens para o novo usuário
    socket.emit('message-history', messages);

    // Notificar outros usuários
    const joinMessage = {
      user: 'Sistema',
      text: `${username} entrou no chat`,
      time: getHorarioBrasilia()
    };

    messages.push(joinMessage);
    socket.broadcast.emit('message', joinMessage);

    // Atualizar lista de usuários para todos
    io.emit('update-users', Array.from(connectedUsers.values()));

    // Enviar lista de jogadores em jogo para o novo usuário
    socket.emit('players-in-game-update', Array.from(playersInGame));
  });

  // Quando um usuário envia uma mensagem
  socket.on('send-message', (message) => {
    const username = connectedUsers.get(socket.id);
    const newMessage = {
      user: username,
      text: message,
      time: getHorarioBrasilia()
    };

    // Adicionar à lista de mensagens
    messages.push(newMessage);

    // Enviar para todos
    io.emit('message', newMessage);
  });

  // Configurar lógica do jogo da velha
  setupTicTacToe(io, socket, connectedUsers, messages);

  // Configurar lógica do jogo UNO - use the correct function name
  setupUnoEvents(io, socket);

  // Quando um usuário desconecta
  socket.on('disconnect', () => {
    const username = connectedUsers.get(socket.id);
    if (username) {
      console.log(`Usuário ${username} desconectado`);

      // Lidar com desconexão de jogador em jogo ativo (TicTacToe)
      handlePlayerDisconnect(io, socket, username, connectedUsers, messages, activeGames);

      // Remove the reference to handleUnoPlayerDisconnect since it doesn't exist
      // The disconnect logic is already handled inside setupUnoEvents

      // Remover usuário da lista
      connectedUsers.delete(socket.id);

      // Remover mensagens do usuário que saiu
      const userMessageIndexes = [];
      messages.forEach((msg, index) => {
        if (msg.user === username) {
          userMessageIndexes.unshift(index); // Adiciona no início para remover de trás para frente
        }
      });

      userMessageIndexes.forEach(index => {
        messages.splice(index, 1);
      });

      // Notificar outros usuários
      const leaveMessage = {
        user: 'Sistema',
        text: `${username} saiu do chat`,
        time: getHorarioBrasilia()
      };

      messages.push(leaveMessage);
      socket.broadcast.emit('message', leaveMessage);

      // Atualizar lista de usuários para todos
      io.emit('update-users', Array.from(connectedUsers.values()));

      // Enviar histórico atualizado de mensagens (sem as mensagens do usuário que saiu)
      io.emit('message-history', messages);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
  // Iniciar o mecanismo de ping automático
  manterServidorAtivo();
});