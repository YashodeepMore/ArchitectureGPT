/*
 * diagramApi is the network communication client.
 *
 * It configures axios to call backend endpoints and encapsulates diagram generation queries,
 * returning raw Diagram document schemas to the application flow.
 */

import axios from 'axios'
import type { Diagram } from '../types/diagram'

type GenerateDiagramResponse = {
  diagram: Diagram
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://architecturegpt.onrender.com/',
})

// Sends the user prompt to the backend and returns the raw Diagram document model.
export async function generateDiagram(prompt: string) {
  const response = await api.post<GenerateDiagramResponse>('/diagram/generate', {
    prompt,
  })

  return response.data.diagram
}

