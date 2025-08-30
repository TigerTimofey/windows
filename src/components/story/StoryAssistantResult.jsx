import React from 'react'
import '../blog/BlogAssistantForm.css'

export function StoryAssistantResult({ storyResult }) {
  if (!storyResult) return null
  return (
    <div className="blog-assistant-result">
      <div className="blog-assistant-result-title">Generated Short Story:</div>
      {storyResult.error ? (
        <div className="blog-assistant-error">{storyResult.error}</div>
      ) : (
        <>
        </>
      )}
    </div>
  )
}
