import React from 'react'
import '../../blog/BlogAssistantForm.css'
import { normalizeSpacing } from '../utils/normalizeSpacing'
import { CustomDropdown } from '../../modal/CustomDropdown.jsx'
import { maxWordsOptions, toneOptions } from '../../social/utils/formOptions.js'

async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/v1/chat/completions",
		{
			headers: {
				Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				messages: [
					{
						role: "user",
						content: data.prompt,
					},
				],
				model: "openai/gpt-oss-20b:together",
				max_tokens: data.max_tokens || 1500,
				temperature: data.temperature || 0.7,
			}),
		}
	);
	const result = await response.json();
	return result;
}

export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates,
  loading, renderErrorTooltip, onStartGenerate, setGenerating
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      sender: f.sender || 'John Doe',
      receiver: f.receiver || 'Jane Smith',
      purpose: f.purpose || 'Welcome new team member and provide onboarding details',
      tone: f.tone || 'professional',
      length: f.length || 120
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
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.length) newErrors.length = 'Please select length.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setEmailResult({ theme: '', message: '' })

        const prompt = buildPrompt(form)
        let theme = ''
        let message = ''

        query({ 
          prompt,
          max_tokens: 1500,
          temperature: 0.7
        }).then(data => {
          if (data.error) {
            setEmailResult({ error: data.error })
            setLoading(false)
            setGenerating(false)
            return
          }
          // Handle Hugging Face router chat completion response format
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            setEmailResult({ error: 'No response generated' })
            setLoading(false)
            setGenerating(false)
            return
          }
          message = text
          theme = inferThemeFromMessage(message)
          const final = { theme, message: normalizeSpacing(cleanMessage(removeDuplicates(message))) }
          setEmailResult(final)
          setLoading(false)
          setGenerating(false)
        }).catch(err => {
          setEmailResult({ error: err.message })
          setLoading(false)
          setGenerating(false)
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
          <CustomDropdown
            options={maxWordsOptions}
            value={form.length || ''}
            onChange={(value) => setForm(f => ({ ...f, length: value }))}
            placeholder="Select length"
            closeOnSelect={false}
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