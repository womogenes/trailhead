'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuery = () => {
    if (query.trim() === '') return;
    setIsSubmitting(true);
    router.push(`/search?query=${query}`);
    router.refresh();
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Main content */}
      <div className="w-full max-w-xl">
        <h1 className="mb-4 text-center text-3xl font-medium">
          What would you like to learn?
        </h1>

        {/* Input */}
        <div className="relative h-24">
          <Textarea
            className="absolute h-full resize-none px-4 py-3 !text-base focus-visible:ring-0"
            placeholder="Enter a skill, recipe, goal, etc."
            spellCheck="false"
            autoComplete="off"
            value={query}
            disabled={isSubmitting}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitQuery()}
          />
          <Button
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity"
            size="icon"
            disabled={query.trim() === '' || isSubmitting}
            onClick={submitQuery}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SearchIcon />
            )}
          </Button>
        </div>

        {/* Recommendations */}
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag setQuery={setQuery} label="get good at poker" />
          <Tag setQuery={setQuery} label="make a killer lasagna" />
          <Tag setQuery={setQuery} label="play magic the gathering" />
        </div>
      </div>
    </div>
  );
}

function Tag({ label, setQuery }: { label: string; setQuery: Function }) {
  return (
    <button
      className="bg-muted text-muted-foreground hover:bg-primary hover:text-muted rounded-full px-3 py-1 transition-colors"
      onClick={() => setQuery(label)}
    >
      {label}
    </button>
  );
}
