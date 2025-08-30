import React from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'
import blogIcon from '../../assets/win7/icons/blog.ico'

export function BlogModal({ open, onClose, zIndex = 130, onActivate, onMinimize }) {
  if (!open) return null
  return (
    <ModalWindow
      title="Blog"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
      onMinimize={onMinimize}
    >
      <div style={{ textAlign: 'center', padding: 24 }}>
        <img src={blogIcon} alt="Blog" style={{ width: 48, height: 48, marginBottom: 12 }} />
        <h2>Welcome to the Blog!</h2>
        <p>This is a placeholder for your blog modal.</p>
      </div>
    </ModalWindow>
  )
}
