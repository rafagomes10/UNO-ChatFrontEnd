import React, { useEffect, useState } from 'react';
import { useUnoGame } from '@/context/UnoGameContext';
import { useChat } from '@/context/ChatContext';

interface UnoLobbyProps {
  onJoinRoom?: (roomId: string) => void;
  onCreateRoom?: () => void; // Adicione esta prop
}

const UnoLobby: React.FC<UnoLobbyProps> = ({ onJoinRoom, onCreateRoom }) => {
  const { currentUser } = useChat();
  const {
    state: {
      gameStatus,
      players,
      roomCode,
      isRoomOwner,
      availableRooms,
    },
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    getRooms,
  } = useUnoGame();

  // Add local loading state for room creation
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Função para renderizar jogadores únicos
  const renderPlayers = () => {
    // Criar um Set para garantir jogadores únicos
    const uniquePlayers = [...new Set(players)];
    
    return uniquePlayers.map((player, idx) => (
      <li
        key={player + '-' + idx}
        className={`p-3 rounded-lg transition-colors ${
          player === currentUser 
            ? 'bg-green-100 border border-green-300' 
            : 'bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <span>{player}</span>
          {idx === 0 && (
            <span className="bg-yellow-200 px-2 py-1 rounded text-sm">
              Líder
            </span>
          )}
        </div>
      </li>
    ));
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
    if (onJoinRoom) {
      onJoinRoom(roomId);
    }
  };

  // New: handle create room with loading and feedback
  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    console.log('Creating room...');
    
    // Check if user is logged in
    if (!currentUser) {
      console.error('Cannot create room: User not logged in');
      alert('Você precisa estar logado para criar uma sala');
      setCreatingRoom(false);
      return;
    }
    
    try {
      await createRoom(); // If createRoom is async, otherwise remove await
      console.log('Room created successfully');
      // Optionally, fetch rooms again
      getRooms();
      if (onCreateRoom) {
        onCreateRoom();
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      // Always reset loading state
      setCreatingRoom(false);
    }
  };

  // Modificar o useEffect para evitar chamadas excessivas
  useEffect(() => {
    // Buscar salas apenas uma vez ao montar o componente
    getRooms();
    
    // Reduzir a frequência de atualização para 10 segundos
    const interval = setInterval(getRooms, 10000);
    
    return () => clearInterval(interval);
  }, [getRooms]);

  // Reset loading if gameStatus changes to 'waiting'
  useEffect(() => {
    if (creatingRoom && gameStatus === 'waiting') {
      setCreatingRoom(false);
    }
  }, [gameStatus, creatingRoom]);

  // Add this useEffect to monitor player changes
  useEffect(() => {
    console.log('UnoLobby - Players list updated:', players);
  }, [players]);

  if (gameStatus === 'waiting') {  // Changed from 'in_room' to 'waiting'
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Sala: {roomCode}</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Jogadores:</h3>
          <ul className="space-y-2">
            {renderPlayers()}
          </ul>
        </div>
        <div className="flex justify-between gap-4">
          {isRoomOwner && players.length >= 2 && (
            <button
              onClick={startGame}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Iniciar Jogo
            </button>
          )}
          <button
            onClick={leaveRoom}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair da Sala
          </button>
        </div>
      </div>
    );
  }

  // No componente UnoLobby, vamos adicionar uma função para filtrar salas duplicadas
  const getUniqueRooms = () => {
    const uniqueRooms = [];
    const roomIds = new Set();
    
    availableRooms.forEach(room => {
      if (!roomIds.has(room.id)) {
        roomIds.add(room.id);
        uniqueRooms.push(room);
      }
    });
    
    return uniqueRooms;
  };

  // E então, na parte de renderização, substituímos availableRooms por getUniqueRooms()
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Salas Disponíveis</h2>
        <button
          onClick={handleCreateRoom}
          className={`px-6 py-3 rounded-lg transition-colors text-white ${creatingRoom ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={creatingRoom}
        >
          {creatingRoom ? 'Criando...' : 'Criar Sala'}
        </button>
      </div>

      {getUniqueRooms().length > 0 ? (
        <div className="space-y-3">
          {getUniqueRooms().map((room) => (
            <div key={room.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">Sala de {room.owner}</p>
                  <p className="text-sm text-gray-600">
                    {room.players.length}/4 jogadores
                  </p>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={room.players.length >= 4}
                >
                  {room.players.length >= 4 ? 'Sala Cheia' : 'Entrar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Nenhuma sala disponível</p>
          <p className="text-sm mt-2">Crie uma nova sala para começar!</p>
        </div>
      )}
    </div>
  );
};

export default UnoLobby;