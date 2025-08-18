import React from 'react'
import windows7Logo from '../../assets/win7/windows7.png'

export function Taskbar({ startOpen, onToggleStart, buttonRef, clock }) {
  return (
    <div className="windows-taskbar">
      <button
        className={`windows-start${startOpen ? ' active' : ''}`}
        onClick={onToggleStart}
        ref={buttonRef}
      >
        <img src={windows7Logo} alt="Windows 7 logo" className="windows-logo" />
        Start
      </button>
      <div className="windows-separator" />
      <div className="windows-clock">{clock}</div>
    </div>
  )
}
