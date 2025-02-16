'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const ForceDirectedGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Sample data
  const data: GraphData = {
    nodes: [
      { id: 'A', group: 1 },
      { id: 'B', group: 1 },
      { id: 'C', group: 2 },
      { id: 'D', group: 2 },
      { id: 'E', group: 3 },
    ],
    links: [
      { source: 'A', target: 'B', value: 1 },
      { source: 'B', target: 'C', value: 1 },
      { source: 'C', target: 'D', value: 1 },
      { source: 'D', target: 'E', value: 1 },
      { source: 'E', target: 'A', value: 1 },
    ],
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 600;
    const height = 400;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 2]) // Set min and max zoom scale
          .on('zoom', (event) => {
            svg.attr('transform', event.transform);
          }),
      )
      .append('g');

    // Create force simulation
    const simulation: any = d3
      .forceSimulation<Node & d3.SimulationNodeDatum>()
      .force(
        'link',
        d3.forceLink<Node, Link>().id((d) => d.id),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create the links
    const links = svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    // Create the nodes
    const nodes = svg
      .append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => d3.schemeCategory10[d.group])
      // @ts-ignore
      .call(drag(simulation));

    // Add labels
    const labels = svg
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.id)
      .attr('font-size', '12px')
      .attr('dx', 8)
      .attr('dy', 3);

    // Update positions on each tick
    simulation.nodes(data.nodes).on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x!)
        .attr('y1', (d: any) => d.source.y!)
        .attr('x2', (d: any) => d.target.x!)
        .attr('y2', (d: any) => d.target.y!);

      nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

      labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    // Add the links to the simulation
    simulation.force('link')!.links(data.links);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, []);

  // Drag functionality
  const drag = (simulation: any) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag<SVGCircleElement, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  return (
    <div className="h-full w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
};

export default ForceDirectedGraph;
