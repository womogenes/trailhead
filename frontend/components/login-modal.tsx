import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContext, useState } from 'react';
import { AppContext } from '@/app/layout';

export function LoginModal({ open, setOpen }: any) {
  const { appState, setAppState } = useContext(AppContext);
  const [email, setEmail] = useState('');

  const login = () => {
    setAppState({ ...appState, login: email });
    localStorage.setItem('login', email);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Log in to save your trails, view friends' trails, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Email
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={login}>Log in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
