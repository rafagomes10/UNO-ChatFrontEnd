'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChat } from './ChatContext';
import { TicTacToeContextType } from '@/types/ticTacToe';

const TicTacToeContext = createContext<TicTacToeContextType | undefined>(undefined);

export const TicTacToeProvider = ({ children }: { children: ReactNode }) => {
  const { socket, currentUser, isLoggedIn } = useChat();

  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameBoard, setGameBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const [opponent, setOpponent] = useState<string>('');
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [pendingInvitation, setPendingInvitation] = useState<string | null>(null);
  const [playersInGame, setPlayersInGame] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-invitation', (inviter: string) => {
      console.log('TicTacToe invitation received from:', inviter);
      setPendingInvitation(inviter);
    });

    socket.on('game-start', (data: { board: Array<string | null>, currentPlayer: string, opponent: string }) => {
      console.log('TicTacToe game started:', data);
      setGameBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setOpponent(data.opponent);
      setGameActive(true);
      setGameResult(null);
      setPendingInvitation(null);

      const activePlayers = [data.currentPlayer, data.opponent];
      setPlayersInGame(activePlayers);

      socket.emit('update-players-in-game', activePlayers);
    });

    socket.on('game-update', (data: { board: Array<string | null>, currentPlayer: string }) => {
      setGameBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
    });

    socket.on('game-over', (result: string) => {
      setGameResult(result);
      setGameActive(false);

      setPlayersInGame([]);

      socket.emit('game-ended');
    });

    socket.on('players-in-game-update', (activePlayers: string[]) => {
      console.log('Received players-in-game update:', activePlayers);
      setPlayersInGame(activePlayers);
    });

    return () => {
      socket.off('game-invitation');
      socket.off('game-start');
      socket.off('game-update');
      socket.off('game-over');
      socket.off('players-in-game-update');
    };
  }, [socket]);

  const inviteToGame = (opponent: string) => {
    if (socket && isLoggedIn) {
      console.log('Sending TicTacToe invitation to:', opponent);
      socket.emit('invite-to-game', opponent);
    } else {
      console.error('Cannot send invitation: socket or login issue', { socketConnected: !!socket, isLoggedIn });
    }
  };

  const acceptGameInvitation = () => {
    if (socket && pendingInvitation) {
      socket.emit('accept-game', pendingInvitation);
    }
  };

  const declineGameInvitation = () => {
    setPendingInvitation(null);
  };

  const makeMove = (position: number) => {
    if (socket && gameActive && currentPlayer === currentUser) {
      socket.emit('make-move', position);
    }
  };

  const value = {
    gameActive,
    gameBoard,
    currentPlayer,
    currentUser,
    opponent,
    gameResult,
    pendingInvitation,
    playersInGame,
    inviteToGame,
    acceptGameInvitation,
    declineGameInvitation,
    makeMove,
  };

  return <TicTacToeContext.Provider value={value}>{children}</TicTacToeContext.Provider>;
};

export const useTicTacToe = (): TicTacToeContextType => {
  const context = useContext(TicTacToeContext);
  if (context === undefined) {
    throw new Error('useTicTacToe must be used within a TicTacToeProvider');
  }
  return context;
};