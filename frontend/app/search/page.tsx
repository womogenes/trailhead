'use client';

import { useState } from 'react';

export default function Search() {
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search');

  const [chatHistory, setChatHistory] = useState([
    {
      role: 'user',
      content: searchQuery,
    },
  ]);

  return (
    <div className="flex h-full w-full flex-col items-center px-6 py-20">
      {/* Chat interface */}
      <div className="flex w-full max-w-2xl flex-col gap-2">
        {chatHistory.map((message, idx) => (
          <ChatMessage role={message.role} key={idx}>
            {message.content}
          </ChatMessage>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  return (
    <div className="bg-muted max-w-48 self-end rounded-full px-3.5 py-1.5">
      hello
    </div>
  );
}
