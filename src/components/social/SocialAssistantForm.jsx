import React from 'react'
import '../blog/BlogAssistantForm.css'
import { platformOptions, toneOptions, ctaOptions } from './utils/formOptions.js'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'
import { normalizeForm } from '../../utils/normalizeInput.js'
import { getUserFriendlyError } from '../../utils/errorUtils.js'

async function query(data) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 60000); 

	try {
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
}export function SocialAssistantForm({
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
        const normalizedForm = normalizeForm(form);
        setForm(normalizedForm);
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setSocialResult({ posts: [], hashtags: [] })

        const prompt = buildPrompt(normalizedForm)

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
          max_tokens: Math.min(4000, Math.max(1000, parseInt(normalizedForm.length) * 2)),
          temperature: temp
        }).then(data => {
          if (data.error) {
            setSocialResult({ error: getUserFriendlyError(data.error) })
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
          const wordCount = final.posts.join(' ').split(/\s+/).filter(word => word.length > 0).length;
          const target = parseInt(normalizedForm.length);
          const tolerance = 0.1;
          const lower = target * (1 - tolerance);
          const upper = target * (1 + tolerance);
          let warning = null;
          if (wordCount < lower) {
            warning = `Total word count (${wordCount}) is below target (${target}) by more than 10%.`;
          } else if (wordCount > upper) {
            warning = `Total word count (${wordCount}) is above target (${target}) by more than 10%.`;
          }
          setSocialResult({ ...final, wordCount, warning })
          setLoading(false)
          setGenerating(false)
        }).catch(err => {
          setSocialResult({ error: getUserFriendlyError(err.message) })
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
