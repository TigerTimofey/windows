import React from 'react'
import { EditBlogModal } from './EditBlogModal/EditBlogModal.jsx'

export function BlogResultModal({
  open,
  onClose,
  zIndex = 100,
  onActivate,
  title,
  setTitle,
  intro,
  setIntro,
  body,
  setBody,
  conclusion,
  setConclusion,
  onSave,
  wordCount,
  warning
}) {
  if (!open) return null

  return (
    <EditBlogModal
      open={open}
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
      title={title}
      setTitle={setTitle}
      intro={intro}
      setIntro={setIntro}
      body={body}
      setBody={setBody}
      conclusion={conclusion}
      setConclusion={setConclusion}
      onSave={onSave}
      wordCount={wordCount}
      warning={warning}
    />
  )
}
