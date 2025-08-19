import React, { useState } from 'react'
import './windows2000.css'
import './App.css'
import ModalWindow from './components/modal/ModalWindow.jsx'
import { Taskbar } from './components/Taskbar/Taskbar.jsx'
import { StartMenu } from './components/StartMenu/StartMenu.jsx'
import { MyComputerIcon } from './components/MyComputerIcon/MyComputerIcon.jsx'
import { EmailIcon } from './components/EmailIcon/EmailIcon.jsx'
import { RecycleBin } from './components/RecycleBin/RecycleBin.jsx'
import { BinContextMenu } from './components/BinContextMenu/BinContextMenu.jsx'
import { MyComputerContextMenu } from './components/MyComputerContextMenu/MyComputerContextMenu.jsx'
import { EmailContextMenu } from './components/EmailContextMenu/EmailContextMenu.jsx'
import { useClock } from './hooks/useClock.js'
import { useStartMenu } from './hooks/useStartMenu.js'
import { useRecycleBin } from './hooks/useRecycleBin.js'
import { useMyComputer } from './hooks/useMyComputer.js'
import { useEmailIcon } from './hooks/useEmailIcon.js'
import trashSound from './assets/win7/sounds/trash.mp3'

function App() {
  const [binModalOpen, setBinModalOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const clock = useClock()
  const { open: menuOpen, setOpen: setMenuOpen, menuRef, buttonRef } = useStartMenu()
  const recycle = useRecycleBin()
  const email = useEmailIcon(recycle.binRef, addItemToBin)

  function playTrashSound() {
    try {
      const audio = new Audio(trashSound)
      audio.currentTime = 0
      // Fire and forget; user interaction already occurred
      audio.play().catch(() => {})
    } catch { /* audio failed */ }
  }

  function addItemToBin(item) {
    let added = false
    recycle.setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      added = true
      return [...prev, item]
    })
    if (added) playTrashSound()
  }
  const {
    ref: compRef,
    visible: compVisible,
    modalOpen: compModalOpen,
    setModalOpen: setCompModalOpen,
    handleMouseDown: handleCompMouseDown,
    handleClick: handleCompClick,
    handleDoubleClick: handleCompDoubleClick,
    style: compStyle,
    systemInfo: computerInfo,
    extra: compExtra,
  restore: restoreComputer,
  context: compContext,
  handleContextMenu: handleCompContextMenu,
  closeContext: closeCompContext,
  deleteSelf: deleteComputer,
  } = useMyComputer(recycle.binRef, addItemToBin)

  const binFullState = recycle.items.length > 0
  const binStyle = recycle.binPos.x !== null && recycle.binPos.y !== null
    ? { left: recycle.binPos.x, top: recycle.binPos.y, position: 'fixed', zIndex: 50 }
    : { right: 18, bottom: 54, position: 'fixed', zIndex: 50 }

  function handleBinDoubleClick() { setBinModalOpen(true) }
  function handleBinModalClose() { setBinModalOpen(false) }
  const isTouchOrCoarse = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )
  function handleBinClick() { if (isTouchOrCoarse) setBinModalOpen(true) }

  function handleEmptyRequest() { if (recycle.items.length !== 0) setConfirmClearOpen(true) }
  function handleRestoreAll() {
    if (!recycle.items.length) return
    if (recycle.items.some(i => i.id === 'mycomputer')) restoreComputer()
  if (recycle.items.some(i => i.id === 'email')) email.restore()
    recycle.setItems([])
  }
  function handleRestoreItem(id) {
    recycle.setItems(items => items.filter(i => i.id !== id))
    if (id === 'mycomputer') restoreComputer()
  if (id === 'email') email.restore()
  }
  function handleConfirmEmpty() { if (recycle.items.length) playTrashSound(); recycle.setItems([]); setConfirmClearOpen(false) }
  function handleCancelEmpty() { setConfirmClearOpen(false) }

  return (
    <div className="windows-bg">
      <Taskbar
        startOpen={menuOpen}
        onToggleStart={() => setMenuOpen(!menuOpen)}
        buttonRef={buttonRef}
        clock={clock}
      />

      {compVisible && (
        <MyComputerIcon
          iconRef={compRef}
          style={compStyle}
          onMouseDown={handleCompMouseDown}
          onClick={handleCompClick}
          onDoubleClick={handleCompDoubleClick}
          onContextMenu={handleCompContextMenu}
        />
      )}
      {email.visible && (
        <EmailIcon
          iconRef={email.ref}
          style={email.style}
          onMouseDown={email.handleMouseDown}
          onContextMenu={email.handleContextMenu}
        />
      )}

      <EmailContextMenu
        x={email.context?.x}
        y={email.context?.y}
        open={email.context?.open}
        onOpen={() => { /* could open future email modal */ email.closeContext() }}
        onDelete={() => { email.deleteSelf(); email.closeContext() }}
      />

      <BinContextMenu
        x={recycle.context.x}
        y={recycle.context.y}
        open={recycle.context.open}
        hasItems={recycle.items.length > 0}
        onOpen={() => { setBinModalOpen(true); recycle.closeContext() }}
        onEmpty={() => { recycle.closeContext(); handleEmptyRequest() }}
        onRestoreAll={() => { recycle.closeContext(); handleRestoreAll() }}
      />

      <MyComputerContextMenu
        x={compContext?.x}
        y={compContext?.y}
        open={compContext?.open}
        onOpen={() => { setCompModalOpen(true); closeCompContext() }}
        onDelete={() => { deleteComputer(); closeCompContext() }}
      />

      <RecycleBin
        binRef={recycle.binRef}
        style={binStyle}
        full={binFullState}
        onMouseDown={recycle.handleMouseDown}
        onDoubleClick={handleBinDoubleClick}
        onClick={handleBinClick}
        onContextMenu={recycle.handleContextMenu}
        onTouchStart={recycle.handleTouchStart}
        onTouchMove={recycle.cancelLongPress}
        onTouchEnd={recycle.cancelLongPress}
      />

      {binModalOpen && (
        <ModalWindow title="Recycle Bin" onClose={handleBinModalClose}>
          {recycle.items.length === 0 ? (
            <div className="modal-empty-message">
              The Recycle Bin is empty.
            </div>
          ) : (
            <div className="modal-bin-items">
              {recycle.items.map(item => (
                <div key={item.id} className="modal-bin-item" onDoubleClick={() => handleRestoreItem(item.id)}>
                  <img src={item.icon} alt={item.name} className="modal-bin-icon" draggable={false} />
                  <span className="modal-bin-label">{item.name}</span>
                  <button className="modal-bin-restore-btn" onClick={() => handleRestoreItem(item.id)}>Restore</button>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      )}

      {confirmClearOpen && (
        <ModalWindow title="Confirm Empty" onClose={handleCancelEmpty}>
          <div className="modal-confirm">
            <p className="modal-confirm-message">Permanently delete all items in the Recycle Bin?</p>
            <div className="modal-btn-row">
              <button className="modal-btn-text" onClick={handleConfirmEmpty}>Yes</button>
              <button className="modal-btn-text" onClick={handleCancelEmpty}>No</button>
            </div>
          </div>
        </ModalWindow>
      )}

      {compModalOpen && computerInfo && (
        <ModalWindow title="My Computer" onClose={() => setCompModalOpen(false)}>
          <div className="computer-info">
            <ul className="computer-info-list">
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

      {menuOpen && <StartMenu menuRef={menuRef} />}
    </div>
  )
}


export default App
