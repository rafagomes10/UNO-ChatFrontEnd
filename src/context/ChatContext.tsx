'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ChatContextType } from '@/types/chat';

const SOCKET_SERVER_URL = 'http://localhost:4000';
//const SOCKET_SERVER_URL = 'https://chat-backend-6r2a.onrender.com';
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    console.log('Socket initialized, attempting connection to:', SOCKET_SERVER_URL);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('message-history', (messageHistory: Message[]) => {
      setMessages(messageHistory);
    });

    socket.on('update-users', (updatedUsers: string[]) => {
      setUsers(updatedUsers);
    });

    // Add handlers for login success and error
    socket.on('login-success', () => {
      setLoginError(null);
      setIsLoggedIn(true);
    });

    socket.on('login-error', (error: string) => {
      setLoginError(error);
      setCurrentUser('');
    });

    return () => {
      socket.off('message');
      socket.off('message-history');
      socket.off('update-users');
      socket.off('login-success');
      socket.off('login-error');
    };
  }, [socket]);

  const login = (username: string) => {
    if (socket && username.trim()) {
      setLoginError(null); // Clear any previous errors
      setCurrentUser(username);
      socket.emit('user-join', username);
    }
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
      socket.connect(); // Reconnect without user
    }
    
    setCurrentUser('');
    setIsLoggedIn(false);
    setMessages([]);
  };

  const sendMessage = (message: string) => {
    if (socket && message.trim() && isLoggedIn) {
      socket.emit('send-message', message);
    }
  };

  const value = {
    socket,
    messages,
    users,
    currentUser,
    isLoggedIn,
    loginError,
    login,
    logout,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};