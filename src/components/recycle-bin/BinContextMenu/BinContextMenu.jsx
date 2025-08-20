import React from 'react'
import './BinContextMenu.css'

export function BinContextMenu({ x, y, open, hasItems, onOpen, onEmpty, onRestoreAll, }) {
  if (!open) return null
  return (
    <ul
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      <li className="context-menu-item" onClick={onOpen}>Open</li>
      <li
        className={`context-menu-item${!hasItems ? ' disabled' : ''}`}
        onClick={() => hasItems && onEmpty()}
      >Empty Recycle Bin</li>
      <li
        className={`context-menu-item${!hasItems ? ' disabled' : ''}`}
        onClick={() => hasItems && onRestoreAll && onRestoreAll()}
      >Restore All Items</li>
    </ul>
  )
}
