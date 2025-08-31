import React from 'react'
import '../blog/BlogAssistantForm.css'

export function SocialAssistantResult({ socialResult }) {
  if (!socialResult) return null
  return (
<>
      {socialResult.error ? (
        <div className="blog-assistant-error">{socialResult.error}</div>
      ) : (
        <div className="blog-assistant-success">
          <h3>Generated Social Media Posts</h3>
          {socialResult.posts && socialResult.posts.length > 0 && (
            <div className="social-posts">
              <h4>Posts:</h4>
              {socialResult.posts.map((post, index) => (
                <div key={index} className="social-post">
                  <strong>Post {index + 1}:</strong>
                  <p>{post}</p>
                </div>
              ))}
            </div>
          )}
          {socialResult.hashtags && socialResult.hashtags.length > 0 && (
            <div className="social-hashtags">
              <h4>Hashtags:</h4>
              <p>{socialResult.hashtags.join(' ')}</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
