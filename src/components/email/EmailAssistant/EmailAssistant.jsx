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
    purpose: 'Notification of Organizational Changes',
    recipientContext: 'HR Manager, responsible for employee communications',
    keyPoints: 'Upcoming layoff, support resources, next steps',
    tone: 'Professional',
    urgency: 'High',
    cta: 'Reply to Confirm'
  })
  const [emailResult, setEmailResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const toneOptions = ['Professional', 'Friendly', 'Formal', 'Casual']
  const urgencyOptions = ['Low', 'Normal', 'High', 'Critical']
  const ctaOptions = ['Schedule a Call', 'Reply to Confirm', 'Approve Request', 'Provide Feedback', 'Other']

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
        <div style={{ width: '100%', textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>Preparing components...</p>
          <div style={{ width: '80%', height: 16, border: '2px inset #fff', background: '#dcdcdc', margin: '0 auto', position: 'relative' }}>
            <div
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: '#1e4e8c', animation: 'emailProgress 1.05s linear forwards' }}
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
              if (!form.purpose.trim()) newErrors.purpose = 'Please provide the purpose.';
              if (!form.recipientContext.trim()) newErrors.recipientContext = 'Please provide the recipient context.';
              if (!form.keyPoints.trim()) newErrors.keyPoints = 'Please provide key points.';
              if (!form.tone.trim()) newErrors.tone = 'Please select a tone.';
              if (!form.urgency.trim()) newErrors.urgency = 'Please select urgency.';
              if (!form.cta.trim()) newErrors.cta = 'Please select a CTA.';
              setErrors(newErrors);
              if (Object.keys(newErrors).length > 0) return;
              setLoading(true)
              setEmailResult({ theme: '', message: '' })

              // Compose prompt for Ollama as a sample template
              const prompt = `You are an assistant that helps draft email templates. Write a SHORT SAMPLE email template for an HR manager about a layoff scenario. Do not assume it is real — just provide a professional example.\n\nDetails:\n- Recipient: ${form.recipientContext}\n- Subject: ${form.purpose}\n- Context: ${form.keyPoints}\n- Tone: ${form.tone}, respectful\n- Urgency: ${form.urgency}\n- Call to Action: ${form.cta}\n\nPlease include at the top a one-line Theme: (5-8 words) that summarizes the email, then a Subject: line, then Message: with the email body. Keep Theme short and explicit.\n\nFormat as:\nTheme: ...\nSubject: ...\nMessage: ...`

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
                      }
                      setLoading(false)
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
                        const result = { theme, message }
                        setEmailResult(result)
                        console.log('[EmailAssistant] Streaming partial result:', result)
                      } else if (line.startsWith('event: error')) {
                        const errMsg = line.replace(/event: error\\ndata: /, '')
                        setEmailResult({ error: errMsg })
                        setLoading(false)
                      } else if (line.startsWith('event: end')) {
                        if (!streamEnded) {
                          streamEnded = true
                          if (!theme) theme = inferThemeFromMessage(message)
                          const final = { theme, message }
                          setEmailResult(final)
                          console.log('[EmailAssistant] SSE end event - final result:', final)
                        }
                        setLoading(false)
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
            <label className="email-form-field">Purpose
              <input
                value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                placeholder="Describe the purpose of your email"
              />
              {renderErrorTooltip('purpose', errors)}
            </label>
            <label className="email-form-field">Recipient Context
              <textarea
                value={form.recipientContext}
                onChange={e => setForm(f => ({ ...f, recipientContext: e.target.value }))}
                rows={2}
                placeholder="Who is the recipient? (role, relationship)"
              />
              {renderErrorTooltip('recipientContext', errors)}
            </label>
            <label className="email-form-field">Key Points / Messages
              <textarea
                value={form.keyPoints}
                onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))}
                rows={3}
                placeholder="List key points or messages to include"
              />
              {renderErrorTooltip('keyPoints', errors)}
            </label>
          <div style={{position:'relative'}}>
            <WinDropdown
              label="Tone"
              value={form.tone}
              onChange={v => setForm(f => ({ ...f, tone: v }))}
              options={toneOptions}
              placeholder="Select tone"
            />
            {renderErrorTooltip('tone', errors)}
          </div>
          <div style={{position:'relative'}}>
            <WinDropdown
              label="Urgency"
              value={form.urgency}
              onChange={v => setForm(f => ({ ...f, urgency: v }))}
              options={urgencyOptions}
              placeholder="Select urgency"
            />
            {renderErrorTooltip('urgency', errors)}
          </div>
          <div style={{position:'relative'}}>
            <WinDropdown
              label="CTA"
              value={form.cta}
              onChange={v => setForm(f => ({ ...f, cta: v }))}
              options={ctaOptions}
              placeholder="Select CTA"
            />
            {renderErrorTooltip('cta', errors)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="modal-btn-text" onClick={onClose}>Close</button>
            <button type="submit" className="modal-btn-text"
              onClick={() => {
                // Log only user-provided raw data
                console.log('[EmailAssistant] User data:', {
                  purpose: form.purpose,
                  recipientContext: form.recipientContext,
                  keyPoints: form.keyPoints,
                  tone: form.tone,
                  urgency: form.urgency,
                  cta: form.cta
                })
              }}
            >Save</button>
          </div>
          </form>
          {loading && (
            <div style={{marginTop:12, color:'#1e4e8c'}}>
              Generating email...
              {/* Optionally add a spinner here */}
            </div>
          )}
          {emailResult && (
            <div style={{marginTop:16, background:'#f2f2f2', border:'1px solid #b5b5b5', borderRadius:4, padding:12}}>
              <div style={{fontWeight:'bold', marginBottom:8}}>Generated Email:</div>
              {emailResult.error ? (
                <div style={{color:'red'}}>{emailResult.error}</div>
              ) : (
                <>
                  <div style={{marginBottom:8}}><b>Theme:</b> {emailResult.theme || '(none)'}</div>
                  <div><b>Message:</b></div>
                  <pre style={{whiteSpace:'pre-wrap', fontSize:13, margin:0}}>{emailResult.message || '(none)'}</pre>
                </>
              )}
            </div>
          )}
        </>
      )}
    </ModalWindow>
  )
}
