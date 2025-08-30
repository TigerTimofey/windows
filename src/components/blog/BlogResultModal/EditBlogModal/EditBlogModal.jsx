import React from 'react'
import ModalWindow from '../../../modal/ModalWindow.jsx'
import './EditBlogModal.css'

export function EditBlogModal({
  open,
  onClose,
  zIndex,
  onActivate,
  title,
  setTitle,
  intro,
  setIntro,
  body,
  setBody,
  conclusion,
  setConclusion,
  onSave
}) {
  if (!open) return null

  return (
    <ModalWindow
      title="Edit Generated Blog Post"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      <form
        className="blog-form"
        onSubmit={e => {
          e.preventDefault()
          onSave && onSave({
            title: title.trim(),
            intro: intro.trim(),
            body: body.trim(),
            conclusion: conclusion.trim()
          })
          onClose && onClose()
        }}
      >
        <label className="blog-form-field">
          Title
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Blog Title" />
        </label>
        <label className="blog-form-field">
          Introduction
          <textarea value={intro} onChange={e => setIntro(e.target.value)} placeholder="Introduction" rows={4} />
        </label>
        <label className="blog-form-field">
          Body
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body" rows={8} />
        </label>
        <label className="blog-form-field">
          Conclusion
          <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="Conclusion" rows={4} />
        </label>
        <div className="blog-assistant-btn-row">
          <button type="button" className="modal-btn-text" onClick={onClose}>Cancel</button>
          <button type="submit" className="modal-btn-text">Save</button>
        </div>
      </form>
    </ModalWindow>
  )
}
