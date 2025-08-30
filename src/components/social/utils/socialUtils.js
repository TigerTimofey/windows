export function extractPosts(text) {
  if (!text) return []
  const postsMatch = text.match(/POSTS:\s*(.+?)(?=\n\nHASHTAGS:|$)/is)
  if (postsMatch) {
    return postsMatch[1].trim().split('\n').filter(line => line.trim())
  }
  // Fallback to first part
  const parts = text.split('\n\nHASHTAGS:')
  return parts[0] ? parts[0].trim().split('\n').filter(line => line.trim()) : []
}

export function extractHashtags(text) {
  if (!text) return []
  const hashtagsMatch = text.match(/HASHTAGS:\s*(.+?)$/is)
  if (hashtagsMatch) {
    return hashtagsMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#'))
  }
  // Fallback to last part
  const parts = text.split('\n\nHASHTAGS:')
  return parts[1] ? parts[1].trim().split(/\s+/).filter(tag => tag.startsWith('#')) : []
}

export function cleanSocialText(text) {
  if (!text) return ''
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
  cleaned = cleaned.replace(/^\n+|\n+$/g, '')
  if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)'
  return cleaned
}
