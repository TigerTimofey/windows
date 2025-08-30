export function extractTitle(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  return lines[0] || 'Untitled';
}

export function extractIntro(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  // Assume intro is the second paragraph or after title
  return lines.slice(1, 3).join(' ') || '';
}

export function extractBody(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.slice(3, -1).join('\n') || '';
}

export function extractConclusion(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  return lines[lines.length - 1] || '';
}

export function cleanBlogText(text) {
  if (!text) return '';
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
  cleaned = cleaned.replace(/^\n+|\n+$/g, '');
  if (!cleaned || /^[\s\n]*$/.test(cleaned)) return '(none)';
  return cleaned;
}
