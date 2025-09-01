import React from 'react'
import '../blog/BlogAssistantForm.css'
import { platformOptions, toneOptions, ctaOptions } from './utils/formOptions.js'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'
import normalizeForm from '../../utils/normalizeInput.js'


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

        query({ 
          prompt,
          max_tokens: Math.min(4000, Math.max(1000, parseInt(normalizeForm.wordCount) * 2)),
          temperature: 0.7
        }).then(data => {
          if (data.error) {
            setSocialResult({ error: data.error })
            setLoading(false)
            setGenerating(false)
            return
          }
          // Handle Hugging Face router chat completion response format
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            setSocialResult({ error: 'No response generated' })
            setLoading(false)
            setGenerating(false)
            return
          }
          let posts = extractPosts(text)
          let hashtags = extractHashtags(text)

          // Fallback: If no posts extracted, create basic posts
          if (!posts || posts.length === 0) {

            posts = [
              `Discover how ${form.productService || 'our service'} can help you ${form.goal?.toLowerCase() || 'achieve your goals'}. Our professional ${form.platform || 'social media'} content creation services deliver engaging posts that connect with your audience. ${form.cta || 'Learn more'}`,
              `Elevate your ${form.platform || 'social media'} presence with ${form.productService || 'our service'}. We create ${form.tone || 'professional'} content that drives ${form.goal?.toLowerCase() || 'engagement'} and builds meaningful connections. ${form.cta || 'Learn more'}`,
              `Transform your brand storytelling with ${form.productService || 'our service'}. Our expert team crafts compelling ${form.platform || 'social media'} posts that showcase your expertise and attract potential clients. ${form.cta || 'Learn more'}`
            ]
          }

          // Fallback: If no hashtags extracted, use basic fallback
          if (!hashtags || hashtags.length === 0) {
            hashtags = ['#NoHashtagsFound']
          }

          // Ensure we have arrays
          posts = Array.isArray(posts) ? posts : []
          hashtags = Array.isArray(hashtags) ? hashtags : []

          const final = {
            posts: posts.map(cleanSocialText).filter(post => post && post !== '(none)' && post.trim().length > 0),
            hashtags: hashtags.map(cleanSocialText).filter(tag => tag && tag !== '(none)' && tag.trim().length > 0)
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
