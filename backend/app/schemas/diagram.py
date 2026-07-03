from pydantic import BaseModel
from typing import List


class Position(BaseModel):
    x: float
    y: float


class Node(BaseModel):
    id: str
    type: str
    label: str
    position: Position
    parent: str | None = None


class Edge(BaseModel):
    id: str
    source: str
    target: str


class Group(BaseModel):
    id: str
    label: str
    position: Position
    width: float
    height: float


class Diagram(BaseModel):
    id: str
    nodes: list[Node]
    edges: list[Edge]
    groups: list[Group]
    metadata: dict = {}

    


