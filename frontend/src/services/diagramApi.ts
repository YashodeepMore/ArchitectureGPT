import axios from 'axios'
import type { Diagram } from '../types/diagram'

// API client configuration and network requests.
// Handles API calls to fetch new architecture diagram document models from the backend.
type GenerateDiagramResponse = {
  diagram: Diagram
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

// Sends the user prompt to the backend and returns the raw Diagram document model.
export async function generateDiagram(prompt: string) {
  const response = await api.post<GenerateDiagramResponse>('/diagram/generate', {
    prompt,
  })

  return response.data.diagram
}

