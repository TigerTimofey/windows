import React, { useState } from 'react'
import ModalWindow from '../../modal/ModalWindow'
import './EditSocialModal.css'

function getPlainText(posts, hashtags) {
  return `Posts:\n${posts.join('\n\n')}\n\nHashtags:\n${hashtags.join(' ')}`
}

function getJSON(posts, hashtags) {
  return JSON.stringify({ posts, hashtags }, null, 2)
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

export function EditSocialModal({
  open,
  onClose,
  zIndex,
  onActivate,
  posts,
  setPosts,
  hashtags,
  setHashtags,
  onSave,
  wordCount,
  warning
}) {
  const [exportMenuVisible, setShowExportMenu] = useState(false)

  if (!open) return null

  return (
    <ModalWindow
      title="Edit Generated Social Media Posts"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
    >
      <form
        className="social-form"
        onSubmit={e => {
          e.preventDefault()
          onSave && onSave({
            posts: posts.map(p => p.trim()).filter(p => p),
            hashtags: hashtags.map(h => h.trim()).filter(h => h)
          })
          onClose && onClose()
        }}
      >
        {wordCount && <div><b>Total Word Count:</b> {wordCount}</div>}
        {warning && <div className="blog-assistant-error">{warning}</div>}
        <label className="social-form-field">
          Posts
          <textarea
            value={posts.join('\n\n')}
            onChange={e => setPosts(e.target.value.split('\n\n').map(p => p.trim()))}
            placeholder="Post 1\n\nPost 2\n\nPost 3"
            rows={10}
          />
        </label>
        <label className="social-form-field">
          Hashtags
          <input
            type="text"
            value={hashtags.join(' ')}
            onChange={e => setHashtags(e.target.value.split(/\s+/).filter(h => h.startsWith('#')))}
          />
        </label>
        <div className="social-assistant-btn-row">
          <button type="button" className="modal-btn-text" onClick={onClose}>Cancel</button>
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
              Export Posts
            </button>
            {exportMenuVisible && (
              <ul
                className="context-menu"
                tabIndex={0}
              >
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getPlainText(posts, hashtags), 'social-posts.txt', 'text/plain')}
                  tabIndex={0}
                >
                  Plain Text
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getJSON(posts, hashtags), 'social-posts.json', 'application/json')}
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
