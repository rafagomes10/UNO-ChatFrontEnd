import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UnoCardColor, UnoGameState } from '@/types/unoGame';
import { io, Socket } from 'socket.io-client';
import { useChat } from '@/context/ChatContext'; // Importa o contexto do chat para pegar o usuário atual

interface AvailableRoom {
  id: string;
  owner: string;
  players: string[];
  playerCount: number;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UnoGameContextType {
  state: UnoGameState;
  notifications: Notification[];
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  playCard: (cardIndex: number, chosenColor?: UnoCardColor) => void;
  drawCard: () => void;
  callUno: () => void;
  challengeUno: (targetPlayer: string) => void;
  getRooms: () => void;
  removeNotification: (id: number) => void;
}

const initialState: UnoGameState = {
  gameStatus: 'idle',
  players: [],
  hand: [],
  topCard: null,
  currentPlayer: null,
  currentColor: null,
  roomCode: null,
  opponentHandSize: {},
  isRoomOwner: false,
  unoCalled: false,
  error: null,
  availableRooms: [],
};

const UnoGameContext = createContext<UnoGameContextType | undefined>(undefined);
const SOCKET_SERVER_URL = 'http://localhost:4000';

export const UnoGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationId, setNotificationId] = useState(0);
  const [state, setState] = useState<UnoGameState>(initialState);
  const [isUnoLoggedIn, setIsUnoLoggedIn] = useState(false);

  const { currentUser } = useChat(); // Pega o usuário atual do contexto do chat

  // Gerenciamento de notificações
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = notificationId;
    setNotificationId(prev => prev + 1);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Adicionar um timestamp para limitar a frequência das chamadas
  const [lastRoomFetch, setLastRoomFetch] = useState(0);
  
  const getRooms = useCallback(() => {
    // Evitar chamadas muito frequentes (mínimo 5 segundos entre chamadas)
    const now = Date.now();
    if (now - lastRoomFetch < 5000) {
      return;
    }
    
    if (socket?.connected) {
      console.log('Solicitando lista de salas disponíveis');
      socket.emit('get-uno-rooms');
      setLastRoomFetch(now);
    }
  }, [socket, lastRoomFetch]);

  // Conexão com o WebSocket e envio de 'user-join'
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    setSocket(newSocket);

    const handleConnect = () => {
      console.log('UNO Socket connected successfully');
      setIsUnoLoggedIn(false); // Reset login state on reconnect
      if (currentUser) {
        console.log('Enviando user-join para UNO socket:', currentUser);
        newSocket.emit('user-join', currentUser);
      }
      addNotification('Conectado ao servidor de jogo', 'success');
    };

    const handleConnectError = (error: Error) => {
      console.error('UNO Socket connection error:', error);
      addNotification('Erro ao conectar ao servidor', 'error');
    };

    // Listen for login-success from backend
    const handleLoginSuccess = () => {
      setIsUnoLoggedIn(true);
      console.log('UNO socket login-success recebido');
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('connect_error', handleConnectError);
    newSocket.on('login-success', handleLoginSuccess);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('login-success', handleLoginSuccess);
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Configuração dos listeners do Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (gameState: Partial<UnoGameState>) => {
      console.log('Game state updated:', gameState);
      
      // Se recebemos uma atualização da mão do jogador, precisamos garantir que seja um array
      if (gameState.hand && !Array.isArray(gameState.hand)) {
        console.error('Formato inválido para a mão do jogador:', gameState.hand);
        gameState.hand = [];
      }
      
      // Se recebemos uma atualização do tamanho da mão dos oponentes
      if (gameState.opponentHandSize && typeof gameState.opponentHandSize !== 'object') {
        console.error('Formato inválido para o tamanho da mão dos oponentes:', gameState.opponentHandSize);
        gameState.opponentHandSize = {};
      }
      
      setState(prev => ({ ...prev, ...gameState }));
    };

    const handleGameError = (error: string) => {
      setState(prev => ({ ...prev, error }));
      addNotification(error, 'error');
    };

    const handleRoomCreated = (roomData: {
      roomCode: string;
      players: string[];
    }) => {
      console.log('Evento uno-room-created recebido:', roomData);
      setState(prev => ({
        ...prev,
        roomCode: roomData.roomCode,
        players: roomData.players,
        isRoomOwner: true,
        gameStatus: 'waiting'
      }));
      addNotification(`Sala ${roomData.roomCode} criada!`, 'success');
    };

    const handleRoomJoined = (roomData: { roomCode: string; players: string[]; isOwner?: boolean }) => {
      setState(prev => ({
        ...prev,
        roomCode: roomData.roomCode,
        players: roomData.players,
        isRoomOwner: false, // Quem entra na sala nunca é o dono
        gameStatus: 'waiting'
      }));
      addNotification(`Você entrou na sala ${roomData.roomCode}`, 'success');
    };

    const handleGameStarted = (gameData: {
      hands: Record<string, any[]>;
      topCard: any;
      currentPlayer: string;
      currentColor: string;
      discardPile?: any[];
      direction?: number;
    }) => {
      console.log('Game started event received:', gameData);
      console.log('Current user:', currentUser);
      console.log('User hand:', currentUser && gameData.hands ? gameData.hands[currentUser] : 'No hand data');
      
      // Check if hands data exists and has the expected structure
      if (!gameData.hands || typeof gameData.hands !== 'object') {
        console.error('Invalid hands data received:', gameData.hands);
        addNotification('Erro ao receber cartas do jogo', 'error');
        return;
      }
      
      // Get the player's hand or create an empty array if not found
      const playerHand = currentUser && gameData.hands[currentUser] 
        ? gameData.hands[currentUser] 
        : [];
        
      console.log('Player hand to be set:', playerHand);
      
      setState(prev => ({
        ...prev,
        gameStatus: 'active',
        hand: playerHand,
        topCard: gameData.topCard || (gameData.discardPile && gameData.discardPile.length > 0 ? gameData.discardPile[0] : null),
        currentPlayer: gameData.currentPlayer,
        currentColor: gameData.currentColor as UnoCardColor,
        // Calculate opponent hand sizes
        opponentHandSize: Object.entries(gameData.hands)
          .filter(([player]) => player !== currentUser)
          .reduce((acc, [player, cards]) => {
            acc[player] = Array.isArray(cards) ? cards.length : 0;
            return acc;
          }, {} as Record<string, number>)
      }));
      addNotification('O jogo começou!', 'success');
    };

    const handlePlayerJoined = (player: string) => {
      setState(prev => {
        // Verifica se o jogador já existe na lista
        if (prev.players.includes(player)) {
          console.log(`Jogador ${player} já está na lista, ignorando duplicata`);
          return prev; // Retorna o estado anterior sem modificações
        }
        
        console.log(`Adicionando jogador ${player} à sala`);
        return {
          ...prev,
          players: [...prev.players, player]
        };
      });
      addNotification(`${player} entrou na sala`, 'info');
    };

    const handlePlayerLeft = (player: string) => {
      setState(prev => ({
        ...prev,
        players: prev.players.filter(p => p !== player)
      }));
      addNotification(`${player} saiu da sala`, 'info');
    };

    const handleAvailableRooms = (rooms: AvailableRoom[]) => {
      console.log('Recebendo lista de salas disponíveis:', rooms);
      setState(prev => ({ ...prev, availableRooms: rooms }));
    };

    const handleJoinError = (error: string) => {
      console.error('Erro ao entrar na sala:', error);
      addNotification(`Erro ao entrar na sala: ${error}`, 'error');
    };

    const handleRoomUpdated = (roomData: { roomCode: string; players: string[]; status?: string }) => {
      console.log('Evento uno-room-updated recebido:', roomData);
      
      // Garantir que a lista de jogadores não tenha duplicatas
      const uniquePlayers = [...new Set(roomData.players)].filter(player => player && player !== 'Jogador');
      
      // Se não houver jogadores válidos, não atualize o estado
      if (uniquePlayers.length === 0) return;
      
      setState(prev => {
        // Verificar se o estado já tem esses jogadores para evitar atualizações desnecessárias
        if (JSON.stringify(prev.players) === JSON.stringify(uniquePlayers)) {
          console.log('Lista de jogadores não mudou, ignorando atualização');
          return prev;
        }
        
        // Importante: manter o status de isRoomOwner consistente
        const isOwner = uniquePlayers.length > 0 && uniquePlayers[0] === currentUser;
        
        console.log(`Room update: isOwner=${isOwner}, currentUser=${currentUser}, firstPlayer=${uniquePlayers[0]}, players=${JSON.stringify(uniquePlayers)}`);
        
        return {
          ...prev,
          players: uniquePlayers,
          // Não alteramos o isRoomOwner aqui para evitar confusão
          gameStatus: roomData.status === 'active' ? 'active' : prev.gameStatus
        };
      });
    };

    // Adicionar handler para atualização de salas
    const handleRoomsUpdated = () => {
      console.log('Received notification that UNO rooms have been updated');
      // Buscar a lista atualizada de salas
      getRooms();
    };

    socket.on('uno-room-created', handleRoomCreated);
    socket.on('uno-room-joined', handleRoomJoined);
    socket.on('uno-game-started', handleGameStarted);
    socket.on('uno-player-joined', handlePlayerJoined);
    socket.on('uno-player-left', handlePlayerLeft);
    socket.on('uno-game-state', handleGameState);
    socket.on('uno-game-error', handleGameError);
    socket.on('uno-join-error', handleJoinError);
    socket.on('uno-available-rooms', handleAvailableRooms);
    socket.on('uno-rooms-list', handleAvailableRooms); // Adicionar este listener para o evento correto
    socket.on('uno-room-updated', handleRoomUpdated);
    socket.on('uno-rooms-updated', handleRoomsUpdated);

    return () => {
      socket.off('uno-room-created', handleRoomCreated);
      socket.off('uno-room-joined', handleRoomJoined);
      socket.off('uno-game-started', handleGameStarted);
      socket.off('uno-player-joined', handlePlayerJoined);
      socket.off('uno-player-left', handlePlayerLeft);
      socket.off('uno-game-state', handleGameState);
      socket.off('uno-game-error', handleGameError);
      socket.off('uno-join-error', handleJoinError);
      socket.off('uno-available-rooms', handleAvailableRooms);
      socket.off('uno-rooms-list', handleAvailableRooms); // Remover este listener também
      socket.off('uno-room-updated', handleRoomUpdated);
      socket.off('uno-rooms-updated', handleRoomsUpdated);
    };
  }, [socket, currentUser, getRooms]);

  // Atualiza periodicamente a lista de salas
  useEffect(() => {
    if (state.gameStatus === 'idle') {
      const interval = setInterval(() => {
        getRooms();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [state.gameStatus, getRooms]);

  // Funções do jogo
  const createRoom = () => {
    if (!socket?.connected) {
      addNotification('Não conectado ao servidor', 'error');
      return;
    }
    
    if (!currentUser) {
      addNotification('Você precisa estar logado para criar uma sala', 'error');
      return;
    }
    
    if (!isUnoLoggedIn) {
      console.log('Tentando reenviar user-join antes de criar sala');
      socket.emit('user-join', currentUser);
      setTimeout(() => {
        console.log('Emitindo evento create-uno-room com usuário após login:', currentUser);
        socket.emit('create-uno-room', { username: currentUser });
      }, 1000);
    } else {
      console.log('Emitindo evento create-uno-room com usuário:', currentUser);
      socket.emit('create-uno-room', { username: currentUser });
    }
    
    addNotification('Criando sala...', 'info');
  };

  const joinRoom = (roomId: string) => {
    if (!socket?.connected) {
      addNotification('Não conectado ao servidor', 'error');
      return;
    }
    
    if (!currentUser) {
      addNotification('Você precisa estar logado para entrar em uma sala', 'error');
      return;
    }
    
    // Verificar se já está na sala
    if (state.roomCode === roomId) {
      console.log(`Já está na sala ${roomId}, ignorando solicitação duplicada`);
      return;
    }
    
    if (!isUnoLoggedIn) {
      console.log('Tentando reenviar user-join antes de entrar na sala');
      socket.emit('user-join', currentUser);
      setTimeout(() => {
        console.log('Emitindo evento join-uno-room para sala após login:', roomId);
        socket.emit('join-uno-room', { roomId, username: currentUser });
      }, 1000);
    } else {
      console.log('Emitindo evento join-uno-room para sala:', roomId);
      socket.emit('join-uno-room', { roomId, username: currentUser });
    }
    
    addNotification(`Entrando na sala ${roomId}...`, 'info');
  };

  const leaveRoom = () => {
    if (state.roomCode && socket?.connected) {
      console.log('Emitindo evento leave-uno-room para sala:', state.roomCode);
      socket.emit('leave-uno-room', { roomId: state.roomCode, username: currentUser });
      setState(initialState);
      addNotification('Você saiu da sala', 'info');
    }
  };

  const startGame = () => {
    if (state.roomCode && socket?.connected && state.isRoomOwner) {
      console.log('Emitindo evento start-uno-game para sala:', state.roomCode);
      socket.emit('start-uno-game', state.roomCode); // Simplificando para enviar apenas o código da sala
      addNotification('Iniciando jogo...', 'info');
    } else if (!state.isRoomOwner) {
      addNotification('Apenas o líder da sala pode iniciar o jogo', 'info');
    }
  };

  const playCard = (cardIndex: number, chosenColor?: UnoCardColor) => {
    if (state.roomCode && socket?.connected) {
      // Verificar se é a vez do jogador
      if (state.currentPlayer !== currentUser) {
        addNotification('Não é sua vez de jogar!', 'error');
        return;
      }
      
      console.log(`Tentando jogar carta no índice ${cardIndex}, cor escolhida: ${chosenColor || 'nenhuma'}`);
      
      // Verificar se a carta é válida para jogar
      const cardToPlay = state.hand[cardIndex];
      if (!cardToPlay) {
        console.error('Carta inválida selecionada');
        return;
      }
      
      // Log the card being played and the current top card for debugging
      console.log('Playing card:', cardToPlay, 'Current top card:', state.topCard, 'Current color:', state.currentColor);
      
      socket.emit('play-uno-card', {
        roomId: state.roomCode,
        cardIndex,
        chosenColor
      });
      
      // Feedback para o usuário
      addNotification('Jogando carta...', 'info');
    } else {
      console.error('Não é possível jogar: não está em uma sala ou não está conectado');
      addNotification('Não foi possível jogar a carta', 'error');
    }
  };

  const drawCard = () => {
    if (state.roomCode && socket?.connected) {
      console.log('Emitindo evento draw-uno-card para sala:', state.roomCode);
      socket.emit('draw-uno-card', state.roomCode);
      
      // Add a notification to provide feedback
      addNotification('Comprando carta...', 'info');
    } else {
      console.error('Cannot draw card: not in a room or not connected');
      addNotification('Não foi possível comprar carta', 'error');
    }
  };

  const callUno = () => {
    if (state.roomCode && socket?.connected) {
      socket.emit('call-uno', state.roomCode);
    }
  };

  const challengeUno = (targetPlayer: string) => {
    if (state.roomCode && socket?.connected) {
      socket.emit('challenge-uno', {
        roomId: state.roomCode,
        targetPlayer
      });
    }
  };

  return (
    <UnoGameContext.Provider value={{
      state,
      notifications,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      playCard,
      drawCard,
      callUno,
      challengeUno,
      getRooms,
      removeNotification,
    }}>
      {children}
    </UnoGameContext.Provider>
  );
};

export const useUnoGame = () => {
  const context = useContext(UnoGameContext);
  if (!context) {
    throw new Error('useUnoGame must be used within a UnoGameProvider');
  }
  return context;
};
