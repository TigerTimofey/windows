import React from 'react'
import '../blog/BlogAssistantForm.css'

export function StoryAssistantResult({ storyResult }) {
  if (!storyResult) return null
  return (
    <>
      {storyResult.error ? (
        <div className="blog-assistant-error">{storyResult.error}</div>
      ) : (
        <>
        </>
      )}
    </>
  )
}
