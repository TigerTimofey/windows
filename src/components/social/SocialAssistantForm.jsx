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
        }).then(async data => {
          if (data.error) {
            setSocialResult({ error: data.error })
            setLoading(false)
            setGenerating(false)
            return
          }
          const text = data.text
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

          // Fallback: If no hashtags extracted, generate from Ollama (try once)
          if (!hashtags || hashtags.length === 0) {
            console.log('No hashtags extracted, attempting to generate from Ollama...')
            const hashtagPrompt = `Generate exactly 3-5 relevant hashtags for "${form.productService}" on ${form.platform} related to "${form.goal}". Output ONLY in this format with no additional text:
HASHTAGS: #Hashtag`
            try {
              const hashtagRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/generate-social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: hashtagPrompt }),
                signal: controller.signal
              })
              if (hashtagRes.ok) {
                const hashtagData = await hashtagRes.json()
                if (hashtagData.text) {
                  const extractedFromFallback = extractHashtags(hashtagData.text)
                  if (extractedFromFallback && extractedFromFallback.length > 0) {
                    hashtags = extractedFromFallback
                    console.log('Successfully generated hashtags from Ollama:', hashtags)
                  } else {
                    console.log('Ollama hashtag generation failed, using fallback hashtags')
                    hashtags = ['#NoHashtagsFound']
                  }
                } else {
                  console.log('No text received from hashtag generation, using fallback')
                  hashtags = ['#NoHashtagsFound']
                }
              } else {
                console.log('Hashtag generation request failed, using fallback hashtags')
                hashtags = ['#NoHashtagsFound']
              }
            } catch (err) {
              console.error('Error generating hashtags from Ollama:', err)
              console.log('Using fallback hashtags due to error')
              hashtags = ['#NoHashtagsFound']
            }
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
