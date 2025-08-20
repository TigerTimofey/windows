import React, { useState } from 'react'
import '../../recycle-bin/BinContextMenu/BinContextMenu.css'

// Desktop (background) context menu with New submenu
export function DesktopContextMenu({ x, y, open, onNewFolder, onRefresh, onCleanUp, onPaste, canPaste }) {
  const [showNew, setShowNew] = useState(false)
  if (!open) return null
  const submenuX = x + 160 // offset to right of main menu
  const submenuY = y // align directly with the "New" item row
  return (
    <>
      <ul
        className="context-menu"
        style={{ left: x, top: y }}
        onClick={e => e.stopPropagation()}
        onMouseLeave={() => setShowNew(false)}
      >
        <li
          className="context-menu-item"
          onMouseEnter={() => setShowNew(true)}
          onClick={() => setShowNew(v => !v)}
        >
          New
        </li>
        <li className="context-menu-separator" style={{ height: 2, padding: 0, background: '#999', margin: '2px 4px' }} />
        <li className="context-menu-item" onClick={onRefresh}>Refresh</li>
        <li className="context-menu-item" onClick={onCleanUp}>Clean Up</li>
        <li
          className={"context-menu-item" + (canPaste ? '' : ' disabled')}
          onClick={canPaste ? onPaste : undefined}
          style={!canPaste ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
        >Paste</li>
      </ul>
      {showNew && (
        <ul
          className="context-menu"
          style={{ left: submenuX-55, top: submenuY, maxWidth: 150, height: 28 }}
          onMouseEnter={() => setShowNew(true)}
          onMouseLeave={() => setShowNew(false)}
        >
          <li className="context-menu-item" onClick={() => { onNewFolder(); setShowNew(false) }}>Folder</li>
        </ul>
      )}
    </>
  )
}
