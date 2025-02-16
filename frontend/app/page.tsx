'use client';

import ChatMessage from '@/components/chat-message';
import Tag from '@/components/tag';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpIcon, Loader2, MountainIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import evergreenTree from '@/public/evergreen_tree.png';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/progress-bar';

type ChatMessage = {
  content: string;
  role: 'user' | 'assistant';
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const queryInputRef = useRef<any>(null);

  const submitQuery = async () => {
    if (query.trim() === '') return;
    setIsWaiting(true);

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { content: query, role: 'user' },
    ];
    setChatHistory(newChatHistory);

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
    setTimeout(() => queryInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    queryInputRef.current?.focus();
  }, [queryInputRef]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
      {/* Trees on the sides */}
      <motion.div
        className="absolute bottom-0 left-[1%]"
        animate={{
          opacity: chatHistory.length > 0 ? 0 : 1,
          x: chatHistory.length > 0 ? -20 : [0, -5, 0],
          rotate: chatHistory.length > 0 ? 0 : [0, 1, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Image
          src={evergreenTree}
          alt="Left Tree"
          width={140}
          height={200}
          priority
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-[10%]"
        animate={{
          opacity: chatHistory.length > 0 ? 0 : 1,
          x: chatHistory.length > 0 ? -20 : [0, -3, 0],
          rotate: chatHistory.length > 0 ? 0 : [0, 0.5, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Image
          src={evergreenTree}
          alt="Left Tree 2"
          width={100}
          height={160}
          priority
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-[1%]"
        animate={{
          opacity: chatHistory.length > 0 ? 0 : 1,
          x: chatHistory.length > 0 ? 20 : [0, 5, 0],
          rotate: chatHistory.length > 0 ? 0 : [0, -1, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Image
          src={evergreenTree}
          alt="Right Tree"
          width={140}
          height={200}
          priority
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-[10%]"
        animate={{
          opacity: chatHistory.length > 0 ? 0 : 1,
          x: chatHistory.length > 0 ? 20 : [0, 3, 0],
          rotate: chatHistory.length > 0 ? 0 : [0, -0.5, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Image
          src={evergreenTree}
          alt="Right Tree 2"
          width={100}
          height={160}
          priority
        />
      </motion.div>

      {/* Main content */}
      <div
        className={cn(
          chatHistory.length > 0 && 'h-full',
          'flex w-full max-w-xl flex-col gap-4 py-4',
        )}
      >
        {chatHistory.length === 0 && (
          <h1 className="mb-4 text-center text-3xl font-medium">
            What would you like to learn?
          </h1>
        )}

        {chatHistory.length > 0 && (
          <>
            <p className="text-muted-foreground mx-auto text-sm">
              Trailhead will ask a few more questions to understand your query.
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

            {chatHistory.length >= 8 && (
              <div className="mx-auto mt-4 flex w-40 flex-col items-center">
                <MountainIcon className="animate-pulse" />
                <p className="text-foreground mb-1 text-sm">hang tight!</p>
                <Progress isAnimating={true} />
              </div>
            )}
          </>
        )}

        <div className="relative mt-auto h-24">
          <Textarea
            className="bg-background absolute h-full resize-none rounded-2xl px-4 py-3 focus-visible:ring-0"
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
            disabled={isWaiting || chatHistory.length >= 8}
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

        {chatHistory.length === 0 && (
          <div className="flex flex-wrap gap-2">
            <Tag
              onClick={() => setQuery('get good at poker')}
              label="get good at poker"
            />
            <Tag
              onClick={() => setQuery('make a killer lasagna')}
              label="make a killer lasagna"
            />
            <Tag
              onClick={() => setQuery('play magic the gathering')}
              label="play magic the gathering"
            />
          </div>
        )}
      </div>
    </div>
  );
}
