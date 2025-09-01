import React from 'react'
import { EditSocialModal } from './EditSocialModal.jsx'

export function SocialResultModal({
  open,
  onClose,
  zIndex = 100,
  onActivate,
  posts,
  setPosts,
  hashtags,
  setHashtags,
  onSave,
  wordCount,
  warning
}) {
  if (!open) return null

  return (
    <EditSocialModal
      open={open}
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
      posts={posts}
      setPosts={setPosts}
      hashtags={hashtags}
      setHashtags={setHashtags}
      onSave={onSave}
      wordCount={wordCount}
      warning={warning}
    />
  )
}
