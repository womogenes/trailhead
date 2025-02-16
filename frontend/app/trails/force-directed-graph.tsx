'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color?: string;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export const ForceDirectedGraph = ({ data }: { data: GraphData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 600;
    const height = 400;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Create a group for the zoomed content
    const zoomGroup = svg.append('g');

    // Configure zoom behavior with smooth transition
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        zoomGroup
          .transition()
          .duration(50)
          .ease(d3.easeLinear)
          .attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initialize node positions in a circular layout
    const radius = Math.min(width, height) / 4;
    const centerX = width / 2;
    const centerY = height / 2;

    data.nodes.forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / data.nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // Create force simulation
    const simulation: any = d3
      .forceSimulation<Node & d3.SimulationNodeDatum>()
      .nodes(data.nodes) // Set nodes immediately
      .force(
        'link',
        d3
          .forceLink<Node, Link>()
          .id((d) => d.id)
          .distance(100)
          .strength(0.5)
          .links(data.links), // Set links immediately
      )
      .force(
        'charge',
        d3.forceManyBody().strength(-500).distanceMin(30).distanceMax(300),
      )
      .force('collision', d3.forceCollide().radius(20).strength(0.7))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1));

    // Create the links
    const links = zoomGroup
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Create the nodes
    const nodes = zoomGroup
      .append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', (d) => d.color ?? '#537a38')
      // @ts-ignore
      .call(drag(simulation));

    // Add labels
    const labels = zoomGroup
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.label)
      .attr('class', 'graph-label pointer-events-none')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // Set initial positions before simulation starts
    nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

    labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!);

    links
      .attr('x1', (d: any) => d.source.x!)
      .attr('y1', (d: any) => d.source.y!)
      .attr('x2', (d: any) => d.target.x!)
      .attr('y2', (d: any) => d.target.y!);

    // Update positions on each tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x!)
        .attr('y1', (d: any) => d.source.y!)
        .attr('x2', (d: any) => d.target.x!)
        .attr('y2', (d: any) => d.target.y!);

      nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

      labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    // Drag functionality
    function drag(simulation: any) {
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
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="h-full w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
};
