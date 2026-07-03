import type { Diagram, DiagramNode, DiagramGroup, DiagramEdge } from '../types/diagram'

export function findNodeById(diagram: Diagram, id: string): DiagramNode | undefined {
  return diagram.nodes.find(n => n.id === id);
}

export function findGroupById(diagram: Diagram, id: string): DiagramGroup | undefined {
  return diagram.groups.find(g => g.id === id);
}

export function getChildren(diagram: Diagram, groupId: string): DiagramNode[] {
  return diagram.nodes.filter(n => n.parent === groupId);
}

export function getIncomingEdges(diagram: Diagram, nodeId: string): DiagramEdge[] {
  return diagram.edges.filter(e => e.target === nodeId);
}

export function getOutgoingEdges(diagram: Diagram, nodeId: string): DiagramEdge[] {
  return diagram.edges.filter(e => e.source === nodeId);
}