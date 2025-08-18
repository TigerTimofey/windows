import React from 'react'
import binEmpty from '../../assets/win7/bin-emty.svg'
import binFull from '../../assets/win7/bin-full.svg'

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
}) {
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
      <div className="bin-label">Recycle Bin</div>
    </div>
  )
}
