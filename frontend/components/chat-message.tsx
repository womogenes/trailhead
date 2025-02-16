import { cn } from '@/lib/utils';

export default function ChatMessage({
  children,
  role,
}: {
  children?: React.ReactNode;
  role: string;
}) {
  return (
    <div
      className={cn(
        role === 'user'
          ? 'bg-primary text-muted self-end'
          : 'bg-muted self-start',
        'relative max-w-96 rounded-2xl px-4 py-2 leading-tight',
      )}
    >
      {children}
    </div>
  );
}
