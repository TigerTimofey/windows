export function extractPosts(text) {
  if (!text) return []

  // Look for POST lines with bracketed content (case insensitive)
  const postMatches = text.match(/POST \d+:\s*\[([^\]]+)\]/gi)
  if (postMatches) {
    return postMatches.map(match => {
      const content = match.match(/POST \d+:\s*\[([^\]]+)\]/i)
      return content ? content[1].trim() : ''
    }).filter(post => post.length > 0)
  }

  // Fallback: Look for POST lines without brackets (case insensitive)
  const fallbackMatches = text.match(/POST \d+:\s*(.+?)(?=POST \d+:|$)/gis)
  if (fallbackMatches) {
    return fallbackMatches.map(match => {
      return match.replace(/POST \d+:\s*/i, '').trim()
    }).filter(post => post.length > 0)
  }

  // Additional fallback: Look for numbered post patterns
  const numberedPostMatches = text.match(/\d+\.\s*POST\s*\d+:\s*(.+?)(?=\d+\.|$)/gis)
  if (numberedPostMatches) {
    return numberedPostMatches.map(match => {
      return match.replace(/^\d+\.\s*POST\s*\d+:\s*/i, '').trim()
    }).filter(post => post.length > 0)
  }

  // Final fallback: Look for any line containing "Post" followed by content
  const lines = text.split('\n').filter(line => line.trim())
  const postLines = []
  for (const line of lines) {
    if (line.match(/Post \d+:/i) && !line.includes('[Write an actual') && !line.includes('[Insert')) {
      const content = line.replace(/Post \d+:\s*/i, '').trim()
      if (content && content.length > 10) {
        postLines.push(content)
      }
    }
  }

  return postLines.filter(line => line && line !== '(none)')
}

export function extractHashtags(text) {
  if (!text) return []

  // Look for HASHTAGS line with bracketed content (case insensitive)
  const hashtagMatch = text.match(/HASHTAGS?:\s*\[([^\]]+)\]/i)
  if (hashtagMatch) {
    return hashtagMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }

  // Look for HashTag line with bracketed content
  const hashTagMatch = text.match(/HashTag:\s*\[([^\]]+)\]/i)
  if (hashTagMatch) {
    return hashTagMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }

  // Fallback: Look for the HASHTAGS line without brackets
  const fallbackMatch = text.match(/HASHTAGS?:\s*(.+?)(?:\n|$)/i)
  if (fallbackMatch) {
    return fallbackMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }

  // Additional fallback: look for any line containing hashtags or hashtag
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.toLowerCase().includes('hashtag')) {
      const hashtagPart = line.split(/hashtags?:/i)[1]
      if (hashtagPart) {
        // Remove brackets if present
        const cleanPart = hashtagPart.replace(/^\s*\[|\]\s*$/g, '')
        const foundTags = cleanPart.trim().split(/\s+/).filter(tag => tag.startsWith('#'))
        if (foundTags.length > 0) {
          return foundTags
        }
      }
    }
  }

  // Final fallback: look for any hashtags anywhere in the text
  const allHashtags = text.match(/#\w+/g)
  if (allHashtags && allHashtags.length > 0) {
    return allHashtags
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
