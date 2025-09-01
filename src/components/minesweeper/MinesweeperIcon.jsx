import React, { useEffect, useRef } from 'react'
import minesweeperIcon from '../../assets/win7/icons/minesweeper.png'

export function MinesweeperIcon({
  iconRef,
  style,
  onMouseDown,
  onTouchStart,
  onContextMenu,
  name = 'Minesweeper',
  renaming = false,
  onRenameCommit,
  onRenameCancel,
  onClick,
  onDoubleClick
}) {
  const inputRef = useRef(null)
  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  return (
    <div
      className="windows-icon"
      ref={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <img
        src={minesweeperIcon}
        alt="Minesweeper"
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
