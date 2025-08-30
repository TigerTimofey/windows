import React from 'react'
import ModalWindow from '../modal/ModalWindow'

export function StoryModal({ open, onClose, zIndex = 130, onActivate, onMinimize }) {
  if (!open) return null

  return (
    <ModalWindow
      title="Our Story"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
      onMinimize={onMinimize}
    >
      <div style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        Story
      </div>
    </ModalWindow>
  )
}
