"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SearchIcon } from "lucide-react";
import { PropsWithChildren, useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <div className="bg-muted flex min-h-screen w-full gap-0">
      {/* Left sidebar */}
      <Navbar />

      {/* Main content */}
      <div className="bg-background my-2 mr-2 flex w-full items-center justify-center rounded-sm">
        <div className="w-full max-w-xl">
          <h1 className="mb-4 text-center text-3xl font-medium">
            What would you like to learn?
          </h1>

          {/* Input */}
          <div className="relative h-28">
            <Textarea
              className="absolute h-full resize-none px-4 py-3 !text-base focus-visible:ring-0"
              placeholder="Enter a skill, recipe, goal, etc."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity"
              size="icon"
              disabled={query.trim() === ""}
            >
              <SearchIcon />
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
