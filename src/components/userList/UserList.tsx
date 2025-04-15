'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useTicTacToe } from '@/context/TicTacToeContext';
import { useUnoGame } from '@/context/UnoGameContext';
import UnoLobby from '../UnoGame/UnoLobby';
import UnoGame from '../UnoGame/UnoGame';

export default function UserList() {
  const { users, currentUser } = useChat();
  const {
    inviteToGame,
    pendingInvitation,
    acceptGameInvitation,
    declineGameInvitation,
    gameActive,
    playersInGame
  } = useTicTacToe();

  const {
    state: { gameStatus },
    createRoom,
    joinRoom,
    getRooms
  } = useUnoGame();
  const [unoRoomCreated, setUnoRoomCreated] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState<string | null>(null);
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [inviteCooldown, setInviteCooldown] = useState<boolean>(false);
  const [lobbyModalOpen, setLobbyModalOpen] = useState(false);

  // Add this handler for joining rooms
  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
    setLobbyModalOpen(true);
  };

  useEffect(() => {
    if (pendingInvitation) {
      setShowInvitation(true);

      const timer = setTimeout(() => {
        setShowInvitation(false);
        declineGameInvitation();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowInvitation(false);
    }
  }, [pendingInvitation, declineGameInvitation]);

  const handleInvite = (user: string) => {
    if (playersInGame.includes(user)) {
      console.log(`Cannot invite ${user} because they are already playing`);
      return;
    }

    if (!canInviteUser(user)) {
      console.log(`Cannot invite ${user} due to other restrictions`);
      return;
    }

    inviteToGame(user);
    setInviteSent(user);
    setInviteCooldown(true);

    setTimeout(() => {
      setInviteSent(null);
    }, 5000);

    setTimeout(() => {
      setInviteCooldown(false);
    }, 5000);
  };

  const canInviteUser = (user: string) => {
    if (user === currentUser) return false;
    if (inviteCooldown) return false;
    if (gameActive) return false;
    if (playersInGame.includes(user)) return false;
    return true;
  };

  return (
    <>
      <div className="bg-gray-400 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Usuários Online ({users.length})
          </h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                createRoom();
                setUnoRoomCreated(true); // Adicione esta linha
                setLobbyModalOpen(true);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {unoRoomCreated ? 'Criando Sala...' : 'Criar Sala UNO'}
            </button>
            <button
              onClick={() => {
                setLobbyModalOpen(true);
                getRooms();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ver Salas UNO
            </button>
          </div>
        </div>

        {pendingInvitation && showInvitation && (
          <div className="mb-4 p-3 bg-blue-100 rounded-lg">
            <p className='text-gray-800'><strong>{pendingInvitation}</strong> convidou você para jogar!</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={acceptGameInvitation}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Aceitar
              </button>
              <button
                onClick={declineGameInvitation}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Recusar
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {users.map((user, index) => {
            // Verificação explícita se o usuário está jogando
            const isPlaying = playersInGame.includes(user);

            return (
              <li
                key={index}
                className={`px-3 py-2 rounded text-black ${user === currentUser ? 'bg-green-200 font-bold' : isPlaying ? 'bg-yellow-100' : 'bg-white'} relative`}
                onMouseEnter={() => user !== currentUser && setHoveredUser(user)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                <div className="flex justify-between items-center">
                  <span>
                    {user} {user === currentUser && '(você)'}
                    {isPlaying && ' (jogando)'}
                  </span>

                  {!isPlaying && user !== currentUser && (hoveredUser === user || inviteSent === user) && !gameActive && (
                    <div>
                      {inviteSent === user ? (
                        <span className="text-sm text-green-600">Convite enviado</span>
                      ) : (
                        <button
                          onClick={() => handleInvite(user)}
                          className={`px-3 py-1 text-white rounded text-sm ${inviteCooldown ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          disabled={inviteCooldown}
                        >
                          Convidar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {lobbyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">UNO Game</h3>
              <button
                onClick={() => setLobbyModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {gameStatus === 'active' ? (
              <UnoGame />
            ) : (
              <UnoLobby
                onJoinRoom={handleJoinRoom}
                onCreateRoom={() => setLobbyModalOpen(true)} // <-- Add this line
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}