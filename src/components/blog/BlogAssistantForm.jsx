import React from 'react'
import './BlogAssistantForm.css'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'
import { toneOptions, seoFocusOptions, expertiseLevelOptions } from '../social/utils/formOptions.js'
import { normalizeForm } from '../../utils/normalizeInput.js'
import { getUserFriendlyError } from '../../utils/errorUtils.js'

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
				max_tokens: data.max_tokens || 2000,
				temperature: data.temperature || 0.7,
			}),
		}
	);
	if (!response.ok) {
    throw new Error(`HTTP ${response.status}: The requested AI service endpoint was not found. Please try again later.`);
	}
	const contentType = response.headers.get('content-type');
	if (!contentType || !contentType.includes('application/json')) {
		throw new Error('Invalid response format from server');
	}
	const result = await response.json();
	return result;
}

export function BlogAssistantForm({
  form, setForm, errors, setErrors, setLoading, setBlogResult,
  buildPrompt, extractTitle, extractIntro, extractBody, extractConclusion, cleanBlogText,
  loading, renderErrorTooltip, onStartGenerate,
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      topic: f.topic || 'The Future of AI in Business',
      targetAudience: f.targetAudience || 'Business professionals and entrepreneurs',
      wordCount: f.wordCount || '1000',
      tone: f.tone || 'professional',
      seoFocus: f.seoFocus || 'yes',
      expertiseLevel: f.expertiseLevel || 'intermediate'
    }))
  }, [setForm])

  return (
    <form className="blog-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.topic || !form.topic.trim()) newErrors.topic = 'Please provide the blog topic.';
        if (!form.targetAudience || !form.targetAudience.trim()) newErrors.targetAudience = 'Please provide the target audience.';
        if (!form.wordCount || isNaN(parseInt(form.wordCount, 10))) newErrors.wordCount = 'Please provide a valid word count.';
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.seoFocus) newErrors.seoFocus = 'Please select SEO focus.';
        if (!form.expertiseLevel) newErrors.expertiseLevel = 'Please select expertise level.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        const normalizedForm = normalizeForm(form);
        setForm(normalizedForm);
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setBlogResult({ title: '', intro: '', body: '', conclusion: '' })

        const prompt = buildPrompt(normalizedForm)
        let title = ''
        let intro = ''
        let body = ''
        let conclusion = ''

        let temp = 0.7;
        switch (form.tone) {
          case 'professional': temp = 0.5; break;
          case 'formal': temp = 0.6; break;
          case 'friendly': temp = 0.7; break;
          case 'casual': temp = 0.8; break;
          case 'enthusiastic': temp = 0.9; break;
        }

        query({ 
          prompt,
          max_tokens: Math.min(4000, Math.max(1000, parseInt(normalizedForm.wordCount) * 2)),
          temperature: temp
        }).then(data => {
          if (data.error) {
            setBlogResult({ error: getUserFriendlyError(data.error) })
            setLoading(false)
            return
          }
          // Handle Hugging Face router chat completion response format
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            setBlogResult({ error: 'No response generated' })
            setLoading(false)
            return
          }
          title = extractTitle(text)
          intro = extractIntro(text)
          body = extractBody(text)
          conclusion = extractConclusion(text)
          const final = {
            title: cleanBlogText(title),
            intro: cleanBlogText(intro),
            body: cleanBlogText(body),
            conclusion: cleanBlogText(conclusion)
          }
          const combinedText = [final.title, final.intro, final.body, final.conclusion].join(' ');
          const wordCount = combinedText.split(/\s+/).filter(word => word.length > 0).length;
          const target = parseInt(normalizedForm.wordCount);
          const tolerance = 0.1;
          const lower = target * (1 - tolerance);
          const upper = target * (1 + tolerance);
          let warning = null;
          if (wordCount < lower) {
            warning = `Word count (${wordCount}) is below target (${target}) by more than 10%.`;
          } else if (wordCount > upper) {
            warning = `Word count (${wordCount}) is above target (${target}) by more than 10%.`;
          }
          setBlogResult({ ...final, wordCount, warning })
          setLoading(false)
        }).catch(err => {
          setBlogResult({ error: getUserFriendlyError(err.message) })
          setLoading(false)
        })
      }}
    >
      <label className="blog-form-field">
        Topic
        <input
          id="topic"
          name="topic"
          type="text"
          value={form.topic || ''}
          onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
          placeholder="e.g. The Future of AI in Business"
        />
        {renderErrorTooltip('topic', errors)}
      </label>
      <label className="blog-form-field">
        Target Audience
        <input
          id="targetAudience"
          name="targetAudience"
          type="text"
          value={form.targetAudience || ''}
          onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
          placeholder="e.g. Business professionals and entrepreneurs"
        />
        {renderErrorTooltip('targetAudience', errors)}
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Word Count
          <input
            type="text"
            value={form.wordCount || ''}
            onChange={(e) => setForm(f => ({ ...f, wordCount: e.target.value }))}
            placeholder="e.g. 1000 or 800-1200"
          />
          {renderErrorTooltip('wordCount', errors)}
        </label>
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
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="blog-form-field" style={{ flex: 1 }}>
          SEO Focus
          <CustomDropdown
            options={seoFocusOptions}
            value={form.seoFocus || ''}
            onChange={(value) => setForm(f => ({ ...f, seoFocus: value }))}
            placeholder="Select SEO focus"
            closeOnSelect={false}
          />
          {renderErrorTooltip('seoFocus', errors)}
        </label>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Expertise Level
          <CustomDropdown
            options={expertiseLevelOptions}
            value={form.expertiseLevel || ''}
            onChange={(value) => setForm(f => ({ ...f, expertiseLevel: value }))}
            placeholder="Select expertise level"
            closeOnSelect={false}
          />
          {renderErrorTooltip('expertiseLevel', errors)}
        </label>
      </div>
      <div className="blog-assistant-btn-row">
        <button
          type="button"
          className="modal-btn-text"
          onClick={() => {
            setBlogResult(null)
            setForm({
              topic: '',
              targetAudience: '',
              wordCount: '',
              tone: '',
              seoFocus: '',
              expertiseLevel: ''
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
