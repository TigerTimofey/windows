

export function inferThemeFromMessage(msg) {
  if (!msg) return ''
  const cleaned = msg.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const first = cleaned.split(/[.\n]/)[0].trim()
  const words = first.split(' ').filter(Boolean)
  return words.slice(0, 6).join(' ')
}

export function cleanMessage(msg) {
  if (!msg) return ''
  let cleaned = msg.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
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
