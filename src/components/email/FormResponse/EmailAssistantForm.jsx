import React from 'react'
import '../../blog/BlogAssistantForm.css'
import { normalizeSpacing } from '../utils/normalizeSpacing'
import { CustomDropdown } from '../../modal/CustomDropdown.jsx'
import { toneOptions } from '../../social/utils/formOptions.js'
import {normalizeForm} from '../../../utils/normalizeInput.js'
import { getUserFriendlyError } from '../../../utils/errorUtils.js'
import ErrorModal from '../../modal/ErrorModal.jsx'

async function query(data) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 60000);

	try {
		const response = await fetch(
			import.meta.env.VITE_HF_API_URL,
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
				signal: controller.signal,
			}
		);
		clearTimeout(timeoutId);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: The requested AI service endpoint was not found. Please try again later.`);
		}
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			throw new Error('Invalid response format from server');
		}
		const result = await response.json();
		return result;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error('Request timed out after 60 seconds. Please try again.');
		}
		throw error;
	}
}export function EmailAssistantForm({
  form, setForm, errors, setErrors, setLoading, setEmailResult,
  buildPrompt, inferThemeFromMessage, cleanMessage, removeDuplicates, parseEmailStructure,
  loading, renderErrorTooltip, onStartGenerate, setGenerating
}) {
  const [errorModalOpen, setErrorModalOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const parseLength = (lengthStr) => {
    if (/^\d+$/.test(lengthStr)) {
      return parseInt(lengthStr, 10);
    } else if (/^\d+-\d+$/.test(lengthStr)) {
      const [, max] = lengthStr.split('-').map(Number);
      return max;
    }
    return 120; // default
  };

  React.useEffect(() => {
    setForm(f => ({
      ...f,
      sender: f.sender || 'John Doe',
      receiver: f.receiver || 'Jane Smith',
      recipientContext: f.recipientContext || 'A new team member joining the marketing department',
      purpose: f.purpose || 'Welcome new team member and provide onboarding details',
      keyPoints: f.keyPoints || 'Welcome to the team\nProvide onboarding details\nSchedule an introduction meeting',
      tone: f.tone || 'professional',
      length: f.length || '120'
    }))
  }, [setForm])

  return (
    <>
      <form className="blog-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.sender || !form.sender.trim()) newErrors.sender = 'Please provide your name.';
        if (!form.receiver || !form.receiver.trim()) newErrors.receiver = 'Please provide the receiver name.';
        if (!form.recipientContext || !form.recipientContext.trim()) newErrors.recipientContext = 'Please provide recipient context.';
        if (!form.purpose || !form.purpose.trim()) newErrors.purpose = 'Please provide the email purpose.';
        if (!form.keyPoints || !form.keyPoints.trim()) newErrors.keyPoints = 'Please provide key points.';
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.length || !/^\d+$|^\d+-\d+$/.test(form.length.trim())) newErrors.length = 'Please provide a valid length (e.g. 100 or 100-150).';
        if (form.length && /^\d+$/.test(form.length.trim())) {
          const num = parseInt(form.length.trim(), 10);
          if (num <= 0) newErrors.length = 'Length must be a positive number.';
        }
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

        let temp = 0.7;
        switch (normalizedForm.tone) {
          case 'professional': temp = 0.5; break;
          case 'formal': temp = 0.6; break;
          case 'friendly': temp = 0.7; break;
          case 'casual': temp = 0.8; break;
          case 'enthusiastic': temp = 0.9; break;
        }

        query({ 
          prompt,
          max_tokens: Math.min(4000, Math.max(1000, parseLength(normalizedForm.length) * 2)),
          temperature: temp
        }).then(data => {
          if (data.error) {
            setErrorMessage(getUserFriendlyError(data.error))
            setErrorModalOpen(true)
            setLoading(false)
            setGenerating(false)
            return
          }
          // Handle Hugging Face router chat completion response format
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            setErrorMessage('No response generated')
            setErrorModalOpen(true)
            setLoading(false)
            setGenerating(false)
            return
          }
          message = parseEmailStructure(text)
          theme = inferThemeFromMessage(message)
          const final = { theme, message: normalizeSpacing(cleanMessage(removeDuplicates(message))) }
          const wordCount = final.message.split(/\s+/).filter(word => word.length > 0).length;
          let target, lower, upper, warning = null;
          if (/^\d+-\d+$/.test(normalizedForm.length)) {
            const [min, max] = normalizedForm.length.split('-').map(Number);
            target = `${min}-${max}`;
            lower = min;
            upper = max;
            if (wordCount < lower) {
              warning = `Word count (${wordCount}) is below the minimum target (${min}).`;
            } else if (wordCount > upper) {
              warning = `Word count (${wordCount}) is above the maximum target (${max}).`;
            }
          } else {
            target = parseInt(normalizedForm.length);
            const tolerance = 0.1;
            lower = target * (1 - tolerance);
            upper = target * (1 + tolerance);
            if (wordCount < lower) {
              warning = `Word count (${wordCount}) is below target (${target}) by more than 10%.`;
            } else if (wordCount > upper) {
              warning = `Word count (${wordCount}) is above target (${target}) by more than 10%.`;
            }
          }
          setEmailResult({ ...final, wordCount, warning })
          setLoading(false)
          setGenerating(false)
        }).catch(err => {
          setErrorMessage(getUserFriendlyError(err.message))
          setErrorModalOpen(true)
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
        Recipient Context
        <input
          id="recipientContext"
          name="recipientContext"
          type="text"
          value={form.recipientContext || ''}
          onChange={e => setForm(f => ({ ...f, recipientContext: e.target.value }))}
          placeholder="e.g. A new team member joining the marketing department"
        />
        {renderErrorTooltip('recipientContext', errors)}
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
            placeholder="e.g. 100 or 100-150"
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
              recipientContext: '',
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
    <ErrorModal
      open={errorModalOpen}
      message={errorMessage}
      onClose={() => setErrorModalOpen(false)}
      zIndex={200}
    />
    </>
  )
}