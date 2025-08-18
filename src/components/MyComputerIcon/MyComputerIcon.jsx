import React from 'react'
import myComputerIcon from '../../assets/win7/mycomputer.svg'

export function MyComputerIcon({ iconRef, style, onMouseDown, onClick, onDoubleClick }) {
  return (
    <div
      className="windows-icon"
      ref={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <img
        src={myComputerIcon}
        alt="My Computer"
        className="icon-img"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
      <div className="icon-label">My Computer</div>
    </div>
  )
}
