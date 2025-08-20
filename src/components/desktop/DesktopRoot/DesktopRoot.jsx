import React, { useState, useEffect, useRef } from 'react'
import ModalWindow from '../../modal/ModalWindow.jsx'
import { Taskbar } from '../Taskbar/Taskbar.jsx'
import { StartMenu } from '../StartMenu/StartMenu.jsx'
import { MyComputerIcon } from '../../my-computer/MyComputerIcon/MyComputerIcon.jsx'
import { EmailIcon } from '../../email/EmailIcon/EmailIcon.jsx'
import { RecycleBin } from '../../recycle-bin/RecycleBin/RecycleBin.jsx'
import { FolderIcon } from '../../folder/FolderIcon/FolderIcon.jsx'
import { FolderContextMenu } from '../../folder/FolderContextMenu/FolderContextMenu.jsx'
import { BinContextMenu } from '../../recycle-bin/BinContextMenu/BinContextMenu.jsx'
import { MyComputerContextMenu } from '../../my-computer/MyComputerContextMenu/MyComputerContextMenu.jsx'
import { EmailContextMenu } from '../../email/EmailContextMenu/EmailContextMenu.jsx'
import { DesktopContextMenu } from '../DesktopContextMenu/DesktopContextMenu.jsx'
import { EmailAssistant } from '../../email/EmailAssistant/EmailAssistant.jsx'
import trashSound from '../../../assets/win7/sounds/trash.mp3'
import { openItemFromBaseFolder, deleteItemFromBaseFolder, moveItemFromBaseFolderToDesktop } from '../../../hooks/useFolderActions.js'
import { ExtraFolderModal } from '../../folder/ExtraFolderModal/ExtraFolderModal.jsx'
import extraFolderIcon from '../../../assets/win7/icons/folder.ico'
import { useClock } from '../../../hooks/useClock.js'
import { useStartMenu } from '../../../hooks/useStartMenu.js'
import { useRecycleBin } from '../../../hooks/useRecycleBin.js'
import { useMyComputer } from '../../../hooks/useMyComputer.js'
import { useEmailIcon } from '../../../hooks/useEmailIcon.js'
import { useFolderIcon } from '../../../hooks/useFolderIcon.js'
import { useExtraFolders } from '../../../hooks/useExtraFolders.js'
import { useClonedIcons } from '../../../hooks/useClonedIcons.js'
import { useZLayers } from '../../../hooks/useZLayers.js'
import { usePointerMode } from '../../../hooks/usePointerMode.js'
import { useBinHandlers } from '../../../hooks/useBinHandlers.js'
import { useDesktopClipboard, buildCopyHandlers } from '../../../hooks/useDesktopClipboard.js'
import { useSounds } from '../../../hooks/useSounds.js'

export function DesktopRoot() {
  const { zCounterRef, bring, folderZ, emailZ, compZ, binZ, confirmZ } = useZLayers(150)
  const clock = useClock()
  const { open: menuOpen, setOpen: setMenuOpen, menuRef, buttonRef } = useStartMenu()
  const recycle = useRecycleBin()
  const { playClick, playTrash } = useSounds()

  function addItemToBin(item) {
    let added = false
    recycle.setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev
      added = true
      return [...prev, item]
    })
    if (added) playTrash()
  }

  // Hooks for desktop items
  const baseFolderRef = useRef(null)
  const extraFoldersHook = useExtraFolders({ baseFolderRef, recycleBinRef: recycle.binRef, addItemToBin, extraFolderIcon, zCounterRef })
  const { extraFolders, setExtraFolders, registerRef: registerExtraFolderRef, handleMouseDown: handleExtraFolderMouseDown, openContext: openExtraFolderContext, getExtraFolderTargets, revealOrCloneFromDescriptor, addItemToExtraFolder, bringExtraFolder } = extraFoldersHook
  const folder = useFolderIcon(recycle.binRef, addItemToBin, getExtraFolderTargets, (item, targetId) => addItemToExtraFolder(targetId, item))
  baseFolderRef.current = folder
  const email = useEmailIcon(recycle.binRef, folder.ref, addItemToBin, (i)=>folder.addItem(i), getExtraFolderTargets, (item, targetId) => addItemToExtraFolder(targetId, item))
  const cloned = useClonedIcons({ zCounterRef, recycleBinRef: recycle.binRef, addItemToBin, openHandlers: { email: () => { email.setModalOpen(true); bring('email') }, mycomputer: () => { setCompModalOpen(true); bring('comp') }, ghost: () => { folder.setModalOpen(true); bring('folder') } }, baseFolder: folder, getExtraFolderTargets, addItemToExtraFolder })
  const {
    ref: compRef, visible: compVisible, modalOpen: compModalOpen, setModalOpen: setCompModalOpen,
    handleMouseDown: handleCompMouseDown, handleClick: handleCompClick, handleDoubleClick: handleCompDoubleClick,
    style: compStyle, systemInfo: computerInfo, extra: compExtra, restore: restoreComputer, context: compContext,
    handleContextMenu: handleCompContextMenu, closeContext: closeCompContext, deleteSelf: deleteComputer,
    name: compName, renaming: compRenaming, startRename: compStartRename, commitRename: compCommitRename, cancelRename: compCancelRename
  } = useMyComputer(recycle.binRef, folder.ref, addItemToBin, (i)=>folder.addItem(i), getExtraFolderTargets, (item, targetId) => addItemToExtraFolder(targetId, item))

  const { isTouchOrCoarse } = usePointerMode()
  const binHandlers = useBinHandlers({ recycle, email, folder, revealOrCloneFromDescriptor, restoreComputer, trashSound, isTouchOrCoarse, bring })
  const { binModalOpen, confirmClearOpen, handleBinDoubleClick, handleBinClick, handleBinModalClose, handleEmptyRequest, handleRestoreAll, handleRestoreItem, handleConfirmEmpty, handleCancelEmpty } = binHandlers

  // Clipboard
  const extraFoldersRef = useRef([])
  extraFoldersRef.current = extraFolders
  const { copiedItem, captureCopy, paste } = useDesktopClipboard({ folder, email, recycle, extraFoldersRef, cloned, revealOrCloneFromDescriptor })
  const copyHandlers = buildCopyHandlers({ email, folder, recycle, compName, captureCopy, extraFolderIcon })

  const [deskMenu, setDeskMenu] = useState({ open: false, x: 0, y: 0 })
  const [refreshTick, setRefreshTick] = useState(0)

  // Bring effects
  useEffect(() => { if (folder.modalOpen) bring('folder') }, [folder.modalOpen, bring])
  useEffect(() => { if (email.modalOpen) bring('email') }, [email.modalOpen, bring])
  useEffect(() => { if (compModalOpen) bring('comp') }, [compModalOpen, bring])
  useEffect(() => { if (binModalOpen) bring('bin') }, [binModalOpen, bring])
  useEffect(() => { if (confirmClearOpen) bring('confirm') }, [confirmClearOpen, bring])

  const binFullState = recycle.items.length > 0
  const binStyle = recycle.binPos.x !== null && recycle.binPos.y !== null ? { left: recycle.binPos.x, top: recycle.binPos.y, position: 'fixed', zIndex: 60 } : { right: 38, bottom: 184, position: 'fixed', zIndex: 60 }

  function handleDesktopContextMenu(e) {
    if (e.target.closest('.windows-icon') || e.target.closest('.windows-bin') || e.target.closest('.context-menu') || e.target.closest('.modal-window')) return
    e.preventDefault(); playClick()
    const vw = window.innerWidth; const vh = window.innerHeight; const menuWidth = 180; const menuHeight = 130
    const x = Math.min(e.clientX, vw - menuWidth - 4); const y = Math.min(e.clientY, vh - menuHeight - 4)
    setDeskMenu({ open: true, x, y })
  }
  function closeDesktopMenu() { setDeskMenu(m => ({ ...m, open: false })) }
  useEffect(() => { if (!deskMenu.open) return; function onDoc(ev){ if(!(ev.target.closest&&ev.target.closest('.context-menu'))) closeDesktopMenu() } function onKey(ev){ if(ev.key==='Escape') closeDesktopMenu() } document.addEventListener('mousedown', onDoc, true); document.addEventListener('keydown', onKey); window.addEventListener('resize', closeDesktopMenu); return ()=>{ document.removeEventListener('mousedown', onDoc, true); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', closeDesktopMenu) } }, [deskMenu.open])

  function createNewFolder() {
    const id = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    setExtraFolders(list => [...list, { id, name: 'New Folder', icon: extraFolderIcon, items: [], visible: true, modalOpen: false, renaming: false, context: { open: false, x:0,y:0 }, pos: { x: 100 + list.length * 40, y: 100 + list.length * 40 }, z: folderZ }])
  }
  function handleNewFolder(){ closeDesktopMenu(); createNewFolder() }
  function handleRefresh(){ closeDesktopMenu(); setRefreshTick(t=>t+1) }
  function handleCleanUp(){ closeDesktopMenu(); recycle.setBinPos({ x:null,y:null }); folder.restore(); email.restore(); restoreComputer(); const startX=18,startY=300,gapY=90; setExtraFolders(list=>{ let idx=0; return list.map(f=> !f.visible?f:{ ...f, pos:{ x:startX, y:startY+idx++*gapY } }) }) }
  function handlePaste(){ if(!copiedItem) return; closeDesktopMenu(); paste() }
  function handleDeleteBinItem(id){ recycle.setItems(items=>items.filter(i=>i.id!==id)); playTrash() }

  // Folder modal item handlers (wrappers over folderActions for readability here)
  function handleFolderItemOpen(id){ openItemFromBaseFolder(id,{ email, bring, setCompModalOpen, setExtraFolders, folder, zCounterRef, bringExtraFolder }) }
  function handleFolderItemDelete(id){ deleteItemFromBaseFolder(id,{ folder, addItemToBin, email, setExtraFolders, extraFolderIcon }) }
  function handleFolderItemToDesktop(id){ moveItemFromBaseFolderToDesktop(id,{ folder, email, restoreComputer, setExtraFolders }) }

  return (
    <div className="windows-bg" onContextMenu={handleDesktopContextMenu}>
      <Taskbar startOpen={menuOpen} onToggleStart={() => setMenuOpen(!menuOpen)} buttonRef={buttonRef} clock={clock} />
      {compVisible && <MyComputerIcon iconRef={compRef} style={compStyle} onMouseDown={(e)=>{ bring('comp'); handleCompMouseDown(e) }} onClick={handleCompClick} onDoubleClick={handleCompDoubleClick} onContextMenu={handleCompContextMenu} name={compName} renaming={compRenaming} onRenameCommit={compCommitRename} onRenameCancel={compCancelRename} />}
      {email.visible && <EmailIcon iconRef={email.ref} style={email.style} onMouseDown={(e)=>{ bring('email'); email.handleMouseDown(e) }} onContextMenu={email.handleContextMenu} onClick={email.handleClick} onDoubleClick={email.handleDoubleClick} name={email.name} renaming={email.renaming} onRenameCommit={email.commitRename} onRenameCancel={email.cancelRename} />}
      {folder.visible && <FolderIcon iconRef={folder.ref} style={folder.style} onMouseDown={(e)=>{ bring('folder'); folder.handleMouseDown(e) }} onContextMenu={folder.handleContextMenu} onClick={folder.handleClick} onDoubleClick={folder.handleDoubleClick} name={folder.name} renaming={folder.renaming} onRenameCommit={folder.commitRename} onRenameCancel={folder.cancelRename} />}
      {extraFolders.filter(f=>f.visible).map(f=> (
        <div key={f.id} className="windows-icon" style={{ left:f.pos.x, top:f.pos.y, position:'fixed', zIndex:f.z||55 }} ref={el=>registerExtraFolderRef(f.id, el)} onMouseDown={(e)=>handleExtraFolderMouseDown(f.id,e)} onDoubleClick={()=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,modalOpen:true}:fl))} onContextMenu={(e)=>openExtraFolderContext(f.id,e)} onClick={()=>{ if(!isTouchOrCoarse) return; setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,modalOpen:true}:fl)); bringExtraFolder(f.id) }}>
          <img src={extraFolderIcon} alt={f.name} className="icon-img" draggable={false} />
          {f.renaming ? <input className="icon-label" style={{ width:'100%', boxSizing:'border-box', color:'#333' }} defaultValue={f.name} autoFocus onBlur={(e)=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,name:e.target.value?e.target.value.slice(0,32):fl.name, renaming:false}:fl))} onKeyDown={(e)=>{ if(e.key==='Enter') setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,name:e.target.value?e.target.value.slice(0,32):fl.name, renaming:false}:fl)); if(e.key==='Escape') setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,renaming:false}:fl)) }} /> : <div className="icon-label">{f.name}</div>}
        </div>
      ))}
      {cloned.clones.map(c => (
        <div key={c.id} className="windows-icon" style={{ left:c.pos.x, top:c.pos.y, position:'fixed', zIndex:c.z||56 }} ref={el=>{ if(el) cloned.cloneRefs.current[c.id]=el }} onMouseDown={(e)=>cloned.handleMouseDown(c.id,e)} onDoubleClick={()=>cloned.openClone(c)} onContextMenu={(e)=>cloned.contextMenu(c.id,e)}>
          <img src={c.icon} alt={c.name} className="icon-img" draggable={false} />
          {c.renaming ? <input className="icon-label" style={{ width:'100%', boxSizing:'border-box', color:'#333' }} defaultValue={c.name} autoFocus onBlur={(e)=>cloned.rename(c.id, e.target.value || c.name)} onKeyDown={(e)=>{ if(e.key==='Enter') cloned.rename(c.id, e.target.value||c.name); if(e.key==='Escape') cloned.rename(c.id,c.name) }} /> : <div className="icon-label">{c.name}</div>}
        </div>
      ))}
      <EmailContextMenu x={email.context?.x} y={email.context?.y} open={email.context?.open} onOpen={()=>{ email.setModalOpen(true); email.closeContext(); bring('email') }} onDelete={()=>{ email.deleteSelf(); email.closeContext() }} onRename={()=>{ email.startRename() }} onCopy={()=>{ copyHandlers.copyEmail(); email.closeContext() }} />
      <FolderContextMenu x={folder.context?.x} y={folder.context?.y} open={folder.context?.open} onOpen={()=>{ folder.setModalOpen(true); folder.closeContext(); bring('folder') }} onDelete={()=>{ folder.deleteSelf(); folder.closeContext() }} onRename={()=>{ folder.startRename() }} onCopy={()=>{ copyHandlers.copyFolder(); folder.closeContext() }} />
      {extraFolders.map(f=> f.context.open && (
        <ul key={f.id} className="context-menu" style={{ left:f.context.x, top:f.context.y }} onClick={e=>e.stopPropagation()}>
          <li className="context-menu-item" onClick={()=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,modalOpen:true,context:{...fl.context,open:false}}:fl))}>Open</li>
          <li className="context-menu-item" onClick={()=>{ setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,visible:false,modalOpen:false,context:{...fl.context,open:false}}:fl)); const tgt = extraFolders.find(fl=>fl.id===f.id); if(tgt) addItemToBin({ id:tgt.id, name:tgt.name, icon:extraFolderIcon }) }}>Delete</li>
          <li className="context-menu-item" onClick={()=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,renaming:true,context:{...fl.context,open:false}}:fl))}>Rename</li>
          <li className="context-menu-item" onClick={()=>{ const tgt = extraFolders.find(fl=>fl.id===f.id); if(tgt) copyHandlers.copyExtraFolder(tgt); setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,context:{...fl.context,open:false}}:fl)) }}>Copy</li>
        </ul>
      ))}
      <BinContextMenu x={recycle.context.x} y={recycle.context.y} open={recycle.context.open} hasItems={recycle.items.length>0} onOpen={()=>{ recycle.closeContext(); handleBinDoubleClick() }} onEmpty={()=>{ recycle.closeContext(); handleEmptyRequest() }} onRestoreAll={()=>{ recycle.closeContext(); handleRestoreAll() }} onRename={()=>{ recycle.startRename && recycle.startRename() }} onCopy={()=>{ copyHandlers.copyBin(); recycle.closeContext() }} />
      <MyComputerContextMenu x={compContext?.x} y={compContext?.y} open={compContext?.open} onOpen={()=>{ setCompModalOpen(true); closeCompContext(); bring('comp') }} onDelete={()=>{ deleteComputer(); closeCompContext() }} onRename={()=>{ compStartRename() }} onCopy={()=>{ copyHandlers.copyComputer(); closeCompContext() }} />
      <RecycleBin binRef={recycle.binRef} style={binStyle} full={binFullState} onMouseDown={(e)=>{ bring('bin'); recycle.handleMouseDown(e) }} onDoubleClick={handleBinDoubleClick} onClick={handleBinClick} onContextMenu={recycle.handleContextMenu} onTouchStart={recycle.handleTouchStart} onTouchMove={recycle.cancelLongPress} onTouchEnd={recycle.cancelLongPress} name={recycle.name} renaming={recycle.renaming} onRenameCommit={recycle.commitRename} onRenameCancel={recycle.cancelRename} />
      {binModalOpen && (
        <ModalWindow title={recycle.name} onClose={handleBinModalClose} zIndex={binZ} onActivate={()=>bring('bin')}>
          {recycle.items.length===0 ? <div className="modal-empty-message">The Recycle Bin is empty.</div> : (
            <div className="modal-bin-items">
              {recycle.items.map(item => (
                <div key={item.id} className="modal-bin-item" onDoubleClick={()=>handleRestoreItem(item.id)}>
                  <img src={item.icon} alt={item.name} className="modal-bin-icon" draggable={false} />
                  <span className="modal-bin-label">{item.name}</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, width:'100%' }}>
                    <button className="modal-bin-restore-btn" style={{ width:'100%' }} onClick={()=>handleRestoreItem(item.id)}>Restore</button>
                    <button className="modal-bin-restore-btn" style={{ width:'100%' }} onClick={()=>handleDeleteBinItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      )}
      {confirmClearOpen && (
        <ModalWindow title="Confirm Empty" onClose={handleCancelEmpty} zIndex={confirmZ} onActivate={()=>bring('confirm')}>
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
        <ModalWindow title={compName} onClose={()=>setCompModalOpen(false)} zIndex={compZ} onActivate={()=>bring('comp')}>
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
      <EmailAssistant open={email.modalOpen} onClose={()=>email.setModalOpen(false)} zIndex={emailZ} onActivate={()=>bring('email')} appName={email.name} />
      {folder.modalOpen && (
        <ModalWindow title={folder.name} onClose={()=>folder.setModalOpen(false)} zIndex={folderZ} onActivate={()=>bring('folder')}>
          {folder.items.length===0 ? <div className="modal-empty-message">The folder is empty.</div> : (
            <div className="modal-bin-items" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {folder.items.map(item => (
                <div key={item.id} className="modal-bin-item" style={{ alignItems:'center', gap:4 }}>
                  <img src={item.icon} alt={item.name} className="modal-bin-icon" draggable={false} />
                  <span className="modal-bin-label" style={{ textAlign:'center' }}>{item.name}</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:2, width:'100%' }}>
                    <button className="modal-bin-restore-btn" onClick={()=>handleFolderItemOpen(item.id)}>Open</button>
                    <button className="modal-bin-restore-btn" onClick={()=>handleFolderItemDelete(item.id)}>Delete</button>
                    <button className="modal-bin-restore-btn" onClick={()=>handleFolderItemToDesktop(item.id)}>To Desktop</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      )}
      {extraFolders.filter(f=>f.modalOpen).map(f => (
        <ExtraFolderModal key={f.id} f={f} zIndex={f.z||folderZ} bring={bring} bringExtraFolder={bringExtraFolder} setExtraFolders={setExtraFolders} email={email} setCompModalOpen={setCompModalOpen} restoreComputer={restoreComputer} folder={folder} addItemToBin={addItemToBin} extraFolderIcon={extraFolderIcon} onClose={()=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,modalOpen:false}:fl))} />
      ))}
      {menuOpen && <StartMenu menuRef={menuRef} />}
      <span style={{ display:'none' }}>{refreshTick}</span>
      <DesktopContextMenu x={deskMenu.x} y={deskMenu.y} open={deskMenu.open} onNewFolder={handleNewFolder} onRefresh={handleRefresh} onCleanUp={handleCleanUp} onPaste={handlePaste} canPaste={!!copiedItem} />
    </div>
  )
}
