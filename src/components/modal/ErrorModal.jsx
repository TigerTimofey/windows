import React from 'react'
import ModalWindow from './ModalWindow.jsx'
import './ErrorModal.css'
import warningIcon from '../../assets/win7/icons/warning.ico'

export default function ErrorModal({ open, message, onClose, zIndex = 200 }) {
  if (!open) return null
  return (
    <ModalWindow title="Error" onClose={onClose} zIndex={zIndex} small>
      <div className="error-modal-win2k">
        <img src={warningIcon} alt="Warning" className="error-modal-icon" />
        <div className="error-modal-message">{message}</div>
      </div>
      <div className="error-modal-btn-row">
        <button className="modal-btn-text" autoFocus onClick={onClose}>OK</button>
      </div>
    </ModalWindow>
  )
}
