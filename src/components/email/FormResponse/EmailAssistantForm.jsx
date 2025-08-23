import React from 'react'
import './EmailAssistantForm.css'

const maxWordsOptions = [50, 100, 120, 150, 200]
const complexityOptions = ['simple', 'moderate', 'advanced']
const presentationOptions = ['clear paragraphs', 'bulleted list', 'formal letter']
const temperatureOptions = [0.3, 0.5, 0.7, 1.0]
const maxTokensOptions = [128, 256, 512, 1024]

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
        if (!form.context.trim()) newErrors.context = 'Please provide the core content requirements.';
        if (!form.maxWords) newErrors.maxWords = 'Please select max words.';
        if (!form.complexity) newErrors.complexity = 'Please select complexity.';
        if (!form.presentation) newErrors.presentation = 'Please select presentation.';
        if (!form.temperature) newErrors.temperature = 'Please select temperature.';
        if (!form.maxTokens) newErrors.maxTokens = 'Please select max tokens.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        setEmailResult({ theme: '', message: '' })

        // Compose form for prompt builder, remove format from specifications
        const promptForm = {
          contentType: 'Email',
          context: form.context,
          specifications: `Max ${form.maxWords} words. Platform: Gmail.`,
          style: `Complexity: ${form.complexity}. Presentation: ${form.presentation}.`,
          generation: `temperature=${form.temperature}, max_tokens=${form.maxTokens}`
        }
        const prompt = buildPrompt(promptForm)
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
      {/* Hide contentType, platform, tone, format */}
      <label className="email-form-field">
        Context (Topic, Purpose, Audience)
        <textarea
          value={form.context}
          onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
          rows={2}
          placeholder="eg. describe topic, purpose, audience etc.."
        />
        {renderErrorTooltip('context', errors)}
      </label>
      <label className="email-form-field">
        Max Words
        <select
          value={form.maxWords || ''}
          onChange={e => setForm(f => ({ ...f, maxWords: e.target.value }))}
        >
          <option value="">Select max words</option>
          {maxWordsOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('maxWords', errors)}
      </label>
      <label className="email-form-field">
        Complexity
        <select
          value={form.complexity || ''}
          onChange={e => setForm(f => ({ ...f, complexity: e.target.value }))}
        >
          <option value="">Select complexity</option>
          {complexityOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('complexity', errors)}
      </label>
      <label className="email-form-field">
        Presentation
        <select
          value={form.presentation || ''}
          onChange={e => setForm(f => ({ ...f, presentation: e.target.value }))}
        >
          <option value="">Select presentation</option>
          {presentationOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('presentation', errors)}
      </label>
      <label className="email-form-field">
        Temperature
        <select
          value={form.temperature || ''}
          onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
        >
          <option value="">Select temperature</option>
          {temperatureOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('temperature', errors)}
      </label>
      <label className="email-form-field">
        Max Tokens
        <select
          value={form.maxTokens || ''}
          onChange={e => setForm(f => ({ ...f, maxTokens: e.target.value }))}
        >
          <option value="">Select max tokens</option>
          {maxTokensOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('maxTokens', errors)}
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