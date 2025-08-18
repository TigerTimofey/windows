
function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [clock, setClock] = useState(getTimeString())
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  function getTimeString() {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const minStr = minutes < 10 ? '0' + minutes : minutes
    return `${hours}:${minStr} ${ampm}`
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(getTimeString())
    }, 1000 * 60)
    setClock(getTimeString())
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="windows-bg">
      {/* Taskbar */}
      <div className="windows-taskbar">
        <button
          className={`windows-start${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          ref={buttonRef}
        >
          <img src={windows7Logo} alt="Windows 7 logo" className="windows-logo" />
          Start
        </button>
        <div className="windows-separator" />
        <div className="windows-clock">{clock}</div>
      </div>

      {/* Start Menu */}
      {menuOpen && (
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
      )}
    </div>
  )
}
  import React, { useState, useRef, useEffect } from 'react'
  import windows7Logo from './assets/windows7.png'
  import './App.css'

export default App
