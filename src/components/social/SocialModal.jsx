import React from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'

export function SocialModal({ open, onClose, zIndex = 130, onActivate, onMinimize }) {
  if (!open) return null

  return (
    <ModalWindow
      onClose={onClose}
      title="Social"
      zIndex={zIndex}
      onActivate={onActivate}
      onMinimize={onMinimize}
      width={400}
      height={300}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Social</h2>
      </div>
    </ModalWindow>
  )
}
