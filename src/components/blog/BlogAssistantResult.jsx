import React from 'react'

export function BlogAssistantResult({ blogResult }) {
  if (!blogResult) return null
  return (
    <div className="blog-assistant-result">
      <div className="blog-assistant-result-title">Generated Blog Post:</div>
      {blogResult.error ? (
        <div className="blog-assistant-error">{blogResult.error}</div>
      ) : (
        <>
        </>
      )}
    </div>
  )
}
