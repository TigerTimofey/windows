import React, { useEffect, useState } from 'react'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost'
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '5000'
import { useErrorMail } from '../../../utils/ErrorHandler/useErrorMail.jsx'
import ModalWindow from '../../modal/ModalWindow.jsx'
import { WinDropdown } from '../../../utils/WinDropdown/WinDropdown.jsx'
import './EmailAssistant.css'

export function EmailAssistant({ open, onClose, zIndex, onActivate, appName = 'Email Assistant' }) {
  const { renderErrorTooltip } = useErrorMail()
  const [errors, setErrors] = useState({})
  const [installStep, setInstallStep] = useState(0) // 0 installing, 1 form
  const [form, setForm] = useState({
    contentType: 'Email',
    context: 'Welcome email for new developer Tim. Purpose: onboarding. Audience: Tim and HR Manager Jane Smith.',
    specifications: 'Max 120 words. Format: plain text. Platform: Gmail.',
    style: 'Tone: friendly, professional. Complexity: simple. Presentation: clear paragraphs.',
    generation: 'temperature=0.7, max_tokens=256'
  })
  const [emailResult, setEmailResult] = useState(null)
  const [loading, setLoading] = useState(false)


  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || BACKEND_URL
  const VITE_BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || BACKEND_PORT

  // Reset state when opened
  useEffect(() => {
    if (open) {
      // Reset to install step when reopened
      setInstallStep(0)
    }
  }, [open])

  if (!open) return null

  return (
    <ModalWindow
      title={installStep === 0 ? 'Installing Email Client...' : appName}
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      {installStep === 0 ? (
        <div className="email-assistant-install">
          <p className="email-assistant-install-text">Preparing components...</p>
          <div className="email-assistant-progress-bar">
            <div
              className="email-assistant-progress"
              onAnimationEnd={() => setInstallStep(1)}
            />
          </div>
        </div>
      ) : (
        <>
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

              // Compose a generic, flexible prompt for any content type
              const prompt = `
You are an expert AI writing assistant.

Content type: ${form.contentType}
Context: ${form.context}
Specifications: ${form.specifications}
Style: ${form.style}
Generation settings: ${form.generation}

TASK:
Generate 2-3 sentences of the requested content according to the above details.
Strictly follow the specifications and style parameters.
Do not add explanations or extra information.
              `.trim()

              // Use EventSource for SSE streaming
              const controller = new AbortController()
              let theme = ''
              let message = ''
              let streamEnded = false
              let buffer = ''

              // Helper: infer a short theme from the generated message
              const inferThemeFromMessage = (msg) => {
                if (!msg) return ''
                // Remove placeholders like [Your Name], collapse whitespace
                const cleaned = msg.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
                if (!cleaned) return ''
                // Take the first sentence or first line
                const first = cleaned.split(/[.\n]/)[0].trim()
                const words = first.split(' ').filter(Boolean)
                return words.slice(0, 6).join(' ')
              }

              // Helper: clean up message, remove excessive newlines and whitespace
              const cleanMessage = (msg) => {
                if (!msg) return ''
                let cleaned = msg.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
                // Remove leading/trailing newlines
                cleaned = cleaned.replace(/^\n+|\n+$/g, '')
                // If message is empty or only whitespace, return '(none)'
                if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)'
                return cleaned
              }

              fetch(`${VITE_BACKEND_URL}:${VITE_BACKEND_PORT}/generate-stream`, {
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
                        const final = { theme, message }
                        setEmailResult(final)
                        console.log('[EmailAssistant] Final generated result:', final)
                        setLoading(false)
                      }
                      return
                    }
                    const chunk = new TextDecoder().decode(value)
                    buffer += chunk
                    // Parse SSE chunks
                    const lines = buffer.split(/\n\n/)
                    buffer = lines.pop() // keep incomplete chunk
                    lines.forEach(line => {
                      if (line.startsWith('data: ')) {
                        const data = line.replace('data: ', '')
                        // Accumulate message and try to capture Theme/Subject
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
                        // Clean up message before displaying
                        const result = { theme, message: cleanMessage(message)}
                        setEmailResult(result)
                        // console.log('[EmailAssistant] Streaming partial result:', result)
                      } else if (line.startsWith('event: error')) {
                        const errMsg = line.replace(/event: error\\ndata: /, '')
                        setEmailResult({ error: errMsg })
                      } else if (line.startsWith('event: end')) {
                        if (!streamEnded) {
                          streamEnded = true
                          if (!theme) theme = inferThemeFromMessage(message)
                          const final = { theme, message: cleanMessage(message) }
                          setEmailResult(final)
                          console.log('[EmailAssistant] SSE end event - final result:', final)
                        }
                      }
                    })
                    read()
                  })
                }
                read()
              }).catch(err => {
                setEmailResult({ error: err.message })
                console.error('[EmailAssistant] Fetch/stream error:', err)
                setLoading(false)
              })
            }}>
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
            <button type="button" className="modal-btn-text" onClick={onClose}>Close</button>
            <button
              type="submit"
              className="modal-btn-text"
              disabled={loading}
              onClick={() => {
                // Log only user-provided raw data
                console.log('[EmailAssistant] User data:', {
                  contentType: form.contentType,
                  context: form.context,
                  specifications: form.specifications,
                  style: form.style,
                  generation: form.generation
                })
              }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          </form>
          {emailResult && (
            <div className="email-assistant-result">
              <div className="email-assistant-result-title">Generated Email:</div>
     
                <>
                  <div className="email-assistant-theme"><b>Theme:</b> {emailResult.theme || '(none)'}</div>
                  <div><b>Message:</b></div>
                  <pre className="email-assistant-message">{emailResult.message || '(none)'}</pre>
                </>
              
            </div>
          )}
        </>
      )}
    </ModalWindow>
  )
}