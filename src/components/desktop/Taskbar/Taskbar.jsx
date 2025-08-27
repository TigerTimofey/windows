import React from 'react'
import windows7Logo from '../../../assets/win7/icons/windows7.png'

export function Taskbar({ startOpen, onToggleStart, buttonRef, clock, minimizedModals = [], onRestoreModal }) {
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
      {minimizedModals.map(modal => (
        <div
          key={modal.id}
          className="taskbar-modal-icon"
          title={modal.title}
          onClick={() => onRestoreModal(modal.id)}
        >
          {modal.icon && <img src={modal.icon} alt="" style={{ width: 18, height: 18, marginRight: 2 }} />}
          <span>{modal.title}</span>
        </div>
      ))}
      <div className="windows-clock">{clock}</div>
    </div>
  )
}
