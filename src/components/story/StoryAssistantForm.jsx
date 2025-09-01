import React from 'react'
import '../blog/BlogAssistantForm.css'
import { CustomDropdown } from '../modal/CustomDropdown.jsx'
import { styleOptions, moodOptions } from '../social/utils/formOptions.js'
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

export function StoryAssistantForm({
  form, setForm, errors, setErrors, setLoading, setStoryResult,
  buildPrompt, extractTitle, extractIntro, extractBody, extractConclusion, cleanStoryText,
  loading, renderErrorTooltip, onStartGenerate, storyResult
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      genre: f.genre || 'Fantasy',
      characters: f.characters || 'A young hero, a wise mentor, a cunning villain',
      setting: f.setting || 'A magical forest in medieval times',
      length: f.length || '1000',
      style: f.style || 'narrative',
      targetAudience: f.targetAudience || 'Young adults',
      mood: f.mood || 'hopeful'
    }))
  }, [setForm])

  return (
    <form className="blog-form"
      onSubmit={e => {
        e.preventDefault();
        const newErrors = {};
        if (!form.genre || !form.genre.trim()) newErrors.genre = 'Please provide the story genre.';
        if (!form.characters || !form.characters.trim()) newErrors.characters = 'Please provide the characters.';
        if (!form.setting || !form.setting.trim()) newErrors.setting = 'Please provide the setting.';
        if (!form.length || isNaN(parseInt(form.length, 10))) newErrors.length = 'Please provide a valid length.';
        if (!form.style) newErrors.style = 'Please select style.';
        if (!form.targetAudience || !form.targetAudience.trim()) newErrors.targetAudience = 'Please provide the target audience.';
        if (!form.mood) newErrors.mood = 'Please select mood.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        const normalizedForm = normalizeForm(form);
        setForm(normalizedForm);
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setStoryResult({ title: '', intro: '', body: '', conclusion: '' })

        const prompt = buildPrompt(normalizedForm)
        let title = ''
        let intro = ''
        let body = ''
        let conclusion = ''

        let temp = 0.7;
        switch (form.mood) {
          case 'happy': temp = 0.7; break;
          case 'sad': temp = 0.6; break;
          case 'mysterious': temp = 0.8; break;
          case 'tense': temp = 0.9; break;
          case 'whimsical': temp = 0.9; break;
          case 'dark': temp = 0.8; break;
          case 'hopeful': temp = 0.7; break;
        }

        query({ 
          prompt,
          max_tokens: Math.min(4000, Math.max(1000, parseInt(normalizedForm.length) * 2)),
          temperature: temp
        }).then(data => {
          if (data.error) {
            setStoryResult({ error: getUserFriendlyError(data.error) })
            setLoading(false)
            return
          }
          // Handle Hugging Face router chat completion response format
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            setStoryResult({ error: 'No response generated' })
            setLoading(false)
            return
          }
          title = extractTitle(text)
          intro = extractIntro(text)
          body = extractBody(text)
          conclusion = extractConclusion(text)
          const final = {
            title: cleanStoryText(title),
            intro: cleanStoryText(intro),
            body: cleanStoryText(body),
            conclusion: cleanStoryText(conclusion)
          }
          const combinedText = [final.title, final.intro, final.body, final.conclusion].join(' ');
          const wordCount = combinedText.split(/\s+/).filter(word => word.length > 0).length;
          const target = parseInt(normalizedForm.length);
          const tolerance = 0.1;
          const lower = target * (1 - tolerance);
          const upper = target * (1 + tolerance);
          let warning = null;
          if (wordCount < lower) {
            warning = `Word count (${wordCount}) is below target (${target}) by more than 10%.`;
          } else if (wordCount > upper) {
            warning = `Word count (${wordCount}) is above target (${target}) by more than 10%.`;
          }
          setStoryResult({ ...final, wordCount, warning })
          setLoading(false)
        }).catch(err => {
          setStoryResult({ error: getUserFriendlyError(err.message) })
          setLoading(false)
        })
      }}
    >
      <label className="blog-form-field">
        Genre
        <input
          id="genre"
          name="genre"
          type="text"
          value={form.genre || ''}
          onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
          placeholder="e.g. Fantasy, Sci-Fi, Mystery"
        />
        {renderErrorTooltip('genre', errors)}
      </label>
      <label className="blog-form-field">
        Characters
        <input
          id="characters"
          name="characters"
          type="text"
          value={form.characters || ''}
          onChange={e => setForm(f => ({ ...f, characters: e.target.value }))}
          placeholder="e.g. A young hero, a wise mentor, a cunning villain"
        />
        {renderErrorTooltip('characters', errors)}
      </label>
      <label className="blog-form-field">
        Setting
        <input
          id="setting"
          name="setting"
          type="text"
          value={form.setting || ''}
          onChange={e => setForm(f => ({ ...f, setting: e.target.value }))}
          placeholder="e.g. A magical forest in medieval times"
        />
        {renderErrorTooltip('setting', errors)}
      </label>
      <label className="blog-form-field">
        Target Audience
        <input
          id="targetAudience"
          name="targetAudience"
          type="text"
          value={form.targetAudience || ''}
          onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
          placeholder="e.g. Young adults, children, adults"
        />
        {renderErrorTooltip('targetAudience', errors)}
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Length (words)
          <input
            type="text"
            value={form.length || ''}
            onChange={(e) => setForm(f => ({ ...f, length: e.target.value }))}
            placeholder="e.g. 1000 or 800-1200"
          />
          {renderErrorTooltip('length', errors)}
        </label>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Style
          <CustomDropdown
            options={styleOptions}
            value={form.style || ''}
            onChange={(value) => setForm(f => ({ ...f, style: value }))}
            placeholder="Select style"
            closeOnSelect={false}
          />
          {renderErrorTooltip('style', errors)}
        </label>
      </div>
      <label className="blog-form-field">
        Mood
        <CustomDropdown
          options={moodOptions}
          value={form.mood || ''}
          onChange={(value) => setForm(f => ({ ...f, mood: value }))}
          placeholder="Select mood"
          closeOnSelect={false}
        />
        {renderErrorTooltip('mood', errors)}
      </label>
      {storyResult && !storyResult.error && (
        <div style={{ marginBottom: '1rem' }}>
          <div><b>Word Count:</b> {storyResult.wordCount}</div>
          {storyResult.warning && <div className="blog-assistant-error">{storyResult.warning}</div>}
        </div>
      )}
      <div className="blog-assistant-btn-row">
        <button
          type="button"
          className="modal-btn-text"
          onClick={() => {
            setStoryResult(null)
            setForm({
              genre: '',
              characters: '',
              setting: '',
              length: '',
              style: '',
              targetAudience: '',
              mood: ''
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
