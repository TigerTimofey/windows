import React, { useState, useEffect } from 'react'
import './windows2000.css'
import './App.css'
import ModalWindow from './components/modal/ModalWindow.jsx'
import { Taskbar } from './components/Taskbar/Taskbar.jsx'
import { StartMenu } from './components/StartMenu/StartMenu.jsx'
import { MyComputerIcon } from './components/MyComputerIcon/MyComputerIcon.jsx'
import { EmailIcon } from './components/email/EmailIcon/EmailIcon.jsx'
import { RecycleBin } from './components/RecycleBin/RecycleBin.jsx'
import { FolderIcon } from './components/folder/FolderIcon/FolderIcon.jsx'
import { FolderContextMenu } from './components/folder/FolderContextMenu/FolderContextMenu.jsx'
import { BinContextMenu } from './components/BinContextMenu/BinContextMenu.jsx'
import { MyComputerContextMenu } from './components/MyComputerContextMenu/MyComputerContextMenu.jsx'
import { EmailContextMenu } from './components/email/EmailContextMenu/EmailContextMenu.jsx'
import { useClock } from './hooks/useClock.js'
import { useStartMenu } from './hooks/useStartMenu.js'
import { useRecycleBin } from './hooks/useRecycleBin.js'
import { useMyComputer } from './hooks/useMyComputer.js'
import { useEmailIcon } from './hooks/useEmailIcon.js'
import { useFolderIcon } from './hooks/useFolderIcon.js'
import { EmailAssistant } from './components/email/EmailAssistant/EmailAssistant.jsx'
import trashSound from './assets/win7/sounds/trash.mp3'
import myComputerIconAsset from './assets/win7/mycomputer.svg'
import emailIconAsset from './assets/win7/icons/email.ico'

function App() {
  const [binModalOpen, setBinModalOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  // Modal stacking management
  const zCounterRef = React.useRef(150)
  const [folderZ, setFolderZ] = useState(110)
  const [emailZ, setEmailZ] = useState(120)
  const [compZ, setCompZ] = useState(115)
  const [binZ, setBinZ] = useState(100)
  const [confirmZ, setConfirmZ] = useState(105)
  function bring(which) {
    const next = ++zCounterRef.current
    if (which === 'folder') setFolderZ(next)
    if (which === 'email') setEmailZ(next)
    if (which === 'comp') setCompZ(next)
    if (which === 'bin') setBinZ(next)
    if (which === 'confirm') setConfirmZ(next)
  }


  const clock = useClock()
  const { open: menuOpen, setOpen: setMenuOpen, menuRef, buttonRef } = useStartMenu()
  const recycle = useRecycleBin()
  const folder = useFolderIcon(recycle.binRef, addItemToBin)
  function addItemToFolder(item) { folder.addItem(item) }
  const email = useEmailIcon(recycle.binRef, folder.ref, addItemToBin, addItemToFolder)
  // Email assistant modal isolated in its own component

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
  name: compName,
  renaming: compRenaming,
  startRename: compStartRename,
  commitRename: compCommitRename,
  cancelRename: compCancelRename,
  } = useMyComputer(recycle.binRef, folder.ref, addItemToBin, addItemToFolder)

  // Auto bring-to-front when a modal becomes open (after all hook states exist)
  useEffect(() => { if (folder.modalOpen) bring('folder') }, [folder.modalOpen])
  useEffect(() => { if (email.modalOpen) bring('email') }, [email.modalOpen])
  useEffect(() => { if (compModalOpen) bring('comp') }, [compModalOpen])
  useEffect(() => { if (binModalOpen) bring('bin') }, [binModalOpen])
  useEffect(() => { if (confirmClearOpen) bring('confirm') }, [confirmClearOpen])

  const binFullState = recycle.items.length > 0
  // Bin: highest z-index to allow easy dropping; folder (55) above other icons (50)
  const binStyle = recycle.binPos.x !== null && recycle.binPos.y !== null
    ? { left: recycle.binPos.x, top: recycle.binPos.y, position: 'fixed', zIndex: 60 }
    : { right: 18, bottom: 54, position: 'fixed', zIndex: 60 }

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
    if (recycle.items.some(i => i.id === 'ghost-folder')) folder.restore()
    recycle.setItems([])
  }
  function handleRestoreItem(id) {
    recycle.setItems(items => items.filter(i => i.id !== id))
    if (id === 'mycomputer') restoreComputer()
    if (id === 'email') email.restore()
    if (id === 'ghost-folder') folder.restore()
  }
  function handleConfirmEmpty() { if (recycle.items.length) playTrashSound(); recycle.setItems([]); setConfirmClearOpen(false) }
  function handleCancelEmpty() { setConfirmClearOpen(false) }

  function handleFolderItemToDesktop(id) {
    if (id === 'email') {
      folder.removeItem('email')
      email.restore()
    }
    if (id === 'mycomputer') {
      folder.removeItem('mycomputer')
      restoreComputer()
    }
  }
  function handleFolderItemOpen(id) {
    if (id === 'email') { email.setModalOpen(true); bring('email') }
    if (id === 'mycomputer') { setCompModalOpen(true); bring('comp') }
  }
  function handleFolderItemDelete(id) {
    if (id === 'email') {
      folder.removeItem('email')
      addItemToBin({ id: 'email', name: 'Email', icon: emailIconAsset })
    }
    if (id === 'mycomputer') {
      folder.removeItem('mycomputer')
      addItemToBin({ id: 'mycomputer', name: 'My Computer', icon: myComputerIconAsset })
    }
  }

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
          name={compName}
          renaming={compRenaming}
          onRenameCommit={compCommitRename}
          onRenameCancel={compCancelRename}
        />
      )}
      {email.visible && (
        <EmailIcon
          iconRef={email.ref}
          style={email.style}
          onMouseDown={email.handleMouseDown}
          onContextMenu={email.handleContextMenu}
          onClick={email.handleClick}
          onDoubleClick={email.handleDoubleClick}
          name={email.name}
          renaming={email.renaming}
          onRenameCommit={email.commitRename}
          onRenameCancel={email.cancelRename}
        />
      )}
      {folder.visible && (
        <FolderIcon
          iconRef={folder.ref}
          style={folder.style}
          onMouseDown={folder.handleMouseDown}
          onContextMenu={folder.handleContextMenu}
          onClick={folder.handleClick}
          onDoubleClick={folder.handleDoubleClick}
          name={folder.name}
          renaming={folder.renaming}
          onRenameCommit={folder.commitRename}
          onRenameCancel={folder.cancelRename}
        />
      )}

      <EmailContextMenu
        x={email.context?.x}
        y={email.context?.y}
        open={email.context?.open}
        onOpen={() => { email.setModalOpen(true); email.closeContext(); bring('email') }}
        onDelete={() => { email.deleteSelf(); email.closeContext() }}
        onRename={() => { email.startRename() }}
        onCopy={() => { navigator.clipboard && navigator.clipboard.writeText(email.name).catch(()=>{}); email.closeContext() }}
      />

      <FolderContextMenu
        x={folder.context?.x}
        y={folder.context?.y}
        open={folder.context?.open}
        onOpen={() => { folder.setModalOpen(true); folder.closeContext(); bring('folder') }}
        onDelete={() => { folder.deleteSelf(); folder.closeContext() }}
        onRename={() => { folder.startRename() }}
        onCopy={() => { navigator.clipboard && navigator.clipboard.writeText(folder.name).catch(()=>{}) ; folder.closeContext() }}
      />

      <BinContextMenu
        x={recycle.context.x}
        y={recycle.context.y}
        open={recycle.context.open}
        hasItems={recycle.items.length > 0}
        onOpen={() => { setBinModalOpen(true); recycle.closeContext(); bring('bin') }}
        onEmpty={() => { recycle.closeContext(); handleEmptyRequest() }}
        onRestoreAll={() => { recycle.closeContext(); handleRestoreAll() }}
        onRename={() => { recycle.startRename && recycle.startRename() }}
        onCopy={() => { navigator.clipboard && navigator.clipboard.writeText(recycle.name || 'Recycle Bin').catch(()=>{}); recycle.closeContext() }}
      />

      <MyComputerContextMenu
        x={compContext?.x}
        y={compContext?.y}
        open={compContext?.open}
  onOpen={() => { setCompModalOpen(true); closeCompContext(); bring('comp') }}
        onDelete={() => { deleteComputer(); closeCompContext() }}
  onRename={() => { compStartRename() }}
  onCopy={() => { navigator.clipboard && navigator.clipboard.writeText(compName).catch(()=>{}); closeCompContext() }}
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
        name={recycle.name}
        renaming={recycle.renaming}
        onRenameCommit={recycle.commitRename}
        onRenameCancel={recycle.cancelRename}
      />

      {binModalOpen && (
  <ModalWindow title={recycle.name} onClose={handleBinModalClose} zIndex={binZ} onActivate={() => bring('bin')}>
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
        <ModalWindow title="Confirm Empty" onClose={handleCancelEmpty} zIndex={confirmZ} onActivate={() => bring('confirm')}>
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
  <ModalWindow title={compName} onClose={() => setCompModalOpen(false)} zIndex={compZ} onActivate={() => bring('comp')}>
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

  <EmailAssistant open={email.modalOpen} onClose={() => email.setModalOpen(false)} zIndex={emailZ} onActivate={() => bring('email')} appName={email.name} />

      {folder.modalOpen && (
  <ModalWindow title={folder.name} onClose={() => folder.setModalOpen(false)} zIndex={folderZ} onActivate={() => bring('folder')}>
          {folder.items.length === 0 ? (
            <div className="modal-empty-message">The folder is empty.</div>
          ) : (
            <div className="modal-bin-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {folder.items.map(item => (
                <div
                  key={item.id}
                  className="modal-bin-item"
                  style={{ alignItems: 'center', gap: 4 }}
                >
                  <img src={item.icon} alt={item.name} className="modal-bin-icon" draggable={false} />
                  <span className="modal-bin-label" style={{ textAlign: 'center' }}>{item.name}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    <button className="modal-bin-restore-btn" onClick={() => handleFolderItemOpen(item.id)}>Open</button>
                    <button className="modal-bin-restore-btn" onClick={() => handleFolderItemDelete(item.id)}>Delete</button>
                    <button className="modal-bin-restore-btn" onClick={() => handleFolderItemToDesktop(item.id)}>To Desktop</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      )}

      {menuOpen && <StartMenu menuRef={menuRef} />}
    </div>
  )
}


export default App
