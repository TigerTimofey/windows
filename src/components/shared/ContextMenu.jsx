import React from 'react'
import '../recycle-bin/BinContextMenu/BinContextMenu.css'

export function ContextMenu({ x, y, open, items }) {
  if (!open) return null
  return (
    <ul
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className={`context-menu-item${item.disabled ? ' disabled' : ''}`}
          onClick={item.disabled ? undefined : item.onClick}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
