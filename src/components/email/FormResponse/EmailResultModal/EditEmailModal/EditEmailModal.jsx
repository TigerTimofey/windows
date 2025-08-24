import React from 'react'
import ModalWindow from '../../../../modal/ModalWindow.jsx'
import '../EmailResultModal.css'

export function EditEmailModal({
  open,
  onClose,
  zIndex,
  onActivate,
  theme,

  message,
  setMessage,
  onSave,
  normalizeSpacing,
  setSignatureModalOpen,
  exportMenuVisible,
  setShowExportMenu,
  handleThemeChange,
  downloadFile,
  getPlainText,
  getMarkdown,
  getHTML,
  exportPDF,
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
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(
                    `"Theme","Message"\n"${theme.replace(/"/g, '""')}","${message.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
                    'email.csv',
                    'text/csv'
                  )}
                  tabIndex={0}
                >
                  CSV
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(
                    JSON.stringify({ theme, message }, null, 2),
                    'email.json',
                    'application/json'
                  )}
                  tabIndex={0}
                >
                  JSON
                </li>
              </ul>
            )}
          </div>
        </div>
      </form>
    </ModalWindow>
  )
}
