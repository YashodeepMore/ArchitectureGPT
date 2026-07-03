import type { NodeTypes } from '@xyflow/react'
import { ApiNode } from '../nodes/ApiNode'
import { BackendNode } from '../nodes/BackendNode'
import { CacheNode } from '../nodes/CacheNode'
import { DatabaseNode } from '../nodes/DatabaseNode'
import { ExternalNode } from '../nodes/ExternalNode'
import { FrontendNode } from '../nodes/FrontendNode'
import { GatewayNode } from '../nodes/GatewayNode'
import { GroupNode } from '../nodes/GroupNode'
import { QueueNode } from '../nodes/QueueNode'
import { ServiceNode } from '../nodes/ServiceNode'
import { StorageNode } from '../nodes/StorageNode'

export const nodeTypes: NodeTypes = {
  frontend: FrontendNode,
  backend: BackendNode,
  database: DatabaseNode,
  gateway: GatewayNode,
  queue: QueueNode,
  cache: CacheNode,
  api: ApiNode,
  service: ServiceNode,
  storage: StorageNode,
  external: ExternalNode,
  group: GroupNode,
}
