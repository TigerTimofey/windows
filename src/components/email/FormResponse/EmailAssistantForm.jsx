import React from 'react'

export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates,
  loading, renderErrorTooltip
}) {
  return (
    <form className="email-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.contentType.trim()) newErrors.contentType = 'Please specify the content type.';
        if (!form.context.trim()) newErrors.context = 'Please provide the core content requirements.';
        if (!form.specifications.trim()) newErrors.specifications = 'Please provide content specifications.';
        if (!form.style.trim()) newErrors.style = 'Please specify style parameters.';
        if (!form.generation.trim()) newErrors.generation = 'Please specify generation settings.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        setEmailResult({ theme: '', message: '' })

        const prompt = buildPrompt(form)
        const controller = new AbortController()
        let theme = ''
        let message = ''
        let streamEnded = false
        let buffer = ''

        fetch(`${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/generate-stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        }).then(res => {
          if (!res.body) throw new Error('No response body')
          const reader = res.body.getReader()
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                if (!streamEnded) {
                  streamEnded = true
                  if (!theme) {
                    theme = inferThemeFromMessage(message)
                  }
                  const final = { theme, message: cleanMessage(removeDuplicates(message)) }
                  setEmailResult(final)
                  setLoading(false)
                }
                return
              }
              const chunk = new TextDecoder().decode(value)
              buffer += chunk
              const lines = buffer.split(/\n\n/)
              buffer = lines.pop()
              lines.forEach(line => {
                if (line.startsWith('data: ')) {
                  const data = line.replace('data: ', '')
                  const themeMatch = data.match(/Theme:(.*)/i)
                  const subjectMatch = data.match(/Subject:(.*)/i)
                  if (themeMatch) {
                    theme = themeMatch[1].trim()
                  } else if (subjectMatch && !theme) {
                    theme = subjectMatch[1].trim()
                  }
                  const messageMatch = data.match(/Message:(.*)/is)
                  if (messageMatch) {
                    message += messageMatch[1].trim() + '\n'
                  } else {
                    message += data.trim() + '\n'
                  }
                } else if (line.startsWith('event: error')) {
                  const errMsg = line.replace(/event: error\\ndata: /, '')
                  setEmailResult({ error: errMsg })
                } else if (line.startsWith('event: end')) {
                  if (!streamEnded) {
                    streamEnded = true
                    if (!theme) theme = inferThemeFromMessage(message)
                    const final = { theme, message: cleanMessage(removeDuplicates(message)) }
                    setEmailResult(final)
                  }
                }
              })
              read()
            })
          }
          read()
        }).catch(err => {
          setEmailResult({ error: err.message })
          setLoading(false)
        })
      }}
    >
      <label className="email-form-field">Content Type
        <input
          value={form.contentType}
          onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}
          placeholder="e.g. Email, Blog Post, Report"
        />
        {renderErrorTooltip('contentType', errors)}
      </label>
      <label className="email-form-field">Context (Topic, Purpose, Audience)
        <textarea
          value={form.context}
          onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
          rows={2}
          placeholder="Describe topic, purpose, audience"
        />
        {renderErrorTooltip('context', errors)}
      </label>
      <label className="email-form-field">Content Specifications
        <textarea
          value={form.specifications}
          onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))}
          rows={2}
          placeholder="e.g. word count, platform, format"
        />
        {renderErrorTooltip('specifications', errors)}
      </label>
      <label className="email-form-field">Style Parameters
        <textarea
          value={form.style}
          onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
          rows={2}
          placeholder="e.g. tone, complexity, presentation"
        />
        {renderErrorTooltip('style', errors)}
      </label>
      <label className="email-form-field">Generation Settings
        <input
          value={form.generation}
          onChange={e => setForm(f => ({ ...f, generation: e.target.value }))}
          placeholder="e.g. temperature, max tokens"
        />
        {renderErrorTooltip('generation', errors)}
      </label>
      <div className="email-assistant-btn-row">
        <button type="button" className="modal-btn-text" onClick={() => setEmailResult(null)}>Close</button>
        <button
          type="submit"
          className="modal-btn-text"
          disabled={loading}
          onClick={() => {
            console.log('[EmailAssistant] User data:', { ...form })
          }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  )
}