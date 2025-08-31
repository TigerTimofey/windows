import React, { useState } from 'react'
import ModalWindow from '../../../modal/ModalWindow.jsx'
import './EditStoryModal.css'
import { getPlainText, getMarkdown, getHTML, exportPDF, downloadFile } from '../../../../utils/exportUtils.js'

export function EditStoryModal({
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
  const [exportMenuVisible, setShowExportMenu] = useState(false)

  if (!open) return null

  return (
    <ModalWindow
      title="Edit Generated Story"
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
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Story Title" />
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
              Export Story
            </button>
            {exportMenuVisible && (
              <ul
                className="context-menu"
                tabIndex={0}
              >
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getPlainText(title, intro, body, conclusion), 'story.txt', 'text/plain')}
                  tabIndex={0}
                >
                  Plain Text
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getMarkdown(title, intro, body, conclusion), 'story.md', 'text/markdown')}
                  tabIndex={0}
                >
                  Markdown
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(getHTML(title, intro, body, conclusion), 'story.html', 'text/html')}
                  tabIndex={0}
                >
                  HTML
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => exportPDF(title, intro, body, conclusion, 'Story Export')}
                  tabIndex={0}
                >
                  PDF
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(
                    `"Title","Introduction","Body","Conclusion"\n"${title.replace(/"/g, '""')}","${intro.replace(/"/g, '""').replace(/\n/g, '\\n')}","${body.replace(/"/g, '""').replace(/\n/g, '\\n')}","${conclusion.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
                    'story.csv',
                    'text/csv'
                  )}
                  tabIndex={0}
                >
                  CSV
                </li>
                <li
                  className="context-menu-item"
                  onClick={() => downloadFile(
                    JSON.stringify({ title, intro, body, conclusion }, null, 2),
                    'story.json',
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
