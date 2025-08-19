import React, { useState, useRef, useEffect, useCallback } from 'react'
import './WinDropdown.css'

export function WinDropdown({ label, value, onChange, options, placeholder = 'Select...', required }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const handleToggle = () => setOpen(o => !o)
  const handleSelect = (v) => { onChange(v); setOpen(false) }

  const handleClickOutside = useCallback((e) => {
    if (!wrapperRef.current) return
    if (!wrapperRef.current.contains(e.target)) setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [open, handleClickOutside])

  useEffect(() => {
    function onKey(e) {
      if (!open) return
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`win-dropdown-wrapper${required && !value ? ' win-dropdown-error' : ''}`} ref={wrapperRef}>
      {label && <div className="win-dropdown-label">{label}</div>}
      <div
        className={`win-dropdown${open ? ' open' : ''}`}
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle() } }}
      >
        <span className={value ? '' : 'win-dropdown-placeholder'}>{value || placeholder}</span>
        <span className="win-dropdown-arrow">▼</span>
      </div>
      {open && (
        <ul className="win-dropdown-menu">
          {options.map(opt => (
            <li
              key={opt}
              className="win-dropdown-item"
              onClick={() => handleSelect(opt)}
            >{opt}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
