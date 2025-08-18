import React, { useState, useRef, useEffect } from 'react'
import windows7Logo from './assets/win7/windows7.png'
import binEmpty from './assets/win7/bin-emty.svg'
import binFull from './assets/win7/bin-full.svg'
import myComputerIcon from './assets/win7/mycomputer.svg'
import './windows2000.css'
import ModalWindow from './components/modal/ModalWindow.jsx'
import { getClampedBinPosition, isIconDroppedOnTarget } from './utils/desktop.js'

function App() {
  // Modal window for bin
  const [binModalOpen, setBinModalOpen] = useState(false)

  function handleBinDoubleClick() {
    setBinModalOpen(true)
  }
  function handleBinModalClose() {
    setBinModalOpen(false)
  }
  // Single tap support (mobile) for opening bin
  const isTouchOrCoarse = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )
  function handleBinClick() {
    if (isTouchOrCoarse) {
      setBinModalOpen(true)
    }
  }
  // My Computer drag state
  const [compPos, setCompPos] = useState({ x: null, y: null })
  const [compDragging, setCompDragging] = useState(false)
  const [compVisible, setCompVisible] = useState(true)
  const [compModalOpen, setCompModalOpen] = useState(false)
  const compRef = useRef(null)
  const compDragOffset = useRef({ x: 0, y: 0 })
  const compMovedRef = useRef(false)

  // Bin state
  const [binFullState, setBinFullState] = useState(false)
  // Bin contents
  const [binItems, setBinItems] = useState([])

  useEffect(() => {
    function onCompMouseMove(e) {
      if (!compDragging) return
      compMovedRef.current = true
      setCompPos(getClampedBinPosition(e, compDragOffset, compRef, 10))
    }
    function onCompMouseUp() {
      setCompDragging(false)
      // Check if dropped on bin using reusable util
      if (isIconDroppedOnTarget(compRef, binRef)) {
        setCompVisible(false)
        setBinFullState(true)
        setCompModalOpen(false)
        setBinItems(prev => prev.some(i => i.id === 'mycomputer') ? prev : [...prev, { id: 'mycomputer', name: 'My Computer', icon: myComputerIcon }])
      }
    }
    if (compDragging) {
      document.addEventListener('mousemove', onCompMouseMove)
      document.addEventListener('mouseup', onCompMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', onCompMouseMove)
      document.removeEventListener('mouseup', onCompMouseUp)
    }
  }, [compDragging])

  function handleCompMouseDown(e) {
    if (e.button !== 0) return
    setCompDragging(true)
  compMovedRef.current = false
    const rect = compRef.current.getBoundingClientRect()
    compDragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const compStyle = compPos.x !== null && compPos.y !== null
    ? { left: compPos.x, top: compPos.y, position: 'fixed', zIndex: 51 }
    : { left: 18, top: 18, position: 'fixed', zIndex: 51 }

  // System info for My Computer modal
  const computerInfo = React.useMemo(() => {
    if (!compModalOpen) return null
    if (typeof window === 'undefined') return null
    const nav = navigator || {}
    return {
      platform: nav.platform,
      userAgent: nav.userAgent,
      cores: nav.hardwareConcurrency || 'N/A',
      memory: nav.deviceMemory ? nav.deviceMemory + ' GB' : 'N/A',
      online: nav.onLine ? 'Online' : 'Offline'
    }
  }, [compModalOpen])

  // Removed console logging per request

  // Extra async/system APIs
  const [compExtra, setCompExtra] = useState(null)
  useEffect(() => {
    if (!compModalOpen) {
      setCompExtra(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const extra = {}
      try {
        extra.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        extra.localTime = new Date().toLocaleString()
        extra.colorDepth = window.screen.colorDepth
  // Removed pixelRatio & cookiesEnabled per request
        if (navigator.storage && navigator.storage.estimate) {
          const { quota, usage } = await navigator.storage.estimate()
          if (!cancelled) {
            extra.storage = {
              quota: quota ? Math.round(quota / (1024*1024)) + ' MB' : 'N/A',
              usage: usage ? Math.round(usage / (1024*1024)) + ' MB' : 'N/A'
            }
          }
        }
        if (navigator.getBattery) {
          try {
            const batt = await navigator.getBattery()
            if (!cancelled) {
              extra.battery = {
                level: Math.round(batt.level * 100) + '%',
                charging: batt.charging ? 'Charging' : 'Not Charging'
              }
            }
          } catch { /* battery API not available */ }
        }
        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
        if (conn) {
          extra.connection = {
            downlink: conn.downlink + ' Mbps',
            rtt: conn.rtt + ' ms',
            type: conn.effectiveType
          }
        }
        if (performance && performance.memory) {
          const m = performance.memory
          extra.jsHeap = {
            used: Math.round(m.usedJSHeapSize / (1024*1024)) + ' MB',
            total: Math.round(m.totalJSHeapSize / (1024*1024)) + ' MB'
          }
        }
      } catch (e) {
        console.warn('Extra system info error', e)
      }
      if (!cancelled) {
  setCompExtra(extra)
      }
    })()
    return () => { cancelled = true }
  }, [compModalOpen])

  function handleCompClick() {
    if (!compVisible) return
    if (!compMovedRef.current) {
      setCompModalOpen(true)
    }
  }
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

  // Bin drag state
  const [binPos, setBinPos] = useState({ x: null, y: null })
  const [dragging, setDragging] = useState(false)
  const binRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Mouse events for dragging
  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging) return
      setBinPos(getClampedBinPosition(e, dragOffset, binRef, 10))
    }
    function onMouseUp() {
      setDragging(false)
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



  function handleBinMouseDown(e) {
    if (e.button !== 0) return // Only left mouse button
    setDragging(true)
    const rect = binRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Default position: bottom right
  const binStyle = binPos.x !== null && binPos.y !== null
    ? { left: binPos.x, top: binPos.y, position: 'fixed', zIndex: 50 }
    : { right: 18, bottom: 54, position: 'fixed', zIndex: 50 }

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

      {/* My Computer Icon on Desktop (draggable, can be removed) */}
      {compVisible && (
        <div
          className="windows-icon"
          ref={compRef}
          style={compStyle}
          onMouseDown={handleCompMouseDown}
          onClick={handleCompClick}
        >
          <img
            src={myComputerIcon}
            alt="My Computer"
            className="icon-img"
            draggable={false}
            onDragStart={e => e.preventDefault()}
          />
          <div className="icon-label">My Computer</div>
        </div>
      )}

      {/* Bin Icon on Desktop (changes to full if My Computer is removed) */}
      <div
        className="windows-bin"
        ref={binRef}
        style={binStyle}
        onMouseDown={handleBinMouseDown}
  onDoubleClick={handleBinDoubleClick}
  onClick={handleBinClick}
      >
        <img
          src={binFullState ? binFull : binEmpty}
          alt={binFullState ? 'Recycle Bin (Full)' : 'Recycle Bin (Empty)'}
          className="bin-icon"
          draggable={false}
          onDragStart={e => e.preventDefault()}
        />
        <div className="bin-label">Recycle Bin</div>
      </div>

      {/* Bin Modal Window */}
      {binModalOpen && (
        <ModalWindow title="Recycle Bin" onClose={handleBinModalClose}>
          {binItems.length === 0 ? (
            <div className="modal-empty-message">
              The Recycle Bin is empty.
            </div>
          ) : (
            <div className="modal-bin-items">
              {binItems.map(item => (
                <div key={item.id} className="modal-bin-item">
                  <img src={item.icon} alt={item.name} className="modal-bin-icon" />
                  <span className="modal-bin-label">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      )}

      {compModalOpen && computerInfo && (
        <ModalWindow title="My Computer" onClose={() => setCompModalOpen(false)}>
          <div style={{ fontSize: 14, lineHeight: 1.45, width: '100%' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><strong>Platform:</strong> {computerInfo.platform}</li>
              <li><strong>User Agent:</strong> {computerInfo.userAgent}</li>
              <li><strong>CPU Cores:</strong> {computerInfo.cores}</li>
              <li><strong>Memory:</strong> {computerInfo.memory}</li>
              <li><strong>Network:</strong> {computerInfo.online}</li>
              {compExtra?.timezone && <li><strong>Timezone:</strong> {compExtra.timezone}</li>}
              {compExtra?.localTime && <li><strong>Local Time:</strong> {compExtra.localTime}</li>}
              {compExtra?.colorDepth !== undefined && <li><strong>Color Depth:</strong> {compExtra.colorDepth}</li>}
              {compExtra?.storage && <li><strong>Storage:</strong> {compExtra.storage.usage} / {compExtra.storage.quota}</li>}
              {compExtra?.connection && <li><strong>Connection:</strong> {compExtra.connection.downlink}, {compExtra.connection.rtt}, {compExtra.connection.type}</li>}
              {compExtra?.jsHeap && <li><strong>JS Heap:</strong> {compExtra.jsHeap.used} / {compExtra.jsHeap.total}</li>}
            </ul>
          </div>
        </ModalWindow>
      )}

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

export default App
