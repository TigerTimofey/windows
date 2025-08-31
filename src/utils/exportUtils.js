export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportPDF(title, intro, body, conclusion, exportTitle = 'Export') {
  const html = getHTML(title, intro, body, conclusion)
  const win = window.open('', '_blank')
  win.document.write(`<html><head><title>${exportTitle}</title></head><body>${html}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

export function getPlainText(title, intro, body, conclusion) {
  return `${title}\n\nIntroduction:\n${intro}\n\nBody:\n${body}\n\nConclusion:\n${conclusion}`
}

export function getMarkdown(title, intro, body, conclusion) {
  return `# ${title}\n\n## Introduction\n${intro}\n\n## Body\n${body}\n\n## Conclusion\n${conclusion}`
}

export function getHTML(title, intro, body, conclusion) {
  return `<h1>${title}</h1>
<h2>Introduction</h2>
<p>${intro.replace(/\n/g, '<br>')}</p>
<h2>Body</h2>
<p>${body.replace(/\n/g, '<br>')}</p>
<h2>Conclusion</h2>
<p>${conclusion.replace(/\n/g, '<br>')}</p>`
}
