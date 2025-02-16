'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ForceDirectedGraph } from './force-directed-graph';
import { supabase } from '@/utils/supabase/client';
import { TreesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            onClick: () => {
              setActiveResource(resource);
              infoCardRef.current.style.cssText = `left: auto; right: 15px; top: 15px;`;
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
          activeResource && 'h-[calc(100%-30px)] transition-all',
          'bg-background fixed z-10 w-full max-w-96 rounded-md border px-4 py-3 shadow-sm',
        )}
        ref={infoCardRef}
      >
        <h1 className="mb-2 font-bold leading-tight">
          {activeResource?.title || hoveredResource?.title}
        </h1>
        <p className={cn(!activeResource && 'mb-2 line-clamp-4')}>
          {activeResource?.description || hoveredResource?.description}
        </p>
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
