export function extractTitle(text) {
  if (!text) return 'Untitled Blog Post'
  const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n\n|$)/i)
  if (titleMatch) {
    return titleMatch[1].trim()
  }
  // Fallback to first line
  const lines = text.split('\n').filter(line => line.trim())
  return lines[0] || 'Untitled Blog Post'
}

export function extractIntro(text) {
  if (!text) return ''
  const introMatch = text.match(/INTRODUCTION:\s*(.+?)(?=\n\nBODY:|$)/is)
  if (introMatch) {
    return introMatch[1].trim()
  }
  // Fallback to second paragraph
  const parts = text.split('\n\n')
  return parts[1] || ''
}

export function extractBody(text) {
  if (!text) return ''
  const bodyMatch = text.match(/BODY:\s*(.+?)(?=\n\nCONCLUSION:|$)/is)
  if (bodyMatch) {
    return bodyMatch[1].trim()
  }
  // Fallback to middle content
  const parts = text.split('\n\n')
  return parts.slice(2, -1).join('\n\n') || ''
}

export function extractConclusion(text) {
  if (!text) return ''
  const conclusionMatch = text.match(/CONCLUSION:\s*(.+?)$/is)
  if (conclusionMatch) {
    return conclusionMatch[1].trim()
  }
  // Fallback to last paragraph
  const parts = text.split('\n\n')
  return parts[parts.length - 1] || ''
}

export function cleanBlogText(text) {
  if (!text) return ''
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
  cleaned = cleaned.replace(/^\n+|\n+$/g, '')
  if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)'
  return cleaned
}
