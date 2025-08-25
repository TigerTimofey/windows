import React from 'react'
import './EmailAssistantForm.css'
import { normalizeSpacing } from '../utils/normalizeSpacing'

const maxWordsOptions = [50, 100, 120, 150, 200]
const complexityOptions = ['simple', 'moderate', 'advanced']
const temperatureOptions = [0.3, 0.5, 0.7, 1.0]
const maxTokensOptions = [128, 256, 512, 1024]

export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates,
  loading, renderErrorTooltip, onStartGenerate
}) {
  // Example default values
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      content: f.content || 'I would like to welcome you to our team and provide onboarding details.',
      sender: f.sender || 'John Doe',
      receiver: f.receiver || 'Jane Smith',
      maxWords: f.maxWords || 120,
      complexity: f.complexity || 'simple',
      presentation: f.presentation || 'clear paragraphs',
      temperature: f.temperature || 0.7,
      maxTokens: f.maxTokens || 128
    }))
  }, [setForm])
  return (
    <form className="email-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.content || !form.content.trim()) newErrors.content = 'Please provide the email content.';
        if (!form.sender || !form.sender.trim()) newErrors.sender = 'Please provide your name.';
        if (!form.receiver || !form.receiver.trim()) newErrors.receiver = 'Please provide the receiver name.';
        if (!form.maxWords) newErrors.maxWords = 'Please select max words.';
        if (!form.complexity) newErrors.complexity = 'Please select complexity.';
        if (!form.temperature) newErrors.temperature = 'Please select temperature.';
        if (!form.maxTokens) newErrors.maxTokens = 'Please select max tokens.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate() 
        setEmailResult({ theme: '', message: '' })

        const promptForm = {
          contentType: 'Email',
          content: form.content,
          sender: form.sender,
          receiver: form.receiver,
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
                    const final = { theme, message: normalizeSpacing(cleanMessage(removeDuplicates(message))) }
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
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label className="email-form-field" style={{ flex: 1 }}>
          Sender
          <input
            id="sender"
            name="sender"
            type="text"
            value={form.sender || ''}
            onChange={e => setForm(f => ({ ...f, sender: e.target.value }))}
            placeholder="eg. John Doe"
          />
          {renderErrorTooltip('sender', errors)}
        </label>
        <label className="email-form-field" style={{ flex: 1 }}>
          Receiver
          <input
            id="receiver"
            name="receiver"
            type="text"
            value={form.receiver || ''}
            onChange={e => setForm(f => ({ ...f, receiver: e.target.value }))}
            placeholder="eg. Jane Smith"
          />
          {renderErrorTooltip('receiver', errors)}
        </label>
      </div>
      <label className="email-form-field">
        Email Content 
        <textarea
          id="content-message"
          name="content"
          value={form.content || ''}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={3}
          placeholder="Type the main message or topic of your email..."
        />
        {renderErrorTooltip('content', errors)}
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="email-form-field" style={{ flex: 1 }}>
          Max Words
          <select
            id="maxWords"
            name="maxWords"
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
        <label className="email-form-field" style={{ flex: 1 }}>
          Complexity
          <select
            id="complexity"
            name="complexity"
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
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="email-form-field" style={{ flex: 1 }}>
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
        <label className="email-form-field" style={{ flex: 1 }}>
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
      </div>
      <div className="email-assistant-btn-row">
        <button
          type="button"
          className="modal-btn-text"
          onClick={() => {
            setEmailResult(null)
            setForm({
              sender: '',
              receiver: '',
              content: '',
              maxWords: '',
              complexity: '',
              presentation: '',
              temperature: '',
              maxTokens: ''
            })
          }}
        >
          Clear
        </button>
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