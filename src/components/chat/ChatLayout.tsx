'use client';

import { useChat } from '@/context/ChatContext';
import { useTicTacToe } from '@/context/TicTacToeContext';
import ChatBox from './ChatBox';
import UserList from '../userList/UserList';
import LoginForm from '../login/LoginForm';
import PieChart from '../graphic/PieChart';
import TicTacToe from '../game/TicTacToe';
import BackgroundAnimation from '../animation/BackgroundAnimation';
import BackgroundAnimation4home from '../animation/BackgroundAnimation4home';

export default function ChatLayout() {
  const { isLoggedIn, logout, currentUser } = useChat();
  const { gameActive } = useTicTacToe();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <BackgroundAnimation />
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen relative">
      <BackgroundAnimation4home />
      <div className="w-full md:w-3/4 h-3/4 md:h-screen flex flex-col relative z-10">
        <header className="bg-green-600/80 backdrop-blur-sm text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Chat em Tempo Real</h1>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-sm mr-2">Olá, {currentUser}</span>
            <button
              onClick={logout}
              className="bg-red-500/90 hover:bg-red-600/90 text-white px-3 py-1 rounded text-sm"
            >
              Sair
            </button>
          </div>
        </header>

        {gameActive ? (
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <TicTacToe />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden bg-black/20 backdrop-blur-[2px]">
            <ChatBox />
          </div>
        )}
      </div>
      <div className="w-full md:w-2/4 h-1/4 md:h-screen p-4 overflow-y-auto border-l relative z-10 bg-black/20 backdrop-blur-[2px]">
        <div className="rounded-xl overflow-hidden bg-white p-1 mb-4">
          <PieChart />
        </div>
        <UserList />
      </div>
    </div>
  );
}