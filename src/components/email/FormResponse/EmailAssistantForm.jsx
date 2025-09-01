import React from 'react'
import './EmailAssistantForm.css'
import { normalizeSpacing } from '../utils/normalizeSpacing'
import { CustomDropdown } from '../../modal/CustomDropdown.jsx'
import { maxWordsOptions, complexityOptions, presentationOptions, temperatureOptions, maxTokensOptions } from '../../social/utils/formOptions.js'

export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates,
  loading, renderErrorTooltip, onStartGenerate
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      sender: f.sender || 'John Doe',
      receiver: f.receiver || 'Jane Smith',
      purpose: f.purpose || 'Welcome new team member and provide onboarding details',
      keyPoints: f.keyPoints || 'Welcome to the team\nProvide onboarding details\nSchedule an introduction meeting',
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
        if (!form.sender || !form.sender.trim()) newErrors.sender = 'Please provide your name.';
        if (!form.receiver || !form.receiver.trim()) newErrors.receiver = 'Please provide the receiver name.';
        if (!form.purpose || !form.purpose.trim()) newErrors.purpose = 'Please provide the email purpose.';
        if (!form.keyPoints || !form.keyPoints.trim()) newErrors.keyPoints = 'Please provide key points.';
        if (!form.maxWords) newErrors.maxWords = 'Please select max words.';
        if (!form.complexity) newErrors.complexity = 'Please select complexity.';
        if (!form.presentation) newErrors.presentation = 'Please select presentation.';
        if (!form.temperature) newErrors.temperature = 'Please select temperature.';
        if (!form.maxTokens) newErrors.maxTokens = 'Please select max tokens.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate() 
        setEmailResult({ theme: '', message: '' })

        const promptForm = {
          contentType: 'Email',
          purpose: form.purpose,
          keyPoints: form.keyPoints,
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
                  // Clean up the message - remove extra spaces and normalize
                  const cleanedMessage = message.replace(/\s+/g, ' ').trim()
                  const final = { theme, message: cleanedMessage }
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
                  // Collect raw chunks without adding extra spaces
                  if (data.trim()) {
                    message += data
                  }
                } else if (line.startsWith('event: error')) {
                  const errMsg = line.replace(/event: error\\ndata: /, '')
                  setEmailResult({ error: errMsg })
                } else if (line.startsWith('event: end')) {
                  if (!streamEnded) {
                    streamEnded = true
                    if (!theme) theme = inferThemeFromMessage(message)
                    // Apply comprehensive cleaning and normalization
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
        Purpose
        <input
          id="purpose"
          name="purpose"
          type="text"
          value={form.purpose || ''}
          onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
          placeholder="e.g. Welcome new team member and provide onboarding details"
        />
        {renderErrorTooltip('purpose', errors)}
      </label>
      <label className="email-form-field">
        Key Points
        <textarea
          id="keyPoints"
          name="keyPoints"
          value={form.keyPoints || ''}
          onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))}
          placeholder="e.g. Welcome to the team&#10;Provide onboarding details&#10;Schedule an introduction meeting"
          rows="3"
        />
        {renderErrorTooltip('keyPoints', errors)}
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="email-form-field" style={{ flex: 1 }}>
          Max Words
          <CustomDropdown
            options={maxWordsOptions}
            value={form.maxWords || ''}
            onChange={(value) => setForm(f => ({ ...f, maxWords: value }))}
            placeholder="Select max words"
            closeOnSelect={false}
          />
          {renderErrorTooltip('maxWords', errors)}
        </label>
                <label className="email-form-field" style={{ flex: 1 }}>
          Temperature
          <CustomDropdown
            options={temperatureOptions}
            value={form.temperature || ''}
            onChange={(value) => setForm(f => ({ ...f, temperature: value }))}
            placeholder="Select temperature"
            closeOnSelect={false}
          />
          {renderErrorTooltip('temperature', errors)}
        </label>
        <label className="email-form-field" style={{ flex: 1 }}>
          Max Tokens
          <CustomDropdown
            options={maxTokensOptions}
            value={form.maxTokens || ''}
            onChange={(value) => setForm(f => ({ ...f, maxTokens: value }))}
            placeholder="Select max tokens"
            closeOnSelect={false}
          />
          {renderErrorTooltip('maxTokens', errors)}
        </label>
     
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
   <label className="email-form-field" style={{ flex: 1 }}>
          Complexity
          <CustomDropdown
            options={complexityOptions}
            value={form.complexity || ''}
            onChange={(value) => setForm(f => ({ ...f, complexity: value }))}
            placeholder="Select complexity"
            closeOnSelect={false}
          />
          {renderErrorTooltip('complexity', errors)}
        </label>
        <label className="email-form-field" style={{ flex: 1 }}>
          Presentation
          <CustomDropdown
            options={presentationOptions}
            value={form.presentation || ''}
            onChange={(value) => setForm(f => ({ ...f, presentation: value }))}
            placeholder="Select presentation"
            closeOnSelect={false}
          />
          {renderErrorTooltip('presentation', errors)}
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
              purpose: '',
              keyPoints: '',
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
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  )
}