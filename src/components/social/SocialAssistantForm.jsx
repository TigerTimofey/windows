import React from 'react'
import '../blog/BlogAssistantForm.css'

const platformOptions = ['X', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'YouTube']
const toneOptions = ['professional', 'casual', 'formal', 'friendly', 'enthusiastic']

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
          <select
            id="platform"
            name="platform"
            value={form.platform || ''}
            onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
          >
            <option value="">Select platform</option>
            {platformOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {renderErrorTooltip('platform', errors)}
        </label>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Tone
          <select
            id="tone"
            name="tone"
            value={form.tone || ''}
            onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
          >
            <option value="">Select tone</option>
            {toneOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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
        <input
          id="cta"
          name="cta"
          type="text"
          value={form.cta || ''}
          onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
          placeholder="e.g. Learn more"
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
