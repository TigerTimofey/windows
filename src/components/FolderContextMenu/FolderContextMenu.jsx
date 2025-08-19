import React from 'react'
import '../BinContextMenu/BinContextMenu.css'

export function FolderContextMenu({ x, y, open, onOpen, onDelete }) {
  if (!open) return null
  return (
    <ul
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      <li className="context-menu-item" onClick={onOpen}>Open</li>
      <li className="context-menu-item" onClick={onDelete}>Delete</li>
    </ul>
  )
}
