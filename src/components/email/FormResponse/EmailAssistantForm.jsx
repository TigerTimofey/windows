import React from 'react'
import '../../blog/BlogAssistantForm.css'
import { normalizeSpacing } from '../utils/normalizeSpacing.js'
import { CustomDropdown } from '../../modal/CustomDropdown.jsx'
import { toneOptions } from '../../social/utils/formOptions.js'
import { normalizeForm } from '../../../utils/normalizeInput.js'

async function query(data) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/generate-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: data.prompt })
  });
  const result = await response.json();
  return result;
}

export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates,
  loading, renderErrorTooltip, onStartGenerate,setGenerating
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      sender: f.sender || 'John Doe',
      receiver: f.receiver || 'Jane Smith',
      purpose: f.purpose || 'Welcome new team member and provide onboarding details',
      keyPoints: f.keyPoints || 'Welcome to the team\nProvide onboarding details\nSchedule an introduction meeting',
      tone: f.tone || 'professional',
      length: f.length || '120'
    }))
  }, [setForm])

  return (
    <form className="blog-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.sender || !form.sender.trim()) newErrors.sender = 'Please provide your name.';
        if (!form.receiver || !form.receiver.trim()) newErrors.receiver = 'Please provide the receiver name.';
        if (!form.purpose || !form.purpose.trim()) newErrors.purpose = 'Please provide the email purpose.';
        if (!form.keyPoints || !form.keyPoints.trim()) newErrors.keyPoints = 'Please provide key points.';
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.length || isNaN(parseInt(form.length, 10))) newErrors.length = 'Please provide a valid length.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        const normalizedForm = normalizeForm(form);
        setForm(normalizedForm);
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setEmailResult({ theme: '', message: '' })

        const prompt = buildPrompt(normalizedForm)
        let theme = ''
        let message = ''

        query({ 
          prompt,
          max_tokens: Math.min(4000, Math.max(1000, parseInt(normalizeForm.wordCount) * 2)),
          temperature: 0.7
        }).then(data => {
          if (data.error) {
            setEmailResult({ error: data.error })
            setLoading(false)
            setGenerating(false)
            return
          }
          // Handle Ollama response format
          const text = data.text;
          if (!text) {
            setEmailResult({ error: 'No response generated' })
            setLoading(false)
            return
          }
          message = text
          theme = inferThemeFromMessage(message)
          const final = { theme, message: normalizeSpacing(cleanMessage(removeDuplicates(message))) }
          setEmailResult(final)
          setLoading(false)
        }).catch(err => {
          setEmailResult({ error: err.message })
          setLoading(false)
        })
      }}
    >
      <label className="blog-form-field">
        Sender
        <input
          id="sender"
          name="sender"
          type="text"
          value={form.sender || ''}
          onChange={e => setForm(f => ({ ...f, sender: e.target.value }))}
          placeholder="e.g. John Doe"
        />
        {renderErrorTooltip('sender', errors)}
      </label>
      <label className="blog-form-field">
        Receiver
        <input
          id="receiver"
          name="receiver"
          type="text"
          value={form.receiver || ''}
          onChange={e => setForm(f => ({ ...f, receiver: e.target.value }))}
          placeholder="e.g. Jane Smith"
        />
        {renderErrorTooltip('receiver', errors)}
      </label>
      <label className="blog-form-field">
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
      <label className="blog-form-field">
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
        <label className="blog-form-field" style={{ flex: 1 }}>
          Tone
          <CustomDropdown
            options={toneOptions}
            value={form.tone || ''}
            onChange={(value) => setForm(f => ({ ...f, tone: value }))}
            placeholder="Select tone"
            closeOnSelect={false}
          />
          {renderErrorTooltip('tone', errors)}
        </label>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Length (words)
          <input
            type="text"
            value={form.length || ''}
            onChange={(e) => setForm(f => ({ ...f, length: e.target.value }))}
            placeholder="e.g. 120 or 100-150"
          />
          {renderErrorTooltip('length', errors)}
        </label>
      </div>
      <div className="blog-assistant-btn-row">
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
              tone: '',
              length: ''
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