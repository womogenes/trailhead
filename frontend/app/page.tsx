'use client';

import ChatMessage from '@/components/chat-message';
import Tag from '@/components/tag';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, Loader2, SearchIcon } from 'lucide-react';
import { useRef, useState } from 'react';

type ChatMessage = {
  content: string;
  role: 'user' | 'assistant';
}[];

export default function Home() {
  const [query, setQuery] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage>([]);

  const queryInputRef = useRef<any>(null);

  const submitQuery = () => {
    if (query.trim() === '') return;
    setIsWaiting(true);
    setChatHistory((chatHistory) => [
      ...chatHistory,
      {
        content: query,
        role: 'user',
      },
    ]);

    // Send everything over to the server
    // await fetch(`${process.env.BACKEND_URL}/)
  };

  // Handle suggestion clicks
  const suggestionClick = (text: string) => {
    setQuery(text);
    queryInputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center',
        chatHistory.length > 0 && 'items-stretch',
      )}
    >
      {/* Main content */}
      <div className={cn('flex w-full max-w-xl flex-col gap-4 py-4')}>
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

            <div className="flex w-full flex-col gap-2">
              {chatHistory.map((message, idx) => (
                <ChatMessage role={message.role} key={idx}>
                  {message.content}
                </ChatMessage>
              ))}
              {isWaiting && (
                <div className="flex flex-col gap-2" key="skeleton">
                  <Skeleton className="h-4 w-80 rounded-2xl" />
                  <Skeleton className="h-4 w-20 rounded-2xl" />
                  <Skeleton className="h-4 w-40 rounded-2xl" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Input */}
        <div className="relative mt-auto h-24">
          <Textarea
            className="absolute h-full resize-none rounded-2xl bg-transparent px-4 py-3 focus-visible:ring-0"
            placeholder="Enter a skill, recipe, goal, etc."
            spellCheck="false"
            autoComplete="off"
            ref={queryInputRef}
            value={query}
            disabled={isWaiting}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitQuery()}
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
          <div className="mt-2 flex flex-wrap gap-2">
            <Tag onClick={suggestionClick} label="get good at poker" />
            <Tag onClick={suggestionClick} label="make a killer lasagna" />
            <Tag onClick={suggestionClick} label="play magic the gathering" />
          </div>
        )}
      </div>
    </div>
  );
}
