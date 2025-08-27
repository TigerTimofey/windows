import React from 'react'
import ModalWindow from '../modal/ModalWindow.jsx'
import { MinesweeperGame } from './MinesweeperGame.jsx'

export function MinesweeperGameModal({ open, onClose, zIndex = 120, onActivate, onMinimize }) {
  if (!open) return null
  function preventContextMenu(e) {
    e.stopPropagation()
    e.preventDefault()
  }
  return (
    <ModalWindow
      title="Minesweeper"
      onClose={onClose}
      zIndex={zIndex}
      onActivate={onActivate}
      onMinimize={onMinimize}
    >
      <div
        style={{ width: '310px' }}
    onContextMenu={preventContextMenu}
      >
        <MinesweeperGame />
      </div>
    </ModalWindow>
  )
}
