'use client';

import { useState } from 'react';
import { useChat } from '@/context/ChatContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const { login, loginError } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-[#1a1b3b]/30 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-10">
      <h2 className="text-2xl font-bold text-center text-white">Entre no Chat</h2>

      {loginError && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          <p>{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-2 bg-[#2a2b4b]/20 backdrop-blur-sm border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300 text-white placeholder-white/70"
            maxLength={10}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-[#2a2b4b]/20 backdrop-blur-sm border border-green-600 rounded-md hover:bg-green-700/30 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}