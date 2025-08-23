import React, { useState } from 'react'
import ModalWindow from '../../../modal/ModalWindow.jsx'
import './EmailResultModal.css' // Add this import for styles


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

// Utility for export formats
function getPlainText(theme, message) {
  return `${theme}\n\n${message}`
}

function getMarkdown(theme, message) {
  return `# ${theme}\n\n${message.replace(/\n/g, '\n\n')}`
}

function getHTML(theme, message) {
  return `<h1 style="font-family:sans-serif;">${theme}</h1><div style="font-family:sans-serif;white-space:pre-line;">${message}</div>`
}

// PDF export (uses browser print dialog for simplicity)
function exportPDF(theme, message) {
  const html = getHTML(theme, message)
  const win = window.open('', '_blank')
  win.document.write(`<html><head><title>Email Export</title></head><body>${html}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [menuHover, setMenuHover] = useState(false)
  if (!open) return null

  const handleThemeChange = e => setTheme(normalizeSpacing(e.target.value))
  const handleMessageChange = e => setMessage(cleanMessage(e.target.value))

  // Show menu if either button or menu is hovered
  const exportMenuVisible = showExportMenu || menuHover

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
        <div className="email-assistant-btn-row" style={{ position: 'relative', justifyContent: 'center', display: 'flex' }}>
          <button type="button" className="modal-btn-text" onClick={onClose}>Close</button>
          <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowExportMenu(true)}
            onMouseLeave={() => {
              // Delay hiding to allow moving cursor into menu
              setTimeout(() => setShowExportMenu(false), 180)
            }}
            tabIndex={0}
            onFocus={() => setShowExportMenu(true)}
            onBlur={() => setShowExportMenu(false)}
          >
            <button
              type="button"
              className="modal-btn-text"
              aria-haspopup="true"
              aria-expanded={exportMenuVisible}
              tabIndex={-1}
            >
              Export
            </button>
            {exportMenuVisible && (
              <ul
                className="context-menu"
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
                onMouseEnter={() => setMenuHover(true)}
                onMouseLeave={() => {
                  setMenuHover(false)
                  setShowExportMenu(false)
                }}
                onFocus={() => setMenuHover(true)}
                onBlur={() => setMenuHover(false)}
                tabIndex={0}
              >
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getPlainText(theme, message), 'email.txt', 'text/plain')}
                  tabIndex={0}
                >
                  Plain Text
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getMarkdown(theme, message), 'email.md', 'text/markdown')}
                  tabIndex={0}
                >
                  Markdown
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getHTML(theme, message), 'email.html', 'text/html')}
                  tabIndex={0}
                >
                  HTML
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => exportPDF(theme, message)}
                  tabIndex={0}
                >
                  PDF
                </li>
              </ul>
            )}
          </div>
        </div>
      </form>
    </ModalWindow>  
  )
}
