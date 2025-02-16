'use client';

import { ForceDirectedGraph } from './force-directed-graph';

export default function TrailsPage() {
  const data = {
    nodes: [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' },
    ],
    links: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '1', target: '3' },
    ],
  };

  return (
    <div className="h-full">
      <ForceDirectedGraph data={data} />
    </div>
  );
}
