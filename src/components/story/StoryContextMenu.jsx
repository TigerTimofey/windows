import React from 'react'

export function StoryContextMenu({ x, y, open, onOpen, onDelete, onRename }) {
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
    </ul>
  )
}
