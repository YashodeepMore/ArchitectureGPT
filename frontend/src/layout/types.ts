import { Position } from "@xyflow/react";
import type { Diagram } from "../types/diagram";

export interface NodeConnectionPosition {
  sourcePosition: Position;
  targetPosition: Position;
}

export type NodeConnectionMap = Map<string, NodeConnectionPosition>;

export interface LayoutResult {
  diagram: Diagram;
  connections: NodeConnectionMap;
}