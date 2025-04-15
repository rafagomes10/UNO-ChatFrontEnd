'use client';

import { TicTacToeProvider as TicTacToeContextProvider } from './TicTacToeContext';
import { ReactNode } from 'react';

export default function TicTacToeProvider({ children }: { children: ReactNode }) {
  return <TicTacToeContextProvider>{children}</TicTacToeContextProvider>;
}