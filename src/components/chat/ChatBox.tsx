'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Message } from '@/types/chat';

export default function ChatBox() {
  const [newMessage, setNewMessage] = useState('');
  const { messages, sendMessage, currentUser } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message, index: number) => (
          <div
            key={index}
            className={`flex ${message.user === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${message.user === 'Sistema'
                ? 'bg-gray-200 text-gray-800'
                : message.user === currentUser
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-500 text-white'
                }`}
            >
              {message.user !== currentUser && message.user !== 'Sistema' && (
                <div className="font-bold text-md">{message.user}</div>
              )}
              <p>{message.text}</p>
              <div className="text-xs opacity-70 text-right mt-1">{message.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}