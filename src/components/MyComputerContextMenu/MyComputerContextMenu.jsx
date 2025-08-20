import React from 'react'
import '../recycle-bin/BinContextMenu/BinContextMenu.css'
import './MyComputerContextMenu.css'

export function MyComputerContextMenu({ x, y, open, onOpen, onDelete, onRename, onCopy }) {
  if (!open) return null
  return (
    <ul
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      <li className="context-menu-item" onClick={onOpen}>Open</li>
      <li className="context-menu-item" onClick={onDelete}>Delete</li>
  <li className="context-menu-item" onClick={onRename}>Rename</li>
  <li className="context-menu-item" onClick={onCopy}>Copy</li>
    </ul>
  )
}
