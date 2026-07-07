import type { FormEvent } from 'react'

type PromptFormProps = {
  prompt: string
  isLoading: boolean
  error: string | null
  onPromptChange: (prompt: string) => void
  onSubmit: () => void
}

// User interface component to collect the prompt text and submit the request to generate a new diagram document.
export function PromptForm({

  prompt,
  isLoading,
  error,
  onPromptChange,
  onSubmit,
}: PromptFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Describe the architecture you want to generate"
        rows={5}
      />
      <button type="submit" disabled={isLoading || prompt.trim().length === 0}>
        {isLoading ? 'Generating...' : 'Generate Diagram'}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  )
}
