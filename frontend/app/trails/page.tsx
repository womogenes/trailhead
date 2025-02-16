'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ForceDirectedGraph } from './force-directed-graph';
import { supabase } from '@/utils/supabase/client';
import { TreesIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { marked } from 'marked';

export default function TrailsPage() {
  const [graphData, setGraphData]: any = useState({ nodes: [], links: [] });
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
            color: trailhead_ids.includes(resource.id) ? '#648053' : null,
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
      <p className="text-foreground absolute z-10 self-start rounded-br-md px-6 py-4 text-2xl font-medium">
        My Trails
      </p>

      <div
        className={cn(
          showHoveredResource || activeResource ? 'opacity-100' : 'opacity-0',
          activeResource
            ? 'my-auto h-auto transition-all duration-1000'
            : 'max-h-96',
          'bg-background fixed z-10 w-full max-w-96 rounded-md border px-6 py-5 shadow-sm',
        )}
        ref={infoCardRef}
      >
        <div className="mb-2 flex items-start gap-2">
          <h1 className="font-bold leading-tight">
            {activeResource?.title || hoveredResource?.title}
          </h1>
          {activeResource && (
            <Button
              className="-mt-1.5 ml-auto flex h-8 w-8 shrink-0 rounded-full !p-0"
              variant="ghost"
              size="icon"
              onClick={() => setActiveResource(null)}
            >
              <XIcon />
            </Button>
          )}
        </div>
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

      {graphData.nodes.length === 0 && (
        <div className="mx-auto my-auto flex flex-col gap-2">
          <p>Loading trails...</p>
          <TreesIcon className="mx-auto animate-spin" />
        </div>
      )}

      <div className="absolute left-0 top-0 h-full w-full">
        <ForceDirectedGraph data={graphData} />
      </div>

      {/* {activeResource && (
        <div className="bg-background absolute right-0 top-0 m-2 px-4 py-2">
          <h1>{activeResource.title}</h1>
        </div>
      )} */}
    </div>
  );
}
