import React, { useState } from 'react'
import { normalizeSpacing } from '../../utils/normalizeSpacing.js'
import { EmailSignatureModal } from './SignatureModal/EmailSignatureModal.jsx'
import { EditEmailModal } from './EditEmailModal/EditEmailModal.jsx'
import './EmailResultModal.css'


function getPlainText(theme, message) {
  return `${theme}\n\n${message}`
}

function getMarkdown(theme, message) {
  return `# ${theme}\n\n${message.replace(/\n/g, '\n\n')}`
}

function getHTML(theme, message) {
  return `<h1 style="font-family:sans-serif;">${theme}</h1><div style="font-family:sans-serif;white-space:pre-line;">${message}</div>`
}


function exportPDF(theme, message) {
  const html = getHTML(theme, message)
  const win = window.open('', '_blank')
  win.document.write(`<html><head><title>Email Export</title></head><body>${html}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

function downloadFile(content, filename, mime) {
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

export function EmailResultModal({
  onClose,
  theme,
  setTheme,
  message,
  setMessage,
  onSave,
  zIndex = 100,
  onActivate,
  sender,
}) {
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [signatureType, setSignatureType] = useState('Best regards')
  const [signatureName, setSignatureName] = useState(sender || '')
  const [signatureBusiness, setSignatureBusiness] = useState('')
  const [signatureNumber, setSignatureNumber] = useState('')
  const [exportMenuVisible, setShowExportMenu] = useState(false)
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }
  return (
    <>
      <EditEmailModal
        open={true}
        onClose={onClose}
        zIndex={zIndex}
        onActivate={onActivate}
        theme={theme}
        setTheme={setTheme}
        message={message}
        setMessage={setMessage}
        onSave={onSave}
        normalizeSpacing={normalizeSpacing}
        setSignatureModalOpen={setSignatureModalOpen}
        exportMenuVisible={exportMenuVisible}
        setShowExportMenu={setShowExportMenu}
        handleThemeChange={handleThemeChange}
        signatureType={signatureType}
        signatureName={signatureName}
        signatureBusiness={signatureBusiness}
        signatureNumber={signatureNumber}
        downloadFile={downloadFile}
        getPlainText={getPlainText}
        getMarkdown={getMarkdown}
        getHTML={getHTML}
        exportPDF={exportPDF}
      />
      {signatureModalOpen && (
        <EmailSignatureModal
          open={signatureModalOpen}
          onClose={() => setSignatureModalOpen(false)}
          zIndex={zIndex + 20}
          signatureType={signatureType}
          setSignatureType={setSignatureType}
          signatureName={signatureName}
          setSignatureName={setSignatureName}
          signatureBusiness={signatureBusiness}
          setSignatureBusiness={setSignatureBusiness}
          signatureNumber={signatureNumber}
          setSignatureNumber={setSignatureNumber}
          setMessage={setMessage}
        />
      )}
    </>
  )}