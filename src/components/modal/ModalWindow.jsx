import React, { useRef, useState } from 'react'
import './ModalWindow.css'

export default function ModalWindow({ title, children, onClose, zIndex = 100, onActivate, small }) {
  const modalRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState({ x: null, y: null })
  const dragOffset = useRef({ x: 0, y: 0 })

  function handleMouseDown(e) {
    if (e.button !== 0) return
    if (onActivate) onActivate()
    setDragging(true)
    const rect = modalRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  React.useEffect(() => {
    function onMouseMove(e) {
      if (!dragging) return
      let x = e.clientX - dragOffset.current.x
      let y = e.clientY - dragOffset.current.y
      // Clamp to viewport
      const winW = window.innerWidth
      const winH = window.innerHeight
      const modalW = modalRef.current.offsetWidth 
      const modalH = modalRef.current.offsetHeight
      x = Math.max(0, Math.min(x, winW - modalW))
      y = Math.max(0, Math.min(y, winH - modalH))
      setPos({ x, y })
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none'
    }
    function onMouseUp() {
  setDragging(false)
  document.body.style.userSelect = ''
    }
    if (dragging) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex, width: small ? 320 : 420, transform: 'none' }
    : { zIndex, width: small ? 320 : 420 }

  return (
    <div className="windows2000-modal" ref={modalRef} style={style} onMouseDown={() => onActivate && onActivate()}>
      <div className="modal-title-bar modal-title-bar-move" onMouseDown={handleMouseDown}>
        <div className="modal-title-bar-flex">
          <span className="modal-title">{title}</span>
          <div className="modal-buttons">
            <button className="modal-btn close" title="Close" onClick={onClose}>×</button>
          </div>
        </div>
      </div>
      <div className="modal-content">
        {children}
      </div>
    </div>
  )
}

