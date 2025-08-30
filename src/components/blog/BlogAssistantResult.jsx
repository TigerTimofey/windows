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
          <div className="blog-assistant-title"><b>Title:</b> {blogResult.title || '(none)'}</div>
          <div><b>Introduction:</b></div>
          <pre className="blog-assistant-intro">{blogResult.intro || '(none)'}</pre>
          <div><b>Body:</b></div>
          <pre className="blog-assistant-body">{blogResult.body || '(none)'}</pre>
          <div><b>Conclusion:</b></div>
          <pre className="blog-assistant-conclusion">{blogResult.conclusion || '(none)'}</pre>
        </>
      )}
    </div>
  )
}
