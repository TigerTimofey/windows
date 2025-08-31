import React, { useState, useRef, useEffect } from 'react'
import './CustomDropdown.css'

export function CustomDropdown({ options, value, onChange, placeholder, disabled = false, closeOnSelect = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option)
    if (closeOnSelect) {
      setIsOpen(false)
    }
  }

  const displayValue = value || placeholder
 
  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {displayValue}
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, index) => (
            <li
              key={index}
              className={`dropdown-item ${value === option ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
