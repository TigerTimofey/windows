import React from 'react'
import shutdownSound from '../../../assets/win7/sounds/shutdown.mp3'

export function StartMenu({ menuRef, onShutdown, onPrograms, onGames }) {
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
        <li onClick={onPrograms}>Programs</li>
        <li onClick={onGames}>Games</li>
        <li className="shutdown" onClick={handleShutdown}>Shut Down...</li>
      </ul>
    </div>
  )
}
