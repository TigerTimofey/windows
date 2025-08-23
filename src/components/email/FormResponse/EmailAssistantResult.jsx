import React from 'react'

export function EmailAssistantResult({ emailResult }) {
  if (!emailResult) return null
  return (
    <div className="email-assistant-result">
      <div className="email-assistant-result-title">Generated Email:</div>
      {emailResult.error ? (
        <div className="email-assistant-error">{emailResult.error}</div>
      ) : (
        <>
          <div className="email-assistant-theme"><b>Theme:</b> {emailResult.theme || '(none)'}</div>
          <div><b>Message:</b></div>
          <pre className="email-assistant-message">{emailResult.message || '(none)'}</pre>
        </>
      )}
    </div>
  )
}
