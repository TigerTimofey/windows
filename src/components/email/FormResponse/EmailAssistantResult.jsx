import React from 'react'
import '../../blog/BlogAssistantForm.css'

export function EmailAssistantResult({ emailResult }) {
  if (!emailResult) return null
  return (
    <div className="blog-assistant-result">
      <div className="blog-assistant-result-title">Generated Email:</div>
      {emailResult.error ? (
        <div className="blog-assistant-error">{emailResult.error}</div>
      ) : (
        <>
          <div className="blog-assistant-theme"><b>Theme:</b> {emailResult.theme || '(none)'}</div>
          <div><b>Message:</b></div>
          <pre className="blog-assistant-message">{emailResult.message || '(none)'}</pre>
        </>
      )}
    </div>
  )
}
