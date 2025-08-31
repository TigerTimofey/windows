import React from 'react'
import '../blog/BlogAssistantForm.css'
import { platformOptions, toneOptions, ctaOptions } from './utils/formOptions.js'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'

export function SocialAssistantForm({
  form, setForm, errors, setErrors, setLoading, setSocialResult,
  buildPrompt, extractPosts, extractHashtags, cleanSocialText,
  loading, renderErrorTooltip, onStartGenerate, setGenerating
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      productService: f.productService || 'AI Writing Assistant',
      platform: f.platform || 'LinkedIn',
      goal: f.goal || 'Increase brand awareness',
      tone: f.tone || 'professional',
      cta: f.cta || 'Learn more'
    }))
  }, [setForm])

  return (
    <form className="blog-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.productService || !form.productService.trim()) newErrors.productService = 'Please provide the product/service.';
        if (!form.platform) newErrors.platform = 'Please select platform.';
        if (!form.goal || !form.goal.trim()) newErrors.goal = 'Please provide the goal.';
        if (!form.tone) newErrors.tone = 'Please select tone.';
        if (!form.cta || !form.cta.trim()) newErrors.cta = 'Please provide the CTA.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setSocialResult({ posts: [], hashtags: [] })

        const prompt = buildPrompt(form)
        const controller = new AbortController()

        fetch(`${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/generate-social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        }).then(data => {
          if (data.error) {
            setSocialResult({ error: data.error })
            setLoading(false)
            setGenerating(false)
            return
          }
          const text = data.text
          const posts = extractPosts(text)
          const hashtags = extractHashtags(text)
          const final = {
            posts: posts.map(cleanSocialText),
            hashtags: hashtags.map(cleanSocialText)
          }
          setSocialResult(final)
          setLoading(false)
          setGenerating(false)
        }).catch(err => {
          setSocialResult({ error: err.message })
          setLoading(false)
          setGenerating(false)
        })
      }}
    >
      <label className="blog-form-field">
        Product/Service
        <input
          id="productService"
          name="productService"
          type="text"
          value={form.productService || ''}
          onChange={e => setForm(f => ({ ...f, productService: e.target.value }))}
          placeholder="e.g. AI Writing Assistant"
        />
        {renderErrorTooltip('productService', errors)}
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Platform
          <CustomDropdown
            options={platformOptions}
            value={form.platform || ''}
            onChange={(value) => setForm(f => ({ ...f, platform: value }))}
            placeholder="Select platform"
            closeOnSelect={false}
          />
          {renderErrorTooltip('platform', errors)}
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
      <label className="blog-form-field">
        Goal
        <input
          id="goal"
          name="goal"
          type="text"
          value={form.goal || ''}
          onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
          placeholder="e.g. Increase brand awareness"
        />
        {renderErrorTooltip('goal', errors)}
      </label>
      <label className="blog-form-field">
        CTA
        <CustomDropdown
          options={ctaOptions}
          value={form.cta || ''}
          onChange={(value) => setForm(f => ({ ...f, cta: value }))}
          placeholder="Select CTA"
          closeOnSelect={false}
        />
        {renderErrorTooltip('cta', errors)}
      </label>
      <div className="blog-assistant-btn-row">
        <button
          type="button"
          className="modal-btn-text"
          onClick={() => {
            setSocialResult(null)
            setForm({
              productService: '',
              platform: '',
              goal: '',
              tone: '',
              cta: ''
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
