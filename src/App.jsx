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
import { DesktopContextMenu } from './components/DesktopContextMenu/DesktopContextMenu.jsx'
import { useClock } from './hooks/useClock.js'
import { useStartMenu } from './hooks/useStartMenu.js'
import { useRecycleBin } from './hooks/useRecycleBin.js'
import { useMyComputer } from './hooks/useMyComputer.js'
import { useEmailIcon } from './hooks/useEmailIcon.js'
import { useFolderIcon } from './hooks/useFolderIcon.js'
import { EmailAssistant } from './components/email/EmailAssistant/EmailAssistant.jsx'
import trashSound from './assets/win7/sounds/trash.mp3'
import { openItemFromBaseFolder, deleteItemFromBaseFolder, moveItemFromBaseFolderToDesktop } from './utils/folderActions.js'
import { ExtraFolderModal } from './components/folder/ExtraFolderModal/ExtraFolderModal.jsx'
import { useExtraFolders } from './hooks/useExtraFolders.js'
import myComputerIconAsset from './assets/win7/mycomputer.svg'
import extraFolderIcon from './assets/win7/icons/folder.ico'

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
  // Base folder hook will be created after we assemble dependencies; use ref bridge for extra folders hook
  const baseFolderRef = React.useRef(null)
  const {
    extraFolders,
    setExtraFolders,
    createNewFolder,
    registerRef: registerExtraFolderRef,
    handleMouseDown: handleExtraFolderMouseDown,
    openContext: openExtraFolderContext,
    getExtraFolderTargets,
    revealOrCloneFromDescriptor,
    addItemToExtraFolder,
    bringExtraFolder
  } = useExtraFolders({ baseFolderRef, recycleBinRef: recycle.binRef, addItemToBin, extraFolderIcon, zCounterRef })

  const folder = useFolderIcon(
    recycle.binRef,
    addItemToBin,
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )
  baseFolderRef.current = folder
  function addItemToFolder(item) { folder.addItem(item) }
  const email = useEmailIcon(
    recycle.binRef,
    folder.ref,
    addItemToBin,
    addItemToFolder,
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )
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
  } = useMyComputer(
    recycle.binRef,
    folder.ref,
    addItemToBin,
    addItemToFolder,
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

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
    // Restore all extra folders
    recycle.items.filter(i => i.id && i.id.startsWith('new-folder-')).forEach(item => {
      revealOrCloneFromDescriptor(item)
    })
    recycle.setItems([])
  }
  function handleRestoreItem(id) {
    recycle.setItems(items => items.filter(i => i.id !== id))
    if (id === 'mycomputer') restoreComputer()
    if (id === 'email') email.restore()
    if (id === 'ghost-folder') folder.restore()
    if (id.startsWith && id.startsWith('new-folder-')) {
      const item = recycle.items.find(i => i.id === id)
      if (item) revealOrCloneFromDescriptor(item)
    }
  }
  function handleConfirmEmpty() { if (recycle.items.length) playTrashSound(); recycle.setItems([]); setConfirmClearOpen(false) }
  function handleCancelEmpty() { setConfirmClearOpen(false) }

  const handleFolderItemOpen = (id) => openItemFromBaseFolder(id, { email, bring, setCompModalOpen, setExtraFolders, folder, zCounterRef, bringExtraFolder })
  const handleFolderItemDelete = (id) => deleteItemFromBaseFolder(id, { folder, addItemToBin, email, setExtraFolders, extraFolderIcon })
  const handleFolderItemToDesktop = (id) => moveItemFromBaseFolderToDesktop(id, { folder, email, restoreComputer, setExtraFolders })

  // Desktop context menu & copy buffer
  const [deskMenu, setDeskMenu] = useState({ open: false, x: 0, y: 0 })
  const [copiedItem, setCopiedItem] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0) // force re-render on refresh

  function captureCopy(descriptor) { setCopiedItem(descriptor) }

  const handleCopyEmail = () => { captureCopy(email.copyDescriptor()); navigator.clipboard && navigator.clipboard.writeText(email.name).catch(()=>{}); email.closeContext() }
  const handleCopyFolder = () => { captureCopy(folder.copyDescriptor()); navigator.clipboard && navigator.clipboard.writeText(folder.name).catch(()=>{}); folder.closeContext() }
  const handleCopyBin = () => { captureCopy(recycle.copyDescriptor()); navigator.clipboard && navigator.clipboard.writeText(recycle.name).catch(()=>{}); recycle.closeContext() }
  const handleCopyComp = () => { captureCopy({ id: 'mycomputer', name: compName, icon: myComputerIconAsset }); navigator.clipboard && navigator.clipboard.writeText(compName).catch(()=>{}); closeCompContext() }

  function handleDesktopContextMenu(e) {
    if (e.target.closest('.windows-icon') || e.target.closest('.context-menu') || e.target.closest('.modal-window')) return
    e.preventDefault()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 180
    const menuHeight = 130
    const x = Math.min(e.clientX, vw - menuWidth - 4)
    const y = Math.min(e.clientY, vh - menuHeight - 4)
    setDeskMenu({ open: true, x, y })
  }
  function closeDesktopMenu() { setDeskMenu(m => ({ ...m, open: false })) }

  useEffect(() => {
    if (!deskMenu.open) return
    function onDoc(ev) { if (!(ev.target.closest && ev.target.closest('.context-menu'))) closeDesktopMenu() }
    function onKey(ev) { if (ev.key === 'Escape') closeDesktopMenu() }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', closeDesktopMenu)
    return () => { document.removeEventListener('mousedown', onDoc, true); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', closeDesktopMenu) }
  }, [deskMenu.open])

  function handleNewFolder() { closeDesktopMenu(); createNewFolder() }
  function handleRefresh() { closeDesktopMenu(); setRefreshTick(t => t + 1) }
  function handleCleanUp() { closeDesktopMenu(); recycle.setBinPos({ x: null, y: null }); folder.restore(); email.restore(); restoreComputer() }
  function handlePaste() {
    if (!copiedItem) return
    closeDesktopMenu()
    if (copiedItem.id === 'email') { email.restore(); if (copiedItem.name) email.commitRename(copiedItem.name) }
    else if (copiedItem.id === 'mycomputer') { restoreComputer(); if (copiedItem.name) compCommitRename(copiedItem.name) }
    else if (copiedItem.id === 'ghost-folder') { folder.restore(); if (copiedItem.name) folder.commitRename(copiedItem.name) }
  else if (copiedItem.id.startsWith && copiedItem.id.startsWith('new-folder-')) { revealOrCloneFromDescriptor(copiedItem) }
  }

  return (
  <div className="windows-bg" onContextMenu={handleDesktopContextMenu}>
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
          onMouseDown={(e) => { bring('comp'); handleCompMouseDown(e) }}
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
          onMouseDown={(e) => { bring('email'); email.handleMouseDown(e) }}
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
          onMouseDown={(e) => { bring('folder'); folder.handleMouseDown(e) }}
          onContextMenu={folder.handleContextMenu}
          onClick={folder.handleClick}
          onDoubleClick={folder.handleDoubleClick}
          name={folder.name}
          renaming={folder.renaming}
          onRenameCommit={folder.commitRename}
          onRenameCancel={folder.cancelRename}
        />
      )}
    {extraFolders.filter(f => f.visible).map(f => (
        <div
          key={f.id}
          className="windows-icon"
      style={{ left: f.pos.x, top: f.pos.y, position: 'fixed', zIndex: f.z || 55 }}
          ref={el => registerExtraFolderRef(f.id, el)}
          onMouseDown={(e) => handleExtraFolderMouseDown(f.id, e)}
          onDoubleClick={() => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, modalOpen: true } : fl))}
          onContextMenu={(e) => openExtraFolderContext(f.id, e)}
        >
          <img src={extraFolderIcon} alt={f.name} className="icon-img" draggable={false} />
          {f.renaming ? (
            <input
              className="icon-label"
              style={{ width: '100%', boxSizing: 'border-box', color: '#333' }}
              defaultValue={f.name}
              autoFocus
              onBlur={(e) => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, name: e.target.value ? e.target.value.slice(0,32) : fl.name, renaming: false } : fl))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, name: e.target.value ? e.target.value.slice(0,32) : fl.name, renaming: false } : fl))
                }
                if (e.key === 'Escape') {
                  setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, renaming: false } : fl))
                }
              }}
            />
          ) : (
            <div className="icon-label">{f.name}</div>
          )}
        </div>
      ))}

      <EmailContextMenu
        x={email.context?.x}
        y={email.context?.y}
        open={email.context?.open}
        onOpen={() => { email.setModalOpen(true); email.closeContext(); bring('email') }}
        onDelete={() => { email.deleteSelf(); email.closeContext() }}
        onRename={() => { email.startRename() }}
        onCopy={handleCopyEmail}
      />

      <FolderContextMenu
        x={folder.context?.x}
        y={folder.context?.y}
        open={folder.context?.open}
        onOpen={() => { folder.setModalOpen(true); folder.closeContext(); bring('folder') }}
        onDelete={() => { folder.deleteSelf(); folder.closeContext() }}
        onRename={() => { folder.startRename() }}
        onCopy={handleCopyFolder}
      />
      {extraFolders.map(f => f.context.open && (
        <ul key={f.id} className="context-menu" style={{ left: f.context.x, top: f.context.y }} onClick={e => e.stopPropagation()}>
          <li className="context-menu-item" onClick={() => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, modalOpen: true, context: { ...fl.context, open: false } } : fl))}>Open</li>
          <li className="context-menu-item" onClick={() => {
            setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, visible: false, modalOpen: false, context: { ...fl.context, open: false } } : fl))
            const tgt = extraFolders.find(fl => fl.id === f.id)
            if (tgt) addItemToBin({ id: tgt.id, name: tgt.name, icon: extraFolderIcon })
          }}>Delete</li>
          <li className="context-menu-item" onClick={() => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, renaming: true, context: { ...fl.context, open: false } } : fl))}>Rename</li>
          <li className="context-menu-item" onClick={() => {
            const tgt = extraFolders.find(fl => fl.id === f.id)
            if (tgt) {
              captureCopy({ id: tgt.id, name: tgt.name, icon: extraFolderIcon })
              navigator.clipboard && navigator.clipboard.writeText(tgt.name).catch(()=>{})
            }
            setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, context: { ...fl.context, open: false } } : fl))
          }}>Copy</li>
        </ul>
      ))}

      <BinContextMenu
        x={recycle.context.x}
        y={recycle.context.y}
        open={recycle.context.open}
        hasItems={recycle.items.length > 0}
        onOpen={() => { setBinModalOpen(true); recycle.closeContext(); bring('bin') }}
        onEmpty={() => { recycle.closeContext(); handleEmptyRequest() }}
        onRestoreAll={() => { recycle.closeContext(); handleRestoreAll() }}
        onRename={() => { recycle.startRename && recycle.startRename() }}
        onCopy={handleCopyBin}
      />

    <MyComputerContextMenu
        x={compContext?.x}
        y={compContext?.y}
        open={compContext?.open}
  onOpen={() => { setCompModalOpen(true); closeCompContext(); bring('comp') }}
        onDelete={() => { deleteComputer(); closeCompContext() }}
  onRename={() => { compStartRename() }}
  onCopy={handleCopyComp}
      />

      <RecycleBin
        binRef={recycle.binRef}
        style={binStyle}
        full={binFullState}
        onMouseDown={(e) => { bring('bin'); recycle.handleMouseDown(e) }}
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
              {folder.items.map(item => {
                return (
                  <div key={item.id} className="modal-bin-item" style={{ alignItems: 'center', gap: 4 }}>
                    <img src={item.icon} alt={item.name} className="modal-bin-icon" draggable={false} />
                    <span className="modal-bin-label" style={{ textAlign: 'center' }}>{item.name}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                      <button className="modal-bin-restore-btn" onClick={() => handleFolderItemOpen(item.id)}>Open</button>
                      <button className="modal-bin-restore-btn" onClick={() => handleFolderItemDelete(item.id)}>Delete</button>
                      <button className="modal-bin-restore-btn" onClick={() => handleFolderItemToDesktop(item.id)}>To Desktop</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ModalWindow>
      )}
    {extraFolders.filter(f => f.modalOpen).map(f => (
        <ExtraFolderModal
          key={f.id}
          f={f}
      zIndex={f.z || folderZ}
      bring={bring}
      bringExtraFolder={bringExtraFolder}
          setExtraFolders={setExtraFolders}
          email={email}
          setCompModalOpen={setCompModalOpen}
          restoreComputer={restoreComputer}
          folder={folder}
          addItemToBin={addItemToBin}
          extraFolderIcon={extraFolderIcon}
          onClose={() => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, modalOpen: false } : fl))}
        />
      ))}

  {menuOpen && <StartMenu menuRef={menuRef} />}
  <span style={{ display: 'none' }}>{refreshTick}</span>
      <DesktopContextMenu
        x={deskMenu.x}
        y={deskMenu.y}
        open={deskMenu.open}
        onNewFolder={handleNewFolder}
        onRefresh={handleRefresh}
        onCleanUp={handleCleanUp}
        onPaste={handlePaste}
        canPaste={!!copiedItem}
      />
    </div>
  )
}


export default App
