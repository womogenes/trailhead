'use client';

import { AppContext } from '@/app/layout';
import { cn } from '@/lib/utils';
import { BookOpenIcon, GithubIcon, MilestoneIcon, LightbulbIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import { LoginModal } from './login-modal';
import { Button } from './ui/button';

export default function Navbar() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { appState, setAppState } = useContext(AppContext);

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
          <BookOpenIcon size={16} />
          <span>Learn</span>
        </Tab>
        <Tab href="/trails">
          <MilestoneIcon size={16} />
          <span>Trails</span>
        </Tab>
        <Tab href="/recs">
          <LightbulbIcon size={16} />
          <span>Sidequests</span>
        </Tab>
      </div>

      <div className="divide-y-0.5 border-t-0.5 mt-auto flex flex-col">
        {appState.login ? (
          <div className="text-muted-foreground flex items-center justify-between gap-2 px-4 py-4">
            <p className="-mt-0.5">{appState.login}</p>
            <Button
              className="!h-8 !w-16 text-xs"
              variant="ghost"
              onClick={() => {
                setAppState({ ...appState, login: null });
                localStorage.removeItem('login');
              }}
            >
              Log out
            </Button>
          </div>
        ) : (
          <Button className="mx-2 my-4" onClick={() => setLoginModalOpen(true)}>
            Sign in
          </Button>
        )}
        <div className="text-primary flex w-full px-4 py-2 pt-4">
          <Link
            className="ml-auto self-end"
            href="https://github.com/womogenes/trailhead"
          >
            <GithubIcon size={18} />
          </Link>
        </div>
      </div>
      <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
    </div>
  );
}

function Tab({ children, href }: { children: React.ReactNode; href: string }) {
  const pathname = usePathname();

  return (
    <Link
      className={cn(
        pathname === href && 'text-primary font-medium',
        'flex items-center gap-3 rounded-sm px-4 py-2 transition-all hover:bg-black/5 active:scale-95',
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
