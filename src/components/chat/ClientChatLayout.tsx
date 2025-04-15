'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid SSR issues with socket.io
const ChatLayoutWithNoSSR = dynamic(
  () => import('@/components/chat/ChatLayout'),
  { ssr: false }
);

export default function ClientChatLayout() {
  return <ChatLayoutWithNoSSR />;
}