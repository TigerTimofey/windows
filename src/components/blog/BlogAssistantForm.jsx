import React from 'react'
import './BlogAssistantForm.css'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'
import { wordCountOptions, toneOptions, seoFocusOptions, expertiseLevelOptions } from '../social/utils/formOptions.js'

export function BlogAssistantForm({
  form, setForm, errors, setErrors, setLoading, setBlogResult,
  buildPrompt, extractTitle, extractIntro, extractBody, extractConclusion, cleanBlogText,
  loading, renderErrorTooltip, onStartGenerate
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      topic: f.topic || 'The Future of AI in Business',
      targetAudience: f.targetAudience || 'Business professionals and entrepreneurs',
      wordCount: f.wordCount || 1000,
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
        if (!form.wordCount) newErrors.wordCount = 'Please select word count.';
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.seoFocus) newErrors.seoFocus = 'Please select SEO focus.';
        if (!form.expertiseLevel) newErrors.expertiseLevel = 'Please select expertise level.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setBlogResult({ title: '', intro: '', body: '', conclusion: '' })

        const prompt = buildPrompt(form)
        const controller = new AbortController()
        let title = ''
        let intro = ''
        let body = ''
        let conclusion = ''

        fetch(`${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/generate-blog`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        }).then(data => {
          if (data.error) {
            setBlogResult({ error: data.error })
            setLoading(false)
            return
          }
          const text = data.text
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
          setBlogResult(final)
          setLoading(false)
        }).catch(err => {
          setBlogResult({ error: err.message })
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
          <CustomDropdown
            options={wordCountOptions}
            value={form.wordCount || ''}
            onChange={(value) => setForm(f => ({ ...f, wordCount: value }))}
            placeholder="Select word count"
            closeOnSelect={false}
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
