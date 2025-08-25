import React from 'react'
import ModalWindow from '../../../../modal/ModalWindow.jsx'
import '../EmailResultModal.css'

export function EmailSignatureModal({
  open,
  onClose,
  zIndex,
  signatureType,
  setSignatureType,
  signatureName,
  setSignatureName,
  signatureBusiness,
  setSignatureBusiness,
  signatureNumber,
  setSignatureNumber,
  setMessage,
}) {
  if (!open) return null
  return (
    <ModalWindow
      title={null}
      onClose={onClose}
      zIndex={zIndex}
    >
      <form
        className="email-form signature-modal-form"
        onSubmit={e => {
          e.preventDefault()
          const signature = `\n\n${signatureType},\n${signatureName}${signatureBusiness ? `\n${signatureBusiness}` : ''}${signatureNumber ? `\n${signatureNumber}` : ''}`
          setMessage(prev => prev + signature)
          onClose()
        }}
      >
        <label className="email-form-field">
          Closing
          <select value={signatureType} onChange={e => setSignatureType(e.target.value)}>
            <option value="Sincerely">Sincerely</option>
            <option value="Warm regards">Warm regards</option>
            <option value="Best regards">Best regards</option>
            <option value="Best wishes">Best wishes</option>
          </select>
        </label>
        <label className="email-form-field">
          Your Name
          <input
            type="text"
            value={signatureName}
            onChange={e => setSignatureName(e.target.value)}
            placeholder="Your Name"
          />
        </label>
        <label className="email-form-field">
          Business Name
          <input type="text" value={signatureBusiness} onChange={e => setSignatureBusiness(e.target.value)} placeholder="Business Name" />
        </label>
        <label className="email-form-field">
          Number
          <input type="text" value={signatureNumber} onChange={e => setSignatureNumber(e.target.value)} placeholder="Number" />
        </label>
        <div className="email-assistant-btn-row signature-btn-row">
          <button type="button" className="modal-btn-text" onClick={onClose}>Cancel</button>
          <button type="submit" className="modal-btn-text">Add</button>
        </div>
      </form>
    </ModalWindow>
  )
}
