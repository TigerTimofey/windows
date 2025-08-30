import React from 'react'
import '../blog/BlogAssistantForm.css'

export function SocialAssistantResult({ socialResult }) {
  if (!socialResult) return null
  return (
<>
      {socialResult.error ? (
        <div className="blog-assistant-error">{socialResult.error}</div>
      ) : (
        <>

        </>
      )}
    </>
  )
}
