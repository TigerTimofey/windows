import React from 'react'
import ModalWindow from '../../modal/ModalWindow.jsx'


function normalizeSpacing(text) {
  return text
    .replace(/\s+/g, ' ')            
    .replace(/\s+([.,!?;:])/g, '$1')  
    .replace(/'\s+s/g, "'s")         
    .replace(/Dear\s*\[\s*([^\]]+)\s*\],?/gi, "Dear $1,\n\n")
    .replace(/Hello\s*\[\s*([^\]]+)\s*\],?/gi, "Hello $1,\n\n") 
    .replace(/Subject\s*:/gi, '')  
    .replace(/\b(Best regards|Sincerely)\b/gi, "\n\n$1,")
    .trim()
}

// Clean message body
function cleanMessage(text) {
  if (!text) return ''
  let cleaned = normalizeSpacing(text)
  cleaned = normalizeSpacing(cleaned)
  return cleaned
}

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

  const handleThemeChange = e => setTheme(normalizeSpacing(e.target.value))
  const handleMessageChange = e => setMessage(cleanMessage(e.target.value))

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
          onSave && onSave({
            theme: normalizeSpacing(theme),
            message: cleanMessage(message)
          })
          onClose && onClose()
        }}
      >
        <label className="email-form-field">
          Theme
          <input
            value={normalizeSpacing(theme)}
            onChange={handleThemeChange}
            placeholder="Theme"
          />
        </label>
        <label className="email-form-field">
          Message
          <textarea
            value={normalizeSpacing(message)}
            onChange={handleMessageChange}
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
