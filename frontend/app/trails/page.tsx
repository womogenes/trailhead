'use client';

import { useEffect, useState } from 'react';
import { ForceDirectedGraph } from './force-directed-graph';
import { supabase } from '@/utils/supabase/client';
import { TreesIcon } from 'lucide-react';

export default function TrailsPage() {
  const [graphData, setGraphData]: any = useState({ nodes: [], links: [] });
  const [activeResource, setActiveResource]: any = useState({});

  // Fetch data from supabase
  useEffect(() => {
    (async () => {
      const trailhead_ids =
        (await supabase.from('trails').select('trailhead_id'))?.data?.map(
          ({ trailhead_id }) => trailhead_id,
        ) ?? [];

      const resources =
        (await supabase.from('resources').select('*')).data ?? [];

      console.log(resources);

      const edges = (await supabase.from('edges').select('*')).data ?? [];

      setGraphData({
        nodes: [
          ...resources.map((resource) => ({
            id: resource.id,
            label: resource.title,
            onClick: () => {
              console.log('set active resource:', resource);
              setActiveResource(resource);
            },
          })),
        ],
        links: edges.map(({ id_a, id_b }) => ({ source: id_a, target: id_b })),
      });
    })();
  }, []);

  return (
    <div className="relative flex h-full">
      <p className="text-foreground absolute z-20 self-start rounded-br-md px-6 py-4 text-2xl font-medium">
        My Trails
      </p>

      {graphData.nodes.length === 0 && (
        <div className="mx-auto my-auto flex flex-col gap-2">
          <p>Loading trails...</p>
          <TreesIcon className="mx-auto animate-spin" />
        </div>
      )}

      <div className="absolute left-0 top-0 h-full w-full">
        <ForceDirectedGraph data={graphData} />
      </div>

      {activeResource && (
        <div className="bg-background absolute right-0 top-0 m-2 px-4 py-2">
          <h1>{activeResource.title}</h1>
        </div>
      )}
    </div>
  );
}
