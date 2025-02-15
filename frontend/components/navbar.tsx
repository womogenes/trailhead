"use client";

import { cn } from "@/lib/utils";
import { GlobeIcon, MilestoneIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <div className="flex w-full max-w-52 flex-col pb-2 pt-5">
      {/* Title */}
      <div className="text-primary flex items-center gap-2 px-4">
        <MilestoneIcon className="stroke-2" size={21} />
        <span className="-mt-0.5 text-2xl tracking-tighter">trailhead</span>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-col px-1">
        <Tab href="/">
          <GlobeIcon size={16} />
          <span>Discover</span>
        </Tab>
        <Tab href="/trails">
          <MilestoneIcon size={16} />
          <span>Trails</span>
        </Tab>
      </div>

      <Button className="mx-2 mt-auto">Sign in</Button>
    </div>
  );
}

function Tab({ children, href }: { children: React.ReactNode; href: string }) {
  const pathname = usePathname();

  return (
    <a
      className={cn(
        pathname === href && "text-primary font-medium",
        "flex items-center gap-2 rounded-sm px-4 py-2 transition-colors hover:bg-black/5",
      )}
      href={href}
    >
      {children}
    </a>
  );
}
