import React from 'react'
import folderIcon from '../../assets/win7/icons/folder.ico'

export function FolderIcon({ iconRef, style, onMouseDown, onContextMenu, onClick, onDoubleClick }) {
  return (
    <div
      className="windows-icon"
      ref={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={false}
    >
      <img
        src={folderIcon}
        alt="ghost-writer"
        className="icon-img"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
      <div className="icon-label">ghost-writer</div>
    </div>
  )
}
