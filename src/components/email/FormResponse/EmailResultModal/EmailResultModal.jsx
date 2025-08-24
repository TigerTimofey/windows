import React, { useState } from 'react'
import ModalWindow from '../../../modal/ModalWindow.jsx'
import './EmailResultModal.css'
import { normalizeSpacing } from '../../utils/normalizeSpacing.js'


function getPlainText(theme, message) {
  return `${theme}\n\n${message}`
}

function getMarkdown(theme, message) {
  return `# ${theme}\n\n${message.replace(/\n/g, '\n\n')}`
}

function getHTML(theme, message) {
  return `<h1 style="font-family:sans-serif;">${theme}</h1><div style="font-family:sans-serif;white-space:pre-line;">${message}</div>`
}


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
  onClose,
  theme,
  setTheme,
  message,
  setMessage,
  onSave,
  zIndex = 100,
  onActivate,
  sender,
}) {
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [signatureType, setSignatureType] = useState('Best regards')
  const [signatureName, setSignatureName] = useState(sender || '')
  const [signatureBusiness, setSignatureBusiness] = useState('')
  const [signatureNumber, setSignatureNumber] = useState('')
  // Export menu state
  const [exportMenuVisible, setShowExportMenu] = useState(false)
  // Store sender/receiver globally for replacement
  // Add missing handler functions
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }
  return (
    <>
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
              message: normalizeSpacing(message)
            })
            onClose && onClose()
          }}
        >
          <label className="email-form-field">
            Theme
            <input type="text" value={theme} onChange={handleThemeChange} placeholder="Email Theme" />
          </label>
          <label className="email-form-field">
            Message
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Email Message" rows={8} />
          </label>
          <div className="email-assistant-btn-row">
                        <button type="button" className="modal-btn-text" onClick={onClose}>Cancel</button>
            <button type="button" className="modal-btn-text" onClick={() => setSignatureModalOpen(true)}>
              Add Signature
            </button>
            
            <div
              className="export-menu-trigger"
              onMouseEnter={() => setShowExportMenu(true)}
              onMouseLeave={() => {
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
                Export Email
              </button>
              {exportMenuVisible && (
                <ul
                  className="context-menu"
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
      {signatureModalOpen && (
        <ModalWindow
          onClose={() => setSignatureModalOpen(false)}
          zIndex={zIndex + 20}
          title={'Email Signature'}
        >

          <form
            className="email-form signature-modal-form"
            onSubmit={e => {
              e.preventDefault()
              const signature = `\n\n${signatureType},\n${signatureName}${signatureBusiness ? `\n${signatureBusiness}` : ''}${signatureNumber ? `\n${signatureNumber}` : ''}`
              setMessage(prev => prev + signature)
              setSignatureModalOpen(false)
            }}
          >
            <label className="email-form-field">
              <select value={signatureType} onChange={e => setSignatureType(e.target.value)}>
                <option value="Sincerely">Sincerely</option>
                <option value="Warm regards">Warm regards</option>
                <option value="Best regards">Best regards</option>
                <option value="Best wishes">Best wishes</option>
              </select>
            </label>
            <label className="email-form-field">
              Your Name
              <input
                type="text"
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                placeholder="Your Name"
              />
            </label>
            <label className="email-form-field">
              Business Name
              <input type="text" value={signatureBusiness} onChange={e => setSignatureBusiness(e.target.value)} placeholder="Business Name" />
            </label>
            <label className="email-form-field">
              Number
              <input type="text" value={signatureNumber} onChange={e => setSignatureNumber(e.target.value)} placeholder="Number" />
            </label>
            <div className="email-assistant-btn-row signature-btn-row">
              <button type="button" className="modal-btn-text" onClick={() => setSignatureModalOpen(false)}>Cancel</button>
              <button type="submit" className="modal-btn-text">Add</button>
            </div>
          </form>
        </ModalWindow>
      )}
    </>
  )}