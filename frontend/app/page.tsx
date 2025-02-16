'use client';

import ChatMessage from '@/components/chat-message';
import Tag from '@/components/tag';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, Loader2, SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ChatMessage = {
  content: string;
  role: 'user' | 'assistant';
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const queryInputRef = useRef<any>(null);

  // Handle user chat
  const submitQuery = async () => {
    if (query.trim() === '') return;
    setIsWaiting(true);

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      {
        content: query,
        role: 'user',
      },
    ];
    setChatHistory(newChatHistory);

    // Send everything over to the server
    const response: ChatMessage = await (
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChatHistory),
      })
    ).json();

    console.log(response);

    setChatHistory([...newChatHistory, response]);
    setIsWaiting(false);
    setQuery('');
    queryInputRef.current?.focus();
  };

  // Handle suggestion clicks
  const suggestionClick = (text: string) => {
    setQuery(text);
    queryInputRef.current?.focus();
  };

  // On component mount?
  useEffect(() => {
    queryInputRef.current?.focus();
  }, [queryInputRef]);

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center overflow-hidden',
        chatHistory.length > 0 && 'items-stretch',
      )}
    >
      {/* Main content */}
      <div className="flex w-full max-w-xl flex-col gap-4 py-4">
        {chatHistory.length === 0 && (
          <h1 className="mb-4 text-center text-3xl font-medium">
            What would you like to learn?
          </h1>
        )}

        {/* Chat history */}
        {chatHistory.length > 0 && (
          <>
            <p className="text-muted-foreground mx-auto text-sm">
              trailhead will ask a few more questions to understand your query.
            </p>

            <div className="flex w-full flex-col gap-2 overflow-auto">
              {chatHistory.map((message, idx) => (
                <ChatMessage role={message.role} key={idx}>
                  {message.content}
                </ChatMessage>
              ))}
              {isWaiting && (
                <div className="flex flex-col gap-2" key="skeleton">
                  <Skeleton className="h-4 w-80 rounded-2xl delay-0" />
                  <Skeleton className="h-4 w-20 rounded-2xl delay-500" />
                  <Skeleton className="h-4 w-40 rounded-2xl delay-1000" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Input */}
        <div className="relative mt-auto h-24">
          <Textarea
            className="absolute h-full resize-none rounded-2xl bg-transparent px-4 py-3 focus-visible:ring-0"
            placeholder={
              chatHistory.length <= 1
                ? 'I want to...'
                : chatHistory.length <= 3
                  ? 'What are you familiar with already? e.g. 1, 2, 5'
                  : chatHistory.length <= 5
                    ? "What's your main goal or objective?"
                    : 'Add additional info...'
            }
            spellCheck="false"
            autoComplete="off"
            ref={queryInputRef}
            value={query}
            disabled={isWaiting}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitQuery()}
          />
          <Button
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity"
            size="icon"
            disabled={query.trim() === '' || isWaiting}
            onClick={submitQuery}
          >
            {isWaiting ? <Loader2 className="animate-spin" /> : <ArrowUpIcon />}
          </Button>
        </div>

        {/* Recommendations */}
        {chatHistory.length === 0 && (
          <div className="flex flex-wrap gap-2">
            <Tag onClick={suggestionClick} label="get good at poker" />
            <Tag onClick={suggestionClick} label="make a killer lasagna" />
            <Tag onClick={suggestionClick} label="play magic the gathering" />
          </div>
        )}
      </div>
    </div>
  );
}
