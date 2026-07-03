import axios from 'axios'
import type { Diagram } from '../types/diagram'

type GenerateDiagramResponse = {
  diagram: Diagram
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

export async function generateDiagram(prompt: string) {
  const response = await api.post<GenerateDiagramResponse>('/diagram/generate', {
    prompt,
  })

  return response.data.diagram
}
