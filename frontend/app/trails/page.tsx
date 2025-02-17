'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ForceDirectedGraph } from './force-directed-graph';
import { supabase } from '@/utils/supabase/client';
import { ThumbsDownIcon, ThumbsUpIcon, TreesIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { marked } from 'marked';
import Link from 'next/link';

import { AppContext } from '../layout';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export default function TrailsPage() {
  const { appState, setAppState } = useContext(AppContext);
  const { toast } = useToast();

  const [graphData, setGraphData]: any = useState({ nodes: null, links: null });
  const [activeResource, setActiveResource]: any = useState(null);
  const [hoveredResource, setHoveredResource]: any = useState(null);
  const [showHoveredResource, setShowHoveredResource] =
    useState<boolean>(false);
  const infoCardRef = useRef<any>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!infoCardRef.current || activeResource) return;
      infoCardRef.current.style.left = `${e.clientX + 10}px`;
      infoCardRef.current.style.top = `${e.clientY + 10}px`;
    },
    [infoCardRef, activeResource],
  );

  useEffect(() => {
    document.addEventListener('pointermove', handleMouseMove);
    return () => {
      document.removeEventListener('pointermove', handleMouseMove);
    };
  }, [activeResource]);

  // Fetch data from supabase
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setActiveResource(null);
    });

    (async () => {
      const trailhead_ids =
        (await supabase.from('trails').select('trailhead_id'))?.data?.map(
          ({ trailhead_id }) => trailhead_id,
        ) ?? [];

      // Get unique resource IDs
      const edges = (await supabase.from('edges').select('*')).data ?? [];
      const edgeIds =
        (await supabase.from('edges').select('id_a, id_b')).data ?? [];
      const allIds = [
        ...new Set([
          ...edgeIds.map((e) => e.id_a),
          ...edgeIds.map((e) => e.id_b),
        ]),
      ];
      const resources =
        (await supabase.from('resources').select('*').in('id', allIds)).data ??
        [];

      setGraphData({
        nodes: [
          ...resources.map((resource) => ({
            id: resource.id,
            label: resource.title,
            color: trailhead_ids.includes(resource.id)
              ? '#648053'
              : resource.image_url
                ? '#71bf41'
                : null,
            onClick: () => {
              setActiveResource(resource);
              infoCardRef.current.style.cssText = `right: 15px; top: 15px;`;
            },
            onMouseenter: () => {
              setHoveredResource(resource);
              setShowHoveredResource(true);
            },
            onMouseout: () => {
              setShowHoveredResource(false);
            },
          })),
        ],
        links: edges.map(({ id_a, id_b }) => ({ source: id_a, target: id_b })),
      });
    })();
  }, []);

  return (
    <div className="relative flex h-full">
      <Toaster />

      <p className="text-foreground absolute z-10 self-start rounded-br-md px-6 py-4 text-2xl font-medium">
        My Trails
      </p>

      <div
        className={cn(
          showHoveredResource || activeResource ? 'opacity-100' : 'opacity-0',
          activeResource
            ? 'my-auto max-h-[calc(100vh-30px)] overflow-auto transition-all duration-1000'
            : 'max-h-96',
          'bg-background fixed z-10 w-full max-w-96 rounded-md border px-6 py-5 shadow-sm',
        )}
        ref={infoCardRef}
      >
        <div className="flex items-start gap-2">
          <h1 className="font-bold leading-tight">
            {activeResource?.title || hoveredResource?.title}
          </h1>
          {activeResource && (
            <Button
              className="-mr-3 -mt-1.5 ml-auto flex h-8 w-8 shrink-0 rounded-full !p-0"
              variant="ghost"
              size="icon"
              onClick={() => setActiveResource(null)}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <div className="text-muted-foreground my-4 flex gap-2">
          <p className="text-sm">Rate this resource:</p>
          <button
            onClick={() => {
              if (!activeResource) return;
              toast({
                title: 'Rating added +1',
                description: `to resource ${activeResource.id.split('-')[0]}`,
              });
              setAppState({ ...appState, [activeResource?.id]: { rating: 1 } });
            }}
          >
            <ThumbsUpIcon
              className={cn(
                appState?.[activeResource?.id]?.rating === 1 &&
                  `fill-primary stroke-primary`,
                'transition-all',
              )}
              size={16}
            />
          </button>
          <button
            onClick={() => {
              if (!activeResource) return;
              toast({
                title: 'Rating added -1',
                description: `to resource ${activeResource.id.split('-')[0]}`,
              });
              setAppState({ ...appState, [activeResource?.id]: { rating: 0 } });
            }}
          >
            <ThumbsDownIcon
              className={cn(
                appState?.[activeResource?.id]?.rating === 0 &&
                  `fill-primary stroke-primary`,
                'transition-all',
              )}
              size={16}
            />
          </button>
        </div>
        {activeResource?.image_url && (
          <img
            className="mb-3 rounded-lg"
            src={activeResource.image_url}
            alt={activeResource.title}
          />
        )}
        <div
          className={cn(!activeResource && 'mb-2 line-clamp-4 whitespace-pre')}
          dangerouslySetInnerHTML={{
            __html: marked.parse(
              activeResource?.description || hoveredResource?.description || '',
              { gfm: true },
            ),
          }}
        />
        {!activeResource && (
          <p className="text-muted-foreground text-sm">click to expand</p>
        )}
      </div>

      {!graphData.nodes && (
        <div className="mx-auto my-auto flex flex-col gap-2">
          <p>Loading trails...</p>
          <TreesIcon className="mx-auto animate-spin" />
        </div>
      )}

      <div className="absolute left-0 top-0 h-full w-full">
        {graphData.nodes &&
          (graphData.nodes.length > 0 ? (
            <ForceDirectedGraph data={graphData} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p>
                No trails in database. Try <Link href="/">creating one</Link>.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
