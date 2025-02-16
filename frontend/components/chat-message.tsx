import { cn } from '@/lib/utils';
import { marked } from 'marked';

export default function ChatMessage({
  children = '',
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
        'relative max-w-lg rounded-2xl px-4 py-1.5',
      )}
    >
      <div dangerouslySetInnerHTML={{ __html: marked(children as string) }} />
    </div>
  );
}
