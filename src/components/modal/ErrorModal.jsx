import React from 'react'
import ModalWindow from './ModalWindow.jsx'
import './ErrorModal.css'
import warningIcon from '../../assets/win7/icons/warning.ico'

// Filter out Ollama errors and control/escape sequences
function filterErrorMessage(message) {
  if (!message) return ''
  // Hide errors that start with "event: error"
  if (/^event: error/i.test(message.trim())) return ''
  // Hide errors that contain only non-printable characters
  if (!/[a-zA-Z0-9]/.test(message)) return ''
  return message
}

export default function ErrorModal({ open, message, onClose, zIndex = 200 }) {
  const filtered = filterErrorMessage(message)
  if (!open || !filtered) return null
  return (
    <ModalWindow title="Error" onClose={onClose} zIndex={zIndex} small>
      <div className="error-modal-win2k">
        <img src={warningIcon} alt="Warning" className="error-modal-icon" />
        <div className="error-modal-message">{filtered}</div>
      </div>
      <div className="error-modal-btn-row">
        <button className="modal-btn-text" autoFocus onClick={onClose}>OK</button>
      </div>
    </ModalWindow>
  )
}
