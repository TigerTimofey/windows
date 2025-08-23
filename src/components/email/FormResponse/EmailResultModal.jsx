import React from 'react'
import ModalWindow from '../../modal/ModalWindow.jsx'

export function EmailResultModal({
  open,
  onClose,
  theme,
  setTheme,
  message,
  setMessage,
  onSave,
  zIndex = 100,
  onActivate
}) {
  if (!open) return null
  return (
    <ModalWindow
      title="Edit Generated Email"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      <form
        className="email-form"
        onSubmit={e => {
          e.preventDefault()
          onSave && onSave({ theme, message })
          onClose && onClose()
        }}
      >
        <label className="email-form-field">
          Theme
          <input
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder="Theme"
          />
        </label>
        <label className="email-form-field">
          Message
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            placeholder="Message"
          />
        </label>
        <div className="email-assistant-btn-row">
          <button type="button" className="modal-btn-text" onClick={onClose}>Close</button>
          <button type="submit" className="modal-btn-text">Save</button>
        </div>
      </form>
    </ModalWindow>
  )
}
