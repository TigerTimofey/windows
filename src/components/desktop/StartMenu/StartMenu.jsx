import React from 'react'

export function StartMenu({ menuRef }) {
  return (
    <div className="start-menu" ref={menuRef}>
      <ul>
        <li>Programs</li>
        <li>Documents</li>
        <li>Settings</li>
        <li>Find</li>
        <li>Help</li>
        <li>Run...</li>
        <li className="shutdown">Shut Down...</li>
      </ul>
    </div>
  )
}
