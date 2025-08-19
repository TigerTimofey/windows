import React from 'react'
import emailIcon from '../../assets/win7/icons/email.ico'
import './EmailIcon.css'

export function EmailIcon({ iconRef, style, onMouseDown, onContextMenu }) {
  return (
    <div
      className="windows-icon email-icon-wrapper"
      ref={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      draggable={false}
    >
      <img
        src={emailIcon}
        alt="Email"
        className="icon-img"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
      <div className="icon-label">Email</div>
    </div>
  )
}
