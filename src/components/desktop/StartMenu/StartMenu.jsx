import React from 'react'
import shutdownSound from '../../../assets/win7/sounds/shutdown.mp3'

export function StartMenu({ menuRef, onShutdown }) {
  function handleShutdown() {
    try {
      const audio = new Audio(shutdownSound)
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch (e) {
      console.error("Error playing shutdown sound:", e)
    }
    if (onShutdown) onShutdown();
  }

  return (
    <div className="start-menu" ref={menuRef}>
      <ul>
        <li>Programs</li>
        <li>Documents</li>
        <li>Settings</li>
        <li>Find</li>
        <li>Help</li>
        <li>Run...</li>
        <li className="shutdown" onClick={handleShutdown}>Shut Down...</li>
      </ul>
    </div>
  )
}
