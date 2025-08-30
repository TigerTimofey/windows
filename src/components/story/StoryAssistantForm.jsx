import React from 'react'
import '../blog/BlogAssistantForm.css'

const lengthOptions = [500, 1000, 1500, 2000, 2500]
const styleOptions = ['narrative', 'descriptive', 'dialogue-heavy', 'action-packed', 'lyrical']
const moodOptions = ['happy', 'sad', 'mysterious', 'tense', 'whimsical', 'dark', 'hopeful']

export function StoryAssistantForm({
  form, setForm, errors, setErrors, setLoading, setStoryResult,
  buildPrompt, extractTitle, extractIntro, extractBody, extractConclusion, cleanStoryText,
  loading, renderErrorTooltip, onStartGenerate
}) {
  React.useEffect(() => {
    setForm(f => ({
      ...f,
      genre: f.genre || 'Fantasy',
      characters: f.characters || 'A young hero, a wise mentor, a cunning villain',
      setting: f.setting || 'A magical forest in medieval times',
      length: f.length || 1000,
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
        if (!form.length) newErrors.length = 'Please select length.';
        if (!form.style) newErrors.style = 'Please select style.';
        if (!form.targetAudience || !form.targetAudience.trim()) newErrors.targetAudience = 'Please provide the target audience.';
        if (!form.mood) newErrors.mood = 'Please select mood.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        setLoading(true)
        if (onStartGenerate) onStartGenerate()
        setStoryResult({ title: '', intro: '', body: '', conclusion: '' })

        const prompt = buildPrompt(form)
        const controller = new AbortController()
        let title = ''
        let intro = ''
        let body = ''
        let conclusion = ''

        fetch(`${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/generate-story`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        }).then(data => {
          if (data.error) {
            setStoryResult({ error: data.error })
            setLoading(false)
            return
          }
          const text = data.text
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
          setStoryResult(final)
          setLoading(false)
        }).catch(err => {
          setStoryResult({ error: err.message })
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
          <select
            id="length"
            name="length"
            value={form.length || ''}
            onChange={e => setForm(f => ({ ...f, length: e.target.value }))}
          >
            <option value="">Select length</option>
            {lengthOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {renderErrorTooltip('length', errors)}
        </label>
        <label className="blog-form-field" style={{ flex: 1 }}>
          Style
          <select
            id="style"
            name="style"
            value={form.style || ''}
            onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
          >
            <option value="">Select style</option>
            {styleOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {renderErrorTooltip('style', errors)}
        </label>
      </div>
      <label className="blog-form-field">
        Mood
        <select
          value={form.mood || ''}
          onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
        >
          <option value="">Select mood</option>
          {moodOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {renderErrorTooltip('mood', errors)}
      </label>
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
