// unoGame.js - Módulo de lógica do jogo UNO

// Objeto para armazenar as salas do UNO
const unoRooms = new Map();
// Mapa para armazenar usuários conectados
const connectedUsers = new Map();

// Tipos de cartas do UNO (será usado na implementação do jogo)
const CARD_TYPES = {
    NUMBER: 'number',
    SKIP: 'skip',
    REVERSE: 'reverse',
    DRAW_TWO: 'draw_two',
    WILD: 'wild',
    WILD_DRAW_FOUR: 'wild_draw_four'
};

// Cores disponíveis (será usado na implementação do jogo)
const COLORS = ['red', 'blue', 'green', 'yellow'];

// Função para obter salas disponíveis
function getAvailableRooms() {
    const availableRooms = [];

    // Debug para verificar o mapa de usuários conectados
    console.log('Usuários conectados:', Array.from(connectedUsers.entries()));

    unoRooms.forEach((room, code) => {
        if (room.status === 'waiting' && room.players.length < 4) {
            // Obter o nome do proprietário (primeiro jogador)
            const ownerId = room.players[0];
            const ownerName = connectedUsers.get(ownerId);

            console.log(`Sala ${code} - Proprietário ID: ${ownerId}, Nome: ${ownerName}`);

            // Mapear IDs de jogadores para nomes
            const playerNames = room.players.map(id => {
                const name = connectedUsers.get(id);
                console.log(`Jogador ID: ${id}, Nome: ${name || 'Não encontrado'}`);
                return name || 'Jogador';
            });

            availableRooms.push({
                id: code,
                owner: ownerName || 'Desconhecido',
                players: playerNames,
                playerCount: room.players.length
            });
        }
    });

    console.log('Salas disponíveis:', availableRooms);
    return availableRooms;
}

// Criar um baralho completo do UNO
function createDeck() {
    const deck = [];

    // Adiciona cartas numeradas (0-9) para cada cor
    COLORS.forEach(color => {
        // Um zero de cada cor
        deck.push({ type: CARD_TYPES.NUMBER, color, value: 0 });

        // Duas de cada número de 1-9 para cada cor
        for (let i = 1; i <= 9; i++) {
            deck.push({ type: CARD_TYPES.NUMBER, color, value: i });
            deck.push({ type: CARD_TYPES.NUMBER, color, value: i });
        }

        // Cartas de ação (2 de cada por cor)
        [CARD_TYPES.SKIP, CARD_TYPES.REVERSE, CARD_TYPES.DRAW_TWO].forEach(type => {
            deck.push({ type, color });
            deck.push({ type, color });
        });
    });

    // Cartas coringa (4 de cada)
    for (let i = 0; i < 4; i++) {
        deck.push({ type: CARD_TYPES.WILD });
        deck.push({ type: CARD_TYPES.WILD_DRAW_FOUR });
    }

    return deck;
}

// Embaralhar o baralho
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Configurar os eventos do socket para o UNO
function setupUnoEvents(io, socket) {
    // Registrar o usuário quando ele se conecta
    socket.on('user-join', (username) => {
        console.log(`Usuário ${username} conectado ao UNO (socket ID: ${socket.id})`);
        connectedUsers.set(socket.id, username);

        // Confirmar que o usuário foi registrado
        console.log('Mapa de usuários atualizado:', Array.from(connectedUsers.entries()));

        socket.emit('login-success');
    });

    // Quando o cliente cria uma sala
    socket.on('create-uno-room', ({ username }) => {
        // Gerar código aleatório para a sala
        const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Criar a sala
        unoRooms.set(roomCode, {
            players: [socket.id],
            status: 'waiting',
            deck: [],
            hands: {},
            discardPile: [],
            currentPlayer: null,
            currentColor: null,
            direction: 1
        });
        
        // Entrar na sala do Socket.io
        socket.join(roomCode);
        
        // Notificar o cliente
        socket.emit('uno-room-created', {
            roomCode,
            players: [connectedUsers.get(socket.id) || 'Jogador']
        });
        
        console.log(`Sala UNO ${roomCode} criada por ${connectedUsers.get(socket.id) || 'Jogador'}`);
        
        // Broadcast to all clients that a new room is available
        // This is the key fix - notify all clients when a new room is created
        io.emit('uno-rooms-updated');
    });

    // Quando o cliente entra em uma sala
    socket.on('join-uno-room', ({ roomId, username }) => {
        const room = unoRooms.get(roomId);
        
        if (!room) {
            socket.emit('uno-join-error', 'Sala não encontrada');
            return;
        }
        
        if (room.status !== 'waiting') {
            socket.emit('uno-join-error', 'Jogo já iniciado');
            return;
        }
        
        if (room.players.length >= 4) {
            socket.emit('uno-join-error', 'Sala cheia');
            return;
        }
        
        // Adicionar jogador à sala
        room.players.push(socket.id);
        
        // Entrar na sala do Socket.io
        socket.join(roomId);
        
        // Notificar todos os jogadores da sala
        const playerNames = room.players.map(id => connectedUsers.get(id) || 'Jogador');
        io.to(roomId).emit('uno-room-updated', {
            roomCode: roomId,
            players: playerNames,
            status: room.status
        });
        
        // Notificar o jogador que entrou
        socket.emit('uno-room-joined', {
            roomCode: roomId,
            players: playerNames
        });
        
        console.log(`Jogador ${connectedUsers.get(socket.id) || 'Jogador'} entrou na sala UNO ${roomId}`);
    });

    // Quando o cliente inicia o jogo
    socket.on('start-uno-game', (roomId) => {
        const room = unoRooms.get(roomId);
        
        if (!room) {
            socket.emit('uno-game-error', 'Sala não encontrada');
            return;
        }
        
        if (room.players[0] !== socket.id) {
            socket.emit('uno-game-error', 'Apenas o líder pode iniciar o jogo');
            return;
        }
        
        if (room.players.length < 2) {
            socket.emit('uno-game-error', 'É necessário pelo menos 2 jogadores');
            return;
        }
        
        // Iniciar o jogo
        startGame(roomId, io);
        
        console.log(`Jogo UNO iniciado na sala ${roomId}`);
    });

    // Quando o cliente compra uma carta
    socket.on('draw-uno-card', (roomId) => {
        const room = unoRooms.get(roomId);
        
        if (!room || room.status !== 'active') {
            socket.emit('uno-game-error', 'Jogo não encontrado ou não iniciado');
            return;
        }
        
        if (room.currentPlayer !== socket.id) {
            socket.emit('uno-game-error', 'Não é sua vez');
            return;
        }
        
        // Verificar se há cartas no baralho
        if (room.deck.length === 0) {
            // Reembaralhar o monte de descarte, exceto a carta do topo
            const topCard = room.discardPile.pop();
            room.deck = shuffleDeck(room.discardPile);
            room.discardPile = [topCard];
        }
        
        // Comprar uma carta
        const card = room.deck.pop();
        const playerName = connectedUsers.get(socket.id);
        
        // Adicionar a carta à mão do jogador
        if (!room.hands[playerName]) {
            room.hands[playerName] = [];
        }
        room.hands[playerName].push(card);
        
        // Notificar o jogador sobre sua nova carta
        socket.emit('uno-card-drawn', {
            card,
            hand: room.hands[playerName]
        });
        
        // Notificar os outros jogadores
        socket.to(roomId).emit('uno-player-drew-card', {
            player: playerName,
            handSize: room.hands[playerName].length
        });
        
        console.log(`Jogador ${playerName} comprou uma carta`);
    });

    // Quando o cliente sai da sala
    socket.on('leave-uno-room', ({ roomId, username }) => {
        const room = unoRooms.get(roomId);
        if (!room) return;
        
        const playerIndex = room.players.indexOf(socket.id);
        if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            socket.leave(roomId);
            
            // Se a sala ficou vazia, remover a sala
            if (room.players.length === 0) {
                unoRooms.delete(roomId);
                console.log(`Sala UNO ${roomId} removida por estar vazia`);
            } else {
                // Notificar os outros jogadores da sala
                const playerNames = room.players.map(id => connectedUsers.get(id) || 'Jogador');
                io.to(roomId).emit('uno-room-updated', {
                    roomCode: roomId,
                    players: playerNames,
                    status: room.status
                });
            }
            
            console.log(`Jogador ${username || 'Desconhecido'} saiu da sala UNO ${roomId}`);
        }
    });

    // Quando o cliente solicita a lista de salas disponíveis
    socket.on('get-uno-rooms', () => {
        const rooms = getAvailableRooms();
        // Send the rooms list to the requesting client
        socket.emit('uno-rooms-list', rooms);
        
        // Add debug log to verify the event is being sent
        console.log(`Enviando lista de salas para ${connectedUsers.get(socket.id) || socket.id}:`, rooms);
    });

    // Quando o cliente desconecta
    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        if (username) {
            console.log(`Usuário ${username} desconectado do UNO`);
            connectedUsers.delete(socket.id);
        }

        // Remover o jogador de qualquer sala em que esteja
        unoRooms.forEach((room, code) => {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                // Se a sala ficou vazia, remover a sala
                if (room.players.length === 0) {
                    unoRooms.delete(code);
                    console.log(`Sala UNO ${code} removida por estar vazia`);
                } else {
                    // Notificar os outros jogadores da sala
                    const playerNames = room.players.map(id => connectedUsers.get(id) || 'Jogador');
                    io.to(code).emit('uno-room-updated', {
                        roomCode: code,
                        players: playerNames,
                        status: room.status
                    });
                }
            }
        });
    });
}

// Função para iniciar um jogo
function startGame(roomId, io) {
    const room = unoRooms.get(roomId);
    if (!room) return false;

    // Criar e embaralhar o baralho
    const deck = createDeck();
    shuffleDeck(deck);

    // Distribuir 7 cartas para cada jogador
    const hands = {};
    room.players.forEach(playerId => {
        const playerName = connectedUsers.get(playerId) || playerId;
        hands[playerName] = [];
        for (let i = 0; i < 7; i++) {
            if (deck.length > 0) {
                const card = deck.pop();
                hands[playerName].push(card);
            }
        }
    });

    // Definir a carta do topo
    const topCard = deck.pop();

    // Atualizar o estado da sala
    room.deck = deck;
    room.hands = hands;
    room.discardPile = [topCard];
    room.currentPlayer = room.players[0];
    room.currentColor = topCard.color || 'red'; // Padrão para vermelho em cartas coringas
    room.status = 'active';

    // Notificar todos os jogadores
    io.to(roomId).emit('uno-game-started', {
        hands: hands,
        topCard: topCard,
        currentPlayer: connectedUsers.get(room.currentPlayer) || room.currentPlayer,
        currentColor: room.currentColor
    });

    return true;
}

// Exportar as funções e objetos necessários
module.exports = {
    setupUnoEvents,
    unoRooms,
    connectedUsers,
    getAvailableRooms,
    createDeck,
    shuffleDeck,
    startGame
};