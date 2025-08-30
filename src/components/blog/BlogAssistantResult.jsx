import React from 'react'

export function BlogAssistantResult({ blogResult }) {
  if (!blogResult) return null
  return (
    <>
      {blogResult.error ? (
        <div className="blog-assistant-error">{blogResult.error}</div>
      ) : (
        <>
        </>
      )}
    </>
  )
}
