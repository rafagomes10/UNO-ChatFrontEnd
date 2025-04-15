'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Importação dinâmica para evitar SSR issues com socket.io
const ChatProviderWithNoSSR = dynamic(() => import('@/context/ChatProvider'), { ssr: false });
const TicTacToeProviderWithNoSSR = dynamic(() => import('@/context/TicTacToeProvider'), { ssr: false });
const UnoGameProviderWithNoSSR = dynamic(() => import('@/context/UnoGameContext').then(mod => mod.UnoGameProvider), { ssr: false });

export default function ClientChatProvider({ children }: { children: ReactNode }) {
  return (
    <ChatProviderWithNoSSR>
      <TicTacToeProviderWithNoSSR>
        <UnoGameProviderWithNoSSR>
          {children}
        </UnoGameProviderWithNoSSR>
      </TicTacToeProviderWithNoSSR>
    </ChatProviderWithNoSSR>
  );
}
