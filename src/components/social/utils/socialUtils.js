export function extractPosts(text) {
  if (!text) return []

  // Look for POST lines with bracketed content
  const postMatches = text.match(/POST \d+:\s*\[([^\]]+)\]/g)
  if (postMatches) {
    return postMatches.map(match => {
      const content = match.match(/POST \d+:\s*\[([^\]]+)\]/)
      return content ? content[1].trim() : ''
    }).filter(post => post.length > 0)
  }

  // Fallback: Look for POST lines without brackets
  const fallbackMatches = text.match(/POST \d+:\s*(.+?)(?=POST \d+:|$)/gs)
  if (fallbackMatches) {
    return fallbackMatches.map(match => {
      return match.replace(/POST \d+:\s*/, '').trim()
    }).filter(post => post.length > 0)
  }

  // Final fallback: Look for posts after the specifications format
  const lines = text.split('\n').filter(line => line.trim())

  // Find where the specifications end (after HASHTAGS line)
  let specEndIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('hashtags:')) {
      specEndIndex = i
      break
    }
  }

  // Extract posts from lines after the specifications
  const postLines = []
  if (specEndIndex >= 0) {
    for (let i = specEndIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('#') && line.length > 10) {
        // This looks like a post (not a hashtag, reasonably long)
        postLines.push(line)
      }
    }
  }

  return postLines.filter(line => line && line !== '(none)')
}

export function extractHashtags(text) {
  if (!text) return []

  // Look for HASHTAGS line with bracketed content
  const hashtagMatch = text.match(/7\.\s*HASHTAGS:\s*\[([^\]]+)\]/i)
  if (hashtagMatch) {
    return hashtagMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }

  // Fallback: Look for the HASHTAGS line without brackets
  const fallbackMatch = text.match(/7\.\s*HASHTAGS:\s*(.+?)(?:\n|$)/i)
  if (fallbackMatch) {
    return fallbackMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }

  // Final fallback: look for any line containing hashtags
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.toLowerCase().includes('hashtags:')) {
      const hashtagPart = line.split(/hashtags?:/i)[1]
      if (hashtagPart) {
        // Remove brackets if present
        const cleanPart = hashtagPart.replace(/^\s*\[|\]\s*$/g, '')
        return cleanPart.trim().split(/\s+/).filter(tag => tag.startsWith('#'))
      }
    }
  }

  return []
}

export function cleanSocialText(text) {
  if (!text) return ''
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
  cleaned = cleaned.replace(/^\n+|\n+$/g, '')
  if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)'
  return cleaned
}
