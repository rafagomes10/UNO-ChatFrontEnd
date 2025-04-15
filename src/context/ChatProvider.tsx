'use client';

import { ChatProvider } from './ChatContext';

export default function ChatProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}