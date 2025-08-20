import React, { useEffect, useRef } from 'react'
import './RecycleBin.css'
import binEmpty from '../../../assets/win7/bin-emty.svg'
import binFull from '../../../assets/win7/bin-full.svg'

export function RecycleBin({
  binRef,
  style,
  full,
  onMouseDown,
  onDoubleClick,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  name = 'Recycle Bin',
  renaming = false,
  onRenameCommit,
  onRenameCancel,
}) {
  const inputRef = useRef(null)
  useEffect(() => { if (renaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [renaming])
  return (
    <div
      className="windows-bin"
      ref={binRef}
      style={style}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={full ? binFull : binEmpty}
        alt={full ? 'Recycle Bin (Full)' : 'Recycle Bin (Empty)'}
        className="bin-icon"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
      {renaming ? (
        <input
          ref={inputRef}
          className="bin-label"
          // style={{ width: '100%', boxSizing: 'border-box', color: '#333' }}
          defaultValue={name}
          onBlur={(e) => onRenameCommit && onRenameCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onRenameCommit && onRenameCommit(e.target.value) }
            if (e.key === 'Escape') { onRenameCancel && onRenameCancel() }
          }}
        />
      ) : (
  <div className="bin-label" style={{ color: renaming ? '#333' : undefined }}>{name}</div>
      )}
    </div>
  )
}
