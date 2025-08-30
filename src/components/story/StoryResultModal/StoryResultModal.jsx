import React from 'react'
import { EditStoryModal } from './EditStoryModal/EditStoryModal.jsx'

export function StoryResultModal({
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
  onSave
}) {
  if (!open) return null

  return (
    <EditStoryModal
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
    />
  )
}
