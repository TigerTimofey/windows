

export function inferThemeFromMessage(msg) {
  if (!msg) return 'Generated Email'
  const cleaned = msg.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'Generated Email'

  // Try to extract a meaningful theme from the first sentence
  const firstSentence = cleaned.split(/[.!?]/)[0].trim()
  if (firstSentence.length > 10) {
    const words = firstSentence.split(' ').filter(Boolean)
    return words.slice(0, 5).join(' ')
  }

  // Fallback to first few words
  const words = cleaned.split(' ').filter(Boolean)
  return words.slice(0, 4).join(' ') || 'Generated Email'
}

export function cleanMessage(msg) {
  if (!msg) return ''
  let cleaned = msg
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n')        // Remove spaces after newlines
    .replace(/\s+\n/g, '\n')        // Remove spaces before newlines
    .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
    .trim()                         // Remove leading/trailing whitespace

  // Remove empty lines at the beginning and end
  cleaned = cleaned.replace(/^\n+|\n+$/g, '')

  if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)'
  return cleaned
}

export function removeDuplicates(text) {
  if (!text) return ''
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  const seen = new Set()
  const result = []
  lines.forEach(line => {
    if (!seen.has(line)) {
      seen.add(line)
      result.push(line)
    }
  })
  return result.join('\n')
}
