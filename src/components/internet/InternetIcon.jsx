import React, { useEffect, useRef } from 'react'
import internetIcon from '../../assets/win7/icons/gitgub.png'


export function InternetIcon({ iconRef, style, onMouseDown, onContextMenu, name = 'GitHub', renaming = false, onRenameCommit, onRenameCancel }) {
  const inputRef = useRef(null)
  useEffect(() => { if (renaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [renaming])

  // Detect touch/coarse pointer
  const isTouchOrCoarse = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )

  // Open GitHub in new tab
  const openGitHub = (e) => {
    if (e) e.preventDefault()
    window.open('https://github.com/TigerTimofey/windows', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="windows-icon"
      ref={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onClick={isTouchOrCoarse ? openGitHub : undefined}
      onDoubleClick={!isTouchOrCoarse ? openGitHub : undefined}
    >
      <img
        src={internetIcon}
        alt="GitHub"
        className="icon-img"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
      {renaming ? (
        <input
          ref={inputRef}
          className="icon-label"
          style={{ width: '100%', boxSizing: 'border-box', color: '#333' }}
          defaultValue={name}
          onBlur={(e) => onRenameCommit && onRenameCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onRenameCommit && onRenameCommit(e.target.value) }
            if (e.key === 'Escape') { onRenameCancel && onRenameCancel() }
          }}
        />
      ) : (
        <div className="icon-label" style={{ color: renaming ? '#333' : undefined }}>{name}</div>
      )}
    </div>
  )
}
