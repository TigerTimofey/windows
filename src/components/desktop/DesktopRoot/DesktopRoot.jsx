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
import { deleteItemFromBaseFolder, moveItemFromBaseFolderToDesktop } from '../../../hooks/useFolderActions.js'
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
import { useInternetIcon } from '../../../hooks/useInternetIcon.js'
import { InternetIcon } from '../../internet/InternetIcon.jsx'
import { InternetContextMenu } from '../../internet/InternetContextMenu.jsx'
import { useMinesweeperIcon } from '../../../hooks/useMinesweeperIcon.js'
import { MinesweeperIcon } from '../../minesweeper/MinesweeperIcon.jsx'
import { MinesweeperContextMenu } from '../../minesweeper/MinesweeperContextMenu.jsx'
import { MinesweeperGameModal } from '../../minesweeper/MinesweeperGameModal.jsx'
import binIcon from '../../../assets/win7/icons/bin-emty.svg'
import emailIcon from '../../../assets/win7/icons/email.ico'
import folderIcon from '../../../assets/win7/icons/folder.ico'
import computerIcon from '../../../assets/win7/icons/mycomputer.svg'
import minesweeperIcon from '../../../assets/win7/icons/minesweeper.png'
import { useBlogIcon } from '../../../hooks/useBlogIcon.js'
import { BlogIcon } from '../../blog/BlogIcon.jsx'
import { BlogContextMenu } from '../../blog/BlogContextMenu.jsx'
import { BlogModal } from '../../blog/BlogModal.jsx'
import blogIcon from '../../../assets/win7/icons/blog.ico'
import { useStoryIcon } from '../../../hooks/useStoryIcon.js'
import { StoryIcon } from '../../story/StoryIcon.jsx'
import { StoryContextMenu } from '../../story/StoryContextMenu.jsx'
import { StoryModal } from '../../story/StoryModal.jsx'
import storyIcon from '../../../assets/win7/icons/story.ico'
import { useSocialIcon } from '../../../hooks/useSocialIcon.js'
import { SocialIcon } from '../../social/SocialIcon.jsx'
import { SocialContextMenu } from '../../social/SocialContextMenu.jsx'
import { SocialModal } from '../../social/SocialModal.jsx'
import socialIcon from '../../../assets/win7/icons/social.ico'

export function DesktopRoot({ onShutdown }) {
  const { zCounterRef, bring, folderZ, emailZ, compZ, binZ, confirmZ, blogZ, minesweeperZ, storyZ, socialZ } = useZLayers(150)
  const clock = useClock()
  const { open: menuOpen, setOpen: setMenuOpen, menuRef, buttonRef } = useStartMenu()
  const recycle = useRecycleBin()
  const { playClick: originalPlayClick, playTrash: originalPlayTrash } = useSounds()

  const playClick = () => { originalPlayClick() }
  const playTrash = () => { originalPlayTrash() }

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
  const cloned = useClonedIcons({ zCounterRef, recycleBinRef: recycle.binRef, addItemToBin, openHandlers: { email: () => { email.setModalOpen(true); bring('email') }, mycomputer: () => { setCompModalOpen(true); bring('comp') }, ghost: () => { folder.setModalOpen(true); bring('folder') }, story: () => { story.setModalOpen(true); bring('story') }, social: () => { social.setModalOpen(true); bring('social') } }, baseFolder: folder, getExtraFolderTargets, addItemToExtraFolder })
  const {
    ref: compRef, visible: compVisible, modalOpen: compModalOpen, setModalOpen: setCompModalOpen,
    handleMouseDown: handleCompMouseDown, handleClick: handleCompClick, handleDoubleClick: handleCompDoubleClick,
    style: compStyle, systemInfo: computerInfo, extra: compExtra, restore: restoreComputer, context: compContext,
    handleContextMenu: handleCompContextMenu, closeContext: closeCompContext, deleteSelf: deleteComputer,
    name: compName, renaming: compRenaming, startRename: compStartRename, commitRename: compCommitRename, cancelRename: compCancelRename
  } = useMyComputer(recycle.binRef, folder.ref, addItemToBin, (i)=>folder.addItem(i), getExtraFolderTargets, (item, targetId) => addItemToExtraFolder(targetId, item))

  // FIX: Use addItemToBin for Internet icon, not recycle.addItem
  const internet = useInternetIcon(
    recycle.binRef,
    addItemToBin,
    folder.ref,
    (item) => folder.addItem(item),
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

  const minesweeper = useMinesweeperIcon(
    recycle.binRef,
    addItemToBin,
    folder.ref,
    (item) => folder.addItem(item),
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

  const blog = useBlogIcon(
    recycle.binRef,
    addItemToBin,
    folder.ref,
    (item) => folder.addItem(item),
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

  const story = useStoryIcon(
    recycle.binRef,
    addItemToBin,
    folder.ref,
    (item) => folder.addItem(item),
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

  const social = useSocialIcon(
    recycle.binRef,
    addItemToBin,
    folder.ref,
    (item) => folder.addItem(item),
    getExtraFolderTargets,
    (item, targetId) => addItemToExtraFolder(targetId, item)
  )

  const { isTouchOrCoarse } = usePointerMode()
  // Pass restoreInternet to binHandlers
  const binHandlers = useBinHandlers({
    recycle,
    email,
    folder,
    revealOrCloneFromDescriptor,
    restoreComputer,
    trashSound,
    isTouchOrCoarse,
    bring,
    restoreInternet: internet.restore,
    restoreMinesweeper: minesweeper.restore,
    restoreBlog: blog.restore,
    restoreStory: story.restore,
    restoreSocial: social.restore
  })
  const { binModalOpen, confirmClearOpen, handleBinDoubleClick, handleBinClick, handleBinModalClose, handleEmptyRequest, handleRestoreAll, handleRestoreItem, handleConfirmEmpty, handleCancelEmpty } = binHandlers

  // Clipboard
  const extraFoldersRef = useRef([])
  extraFoldersRef.current = extraFolders
  const { copiedItem, captureCopy, paste } = useDesktopClipboard({ folder, email, recycle, extraFoldersRef, cloned, revealOrCloneFromDescriptor, story, social })
  const copyHandlers = buildCopyHandlers({
    email,
    folder,
    recycle,
    compName,
    captureCopy,
    extraFolderIcon,
    internet,
    minesweeper,
    blog,
    story,
    social
  })

  const [deskMenu, setDeskMenu] = useState({ open: false, x: 0, y: 0 })
  const [refreshTick, setRefreshTick] = useState(0)

  // Minimized modals state
  const [minimizedModals, setMinimizedModals] = useState([])

  // Start menu modals
  const [programsModal, setProgramsModal] = useState(false)
  const [gamesModal, setGamesModal] = useState(false)

  // Helper to add/remove minimized modal
  function minimizeModal(id, title, icon) {
    setMinimizedModals(list => [...list, { id, title, icon }])
  }
  function restoreModal(id) {
    setMinimizedModals(list => list.filter(m => m.id !== id))
    if (id === 'email') email.setModalOpen(true)
    if (id === 'folder') folder.setModalOpen(true)
    if (id === 'comp') setCompModalOpen(true)
    if (id === 'bin') recycle.setBinModalOpen(true)
    if (id === 'internet') internet.setModalOpen(true)
    if (id === 'minesweeper') minesweeper.setModalOpen(true)
    if (id === 'blog') blog.setModalOpen(true)
    if (id === 'story') story.setModalOpen(true)
    if (id === 'social') social.setModalOpen(true)
    // Restore extra folders
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, modalOpen: true } : f))
    // Restore cloned items
    if (cloned.clones.some(c => c.id === id)) {
      cloned.openClone({ id })
    }
  }

  // Start menu handlers
  const handlePrograms = () => setProgramsModal(true)
  const handleGames = () => setGamesModal(true)

  // Bring effects
  useEffect(() => { if (folder.modalOpen) bring('folder') }, [folder.modalOpen, bring])
  useEffect(() => { if (email.modalOpen) bring('email') }, [email.modalOpen, bring])
  useEffect(() => { if (compModalOpen) bring('comp') }, [compModalOpen, bring])
  useEffect(() => { if (binModalOpen) bring('bin') }, [binModalOpen, bring])
  useEffect(() => { if (confirmClearOpen) bring('confirm') }, [confirmClearOpen, bring])
  useEffect(() => { if (social.modalOpen) bring('social') }, [social.modalOpen, bring])

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

    // When creating new folders, set z to 55 (always less than modal zIndex 130)
  function createNewFolder() {
    const taskbar = document.querySelector('.windows-taskbar')
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 40
    const maxY = window.innerHeight - taskbarHeight - 100 - 10
    const maxX = window.innerWidth - 64
    const iconsPerRow = 5
    const iconSpacingX = 100
    const iconSpacingY = 90
    const baseX = 18
    const baseY = 480
    const visibleCount = extraFolders.filter(f => f.visible).length
    let posX = baseX + (visibleCount % iconsPerRow) * iconSpacingX
    let posY = baseY + Math.floor(visibleCount / iconsPerRow) * iconSpacingY
    if (posY > maxY) posY = maxY
    if (posX > maxX) posX = maxX
    const id = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    setExtraFolders(list => [
      ...list,
      {
        id,
        name: 'New Folder',
        icon: extraFolderIcon,
        items: [],
        visible: true,
        modalOpen: false,
        renaming: false,
        context: { open: false, x:0,y:0 },
        pos: { x: posX, y: posY },
        z: 55
      }
    ])
  }
  function handleNewFolder(){ closeDesktopMenu(); createNewFolder(); }
  function handleRefresh(){ closeDesktopMenu(); setRefreshTick(t=>t+1) }
  function handleCleanUp(){
    closeDesktopMenu();
    recycle.setBinPos({ x:null,y:null });
    folder.restore();
    email.restore();
    restoreComputer();
    internet.restore();
    minesweeper.restore();
    blog.restore();
    story.restore();
    social.restore();
    // Move all visible extra folders (new and copied) to their default positions
    const startX = 18, startY = 480, gapY = 100;
    setExtraFolders(list => {
      let idx = 0;
      return list.map(f =>
        !f.visible
          ? f
          : { ...f, pos: { x: startX, y: startY + idx++ * gapY } }
      )
    })
  }
  function handlePaste(){ if(!copiedItem) return;closeDesktopMenu(); paste() }
  function handleDeleteBinItem(id){ recycle.setItems(items=>items.filter(i=>i.id!==id)); playTrash() }

  // Folder modal item handlers (wrappers over folderActions for readability here)
  function handleFolderItemOpen(id){
    // Open logic for all supported types
    if (id === 'email') { email.setModalOpen(true); bring('email'); return }
    if (id === 'mycomputer') { setCompModalOpen(true); bring('comp'); return }
    if (id === 'ghost-folder') { folder.setModalOpen(true); bring('folder'); return }
    if (id === 'internet') { internet.setModalOpen(true); bring('internet'); return }
    if (id === 'minesweeper') { minesweeper.setModalOpen(true); bring('minesweeper'); return }
    if (id === 'blog') { blog.setModalOpen(true); bring('blog'); return }
    if (id === 'story') { story.setModalOpen(true); bring('story'); return }
    if (id === 'social') { social.setModalOpen(true); bring('social'); return }
    // Support cloned instances stored with clone-* ids
    if (id.startsWith('clone-email')) { email.setModalOpen(true); bring('email'); return }
    if (id.startsWith('clone-mycomputer')) { setCompModalOpen(true); bring('comp'); return }
    if (id.startsWith('clone-ghost')) { folder.setModalOpen(true); bring('folder'); return }
    if (id.startsWith('clone-internet')) { internet.setModalOpen(true); bring('internet'); return }
    if (id.startsWith('clone-minesweeper')) { minesweeper.setModalOpen(true); bring('minesweeper'); return }
    if (id.startsWith('clone-blog')) { blog.setModalOpen(true); bring('blog'); return }
    if (id.startsWith('clone-story')) { story.setModalOpen(true); bring('story'); return }
    if (id.startsWith('clone-social')) { social.setModalOpen(true); bring('social'); return }
    // Support nested extra folders
    if (id.startsWith('new-folder-')) {
      setExtraFolders(list => list.map(fl => fl.id === id ? { ...fl, modalOpen: true } : fl))
      bringExtraFolder && bringExtraFolder(id)
      return
    }
  }

  function handleFolderItemDelete(id){
    // Delete logic for all supported types
    if (id === 'internet') {
      folder.removeItem('internet')
      addItemToBin({ id: 'internet', name: internet.name, icon: internet.copyDescriptor().icon })
      return
    }
    if (id === 'minesweeper') {
      folder.removeItem('minesweeper')
      addItemToBin({ id: 'minesweeper', name: minesweeper.name, icon: minesweeper.copyDescriptor().icon })
      return
    }
    if (id === 'email') {
      folder.removeItem('email')
      addItemToBin({ id: 'email', name: email.name, icon: email.copyDescriptor().icon })
      return
    }
    if (id === 'mycomputer') {
      folder.removeItem('mycomputer')
      addItemToBin({ id: 'mycomputer', name: compName, icon: computerIcon })
      return
    }
    if (id === 'ghost-folder') {
      folder.removeItem('ghost-folder')
      addItemToBin({ id: 'ghost-folder', name: folder.name, icon: folderIcon })
      return
    }
    if (id === 'blog') {
      folder.removeItem('blog')
      addItemToBin({ id: 'blog', name: blog.name, icon: blogIcon })
      return
    }
    if (id === 'story') {
      folder.removeItem('story')
      addItemToBin({ id: 'story', name: story.name, icon: storyIcon })
      return
    }
    if (id === 'social') {
      folder.removeItem('social')
      addItemToBin({ id: 'social', name: social.name, icon: socialIcon })
      return
    }
    if (id.startsWith('new-folder-')) {
      folder.removeItem(id)
      addItemToBin({ id, name: 'New Folder', icon: extraFolderIcon })
      setExtraFolders(list => list.map(fl => fl.id === id ? { ...fl, visible: false, modalOpen: false } : fl))
      return
    }
    // Support cloned instances
    if (id.startsWith('clone-email') || id.startsWith('clone-mycomputer') || id.startsWith('clone-ghost') || id.startsWith('clone-internet') || id.startsWith('clone-minesweeper') || id.startsWith('clone-blog') || id.startsWith('clone-story') || id.startsWith('clone-social')) {
      folder.removeItem(id)
      addItemToBin({ id, name: 'Cloned Item', icon: folderIcon })
      return
    }
    // Fallback to base logic
    deleteItemFromBaseFolder(id,{ folder, addItemToBin, email, setExtraFolders, extraFolderIcon, internet, blog, story, social })
  }

  function handleFolderItemToDesktop(id){
    // Remove item from all extra folder modals if present
    setExtraFolders(list =>
      list.map(fl =>
        fl.items && fl.items.some(it => it.id === id)
          ? { ...fl, items: fl.items.filter(it => it.id !== id) }
          : fl
      )
    )
    // Move logic for all supported types
    if (id === 'internet') { folder.removeItem('internet'); internet.restore(); return }
    if (id === 'minesweeper') { folder.removeItem('minesweeper'); minesweeper.restore(); return }
    if (id === 'email') { folder.removeItem('email'); email.restore(); return }
    if (id === 'mycomputer') { folder.removeItem('mycomputer'); restoreComputer(); return }
    if (id === 'ghost-folder') { folder.removeItem('ghost-folder'); folder.restore(); return }
    if (id === 'blog') { folder.removeItem('blog'); blog.restore(); return }
    if (id === 'story') { folder.removeItem('story'); story.restore(); return }
    if (id === 'social') { folder.removeItem('social'); social.restore(); return }
    if (id.startsWith('new-folder-')) {
      folder.removeItem(id)
      // Restore to desktop at clean-up position
      setExtraFolders(list => {
        // Calculate position as in handleCleanUp
        const startX = 18, startY = 480, gapY = 100
        let idx = 0
        return list.map(fl =>
          fl.visible && fl.id !== id
            ? { ...fl, pos: { x: startX, y: startY + idx++ * gapY } }
            : fl
        ).map(fl =>
          fl.id === id
            ? { ...fl, visible: true, pos: { x: startX, y: startY + idx * gapY } }
            : fl
        )
      })
      return
    }
    // Support cloned instances
    if (id.startsWith('clone-email')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-mycomputer')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-ghost')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-internet')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-minesweeper')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-blog')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-story')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    if (id.startsWith('clone-social')) {
      folder.removeItem(id)
      const item = folder.items.find(it => it.id === id)
      if (item) cloned.restoreClone(item)
      return
    }
    // Fallback to base logic
    moveItemFromBaseFolderToDesktop(id,{ folder, email, restoreComputer, setExtraFolders, internet, blog, social })
  }

  return (
    <div
      className="windows-bg"
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        // Close all context menus for all icons (including clones, folders, etc.)
        cloned.closeAllContexts()
        folder.closeContext && folder.closeContext()
        email.closeContext && email.closeContext()
        recycle.closeContext && recycle.closeContext()
        internet.closeContext && internet.closeContext()
        minesweeper.closeContext && minesweeper.closeContext()
        blog.closeContext && blog.closeContext()
        setExtraFolders(list => list.map(f => f.context && f.context.open ? { ...f, context: { ...f.context, open: false } } : f))
        closeDesktopMenu()
      }}
    >
      <Taskbar
        startOpen={menuOpen}
        onToggleStart={() => setMenuOpen(!menuOpen)}
        buttonRef={buttonRef}
        clock={clock}
        minimizedModals={minimizedModals}
        onRestoreModal={restoreModal}
      />
      {compVisible && <MyComputerIcon iconRef={compRef} style={compStyle} onMouseDown={(e)=>{ bring('comp'); handleCompMouseDown(e) }} onClick={handleCompClick} onDoubleClick={handleCompDoubleClick} onContextMenu={handleCompContextMenu} name={compName} renaming={compRenaming} onRenameCommit={compCommitRename} onRenameCancel={compCancelRename} />}
      {email.visible && <EmailIcon iconRef={email.ref} style={email.style} onMouseDown={(e)=>{ bring('email'); email.handleMouseDown(e) }} onContextMenu={email.handleContextMenu} onClick={email.handleClick} onDoubleClick={email.handleDoubleClick} name={email.name} renaming={email.renaming} onRenameCommit={email.commitRename} onRenameCancel={email.cancelRename} />}
      {folder.visible && <FolderIcon iconRef={folder.ref} style={folder.style} onMouseDown={(e)=>{ bring('folder'); folder.handleMouseDown(e) }} onContextMenu={folder.handleContextMenu} onClick={folder.handleClick} onDoubleClick={folder.handleDoubleClick} name={folder.name} renaming={folder.renaming} onRenameCommit={folder.commitRename} onRenameCancel={folder.cancelRename} />}
      {/* Render extra folders with zIndex 55 */}
      {extraFolders.filter(f=>f.visible).map(f=> (
        <div
          key={f.id}
          className="windows-icon"
          style={{ left:f.pos.x, top: f.pos.y, position:'fixed', zIndex:55 }}
          ref={el=>registerExtraFolderRef(f.id, el)}
          onMouseDown={(e)=>handleExtraFolderMouseDown(f.id,e)}
          onDoubleClick={()=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,modalOpen:true}:fl))}
          onContextMenu={(e)=>openExtraFolderContext(f.id,e)}
          onClick={()=>{
            // Always open modal on mobile/touch for new-folder-* and extra-folder types
            if (!isTouchOrCoarse) return
            setExtraFolders(list => list.map(fl =>
              fl.id === f.id
                ? { ...fl, modalOpen: true }
                : fl
            ))
            bringExtraFolder(f.id)
          }}
        >
          <img src={extraFolderIcon} alt={f.name} className="icon-img" draggable={false} />
          {f.renaming ? <input className="icon-label" style={{ width:'100%', boxSizing:'border-box', color:'#333' }} defaultValue={f.name} autoFocus onBlur={(e)=>setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,name:e.target.value?e.target.value.slice(0,32):fl.name, renaming:false}:fl))} onKeyDown={(e)=>{ if(e.key==='Enter') setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,name:e.target.value?e.target.value.slice(0,32):fl.name, renaming:false}:fl)); if(e.key==='Escape') setExtraFolders(list=>list.map(fl=>fl.id===f.id?{...fl,renaming:false}:fl)) }} /> : <div className="icon-label">{f.name}</div>}
        </div>
      ))}
      {/* Render cloned/pasted icons with zIndex 56 (less than modal zIndex 130) */}
      {cloned.clones.map(clone => {
        let IconComponent, ContextMenuComponent
        if (clone.type === 'email') {
          IconComponent = EmailIcon
          ContextMenuComponent = EmailContextMenu
        } else if (clone.type === 'folder') {
          IconComponent = FolderIcon
          ContextMenuComponent = FolderContextMenu
        } else if (clone.type === 'internet') {
          IconComponent = InternetIcon
          ContextMenuComponent = InternetContextMenu
        } else if (clone.type === 'minesweeper') {
          IconComponent = MinesweeperIcon
          ContextMenuComponent = MinesweeperContextMenu
        } else if (clone.type === 'mycomputer') {
          IconComponent = MyComputerIcon
          ContextMenuComponent = MyComputerContextMenu
        } else if (clone.type === 'blog') {
          IconComponent = BlogIcon
          ContextMenuComponent = BlogContextMenu
        } else if (clone.type === 'story') {
          IconComponent = StoryIcon
          ContextMenuComponent = StoryContextMenu
        }
        // Special open logic for internet (GitHub) clones
        const openGitHub = (e) => {
          if (e) e.preventDefault()
          window.open('https://github.com/TigerTimofey/windows', '_blank', 'noopener,noreferrer')
        }
        const isTouchOrCoarse = typeof window !== 'undefined' && (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0) ||
          (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
        )
        // Double click handler for minesweeper clones
        const handleCloneDoubleClick = () => {
          if (clone.type === 'minesweeper') {
            minesweeper.setModalOpen(true)
            cloned.openClone(clone)
          } else {
            cloned.openClone(clone)
          }
        }
        return (
          <React.Fragment key={clone.id}>
            <IconComponent
              iconRef={el => cloned.cloneRefs.current[clone.id] = el}
              style={{ position: 'fixed', left: clone.pos.x, top: clone.pos.y, zIndex: clone.z }}
              onMouseDown={e => cloned.handleMouseDown(clone.id, e)}
              onContextMenu={e => cloned.contextMenu(clone.id, e)}
              name={clone.name}
              renaming={clone.renaming}
              onRenameCommit={newName => cloned.rename(clone.id, newName)}
              onRenameCancel={() => cloned.startRename(clone.id)}
              onClick={clone.type === 'internet' && isTouchOrCoarse ? openGitHub : undefined}
              onDoubleClick={
                clone.type === 'internet'
                  ? (!isTouchOrCoarse ? openGitHub : undefined)
                  : handleCloneDoubleClick
              }
            />
            <ContextMenuComponent
              x={clone.context.x}
              y={clone.context.y}
              open={clone.context.open}
              onOpen={() => {
                if (clone.type === 'internet') {
                  openGitHub()
                } else if (clone.type === 'minesweeper') {
                  minesweeper.setModalOpen(true)
                  cloned.openClone(clone)
                } else if (clone.type === 'mycomputer') {
                  setCompModalOpen(true)
                  cloned.openClone(clone)
                } else {
                  cloned.openClone(clone)
                }
                // Close context menu after action
                cloned.closeAllContexts(clone.id)
              }}
              onDelete={() => {
                cloned.deleteClone(clone.id)
                cloned.closeAllContexts(clone.id)
              }}
              onRename={() => {
                cloned.startRename(clone.id)
                cloned.closeAllContexts(clone.id)
              }}
              onCopy={() => {
                cloned.copyDescriptor(clone.id)
                cloned.closeAllContexts(clone.id)
              }}
            />
          </React.Fragment>
        )
      })}
      <EmailContextMenu x={email.context?.x} y={email.context?.y} open={email.context?.open} onOpen={()=>{ email.setModalOpen(true); email.closeContext(); bring('email') }} onDelete={()=>{ email.deleteSelf(); email.closeContext() }} onRename={()=>{ email.startRename() }} onCopy={()=>{ copyHandlers.copyEmail(); email.closeContext() }} />
      <FolderContextMenu x={folder.context?.x} y={folder.context?.y} open={folder.context?.open} onOpen={()=>{ folder.setModalOpen(true); folder.closeContext(); bring('folder') }} onDelete={()=>{ folder.deleteSelf(); folder.closeContext() }} onRename={()=>{ folder.startRename() }} onCopy={()=>{ copyHandlers.copyFolder(); folder.closeContext() }} />
      {extraFolders.map(f=> f.context.open && (
        <ul key={f.id} className="context-menu" style={{ left:f.context.x, top:f.context.y }} onClick={e=>e.stopPropagation()}>
          <li className="context-menu-item" onClick={() =>
    setExtraFolders(list => list.map(fl =>
      fl.id === f.id
        ? { ...fl, modalOpen: true, context: { ...fl.context, open: false } }
        : fl
    ))
  }>Open</li>
  <li className="context-menu-item" onClick={() => {
    setExtraFolders(list => list.map(fl =>
      fl.id === f.id
        ? { ...fl, visible: false, modalOpen: false, context: { ...fl.context, open: false } }
        : fl
    ))
    const tgt = extraFolders.find(fl => fl.id === f.id)
    if (tgt) addItemToBin({ id: tgt.id, name: tgt.name, icon: extraFolderIcon })
  }}>Delete</li>
  <li className="context-menu-item" onClick={() =>
    setExtraFolders(list => list.map(fl =>
      fl.id === f.id
        ? { ...fl, renaming: true, context: { ...fl.context, open: false } }
        : fl
    ))
  }>Rename</li>
  <li className="context-menu-item" onClick={() => {
    const tgt = extraFolders.find(fl => fl.id === f.id)
    if (tgt) {
      if (['email', 'mycomputer', 'ghost-folder', 'internet', 'minesweeper'].includes(tgt.type)) {
        cloned.addClone({
          type: tgt.type,
          name: tgt.name,
          icon: tgt.icon,
          baseNames: extraFolders.map(fl => fl.name)
        })
        // If it's a GitHub/internet icon, open the link after copy
        if (tgt.type === 'internet') {
          window.open('https://github.com/TigerTimofey/windows', '_blank', 'noopener,noreferrer')
        }
      } else {
        copyHandlers.copyExtraFolder(tgt)
      }
    }
    setExtraFolders(list => list.map(fl =>
      fl.id === f.id
        ? { ...fl, context: { ...fl.context, open: false } }
        : fl
    ))
  }}>Copy</li>
        </ul>
      ))}
      <BinContextMenu x={recycle.context.x} y={recycle.context.y} open={recycle.context.open} hasItems={recycle.items.length>0} onOpen={()=>{ recycle.closeContext(); handleBinDoubleClick() }} onEmpty={()=>{ recycle.closeContext(); handleEmptyRequest() }} onRestoreAll={()=>{ recycle.closeContext(); handleRestoreAll() }} onRename={()=>{ recycle.startRename && recycle.startRename() }} onCopy={()=>{ copyHandlers.copyBin(); recycle.closeContext() }} />
      <MyComputerContextMenu x={compContext?.x} y={compContext?.y} open={compContext?.open} onOpen={()=>{ setCompModalOpen(true); closeCompContext(); bring('comp') }} onDelete={()=>{ deleteComputer(); closeCompContext() }} onRename={()=>{ compStartRename() }} onCopy={()=>{ copyHandlers.copyComputer(); closeCompContext() }} />
      <RecycleBin binRef={recycle.binRef} style={binStyle} full={binFullState} onMouseDown={(e)=>{ bring('bin'); recycle.handleMouseDown(e) }} onDoubleClick={handleBinDoubleClick} onClick={handleBinClick} onContextMenu={recycle.handleContextMenu} onTouchStart={recycle.handleTouchStart} onTouchMove={recycle.cancelLongPress} onTouchEnd={recycle.cancelLongPress} name={recycle.name} renaming={recycle.renaming} onRenameCommit={recycle.commitRename} onRenameCancel={recycle.cancelRename} />
      {/* Recycle Bin modal with minimize support */}
      {binModalOpen && !minimizedModals.some(m => m.id === 'bin') && (
        <ModalWindow
          title={recycle.name}
          onClose={handleBinModalClose}
          zIndex={binZ}
          onActivate={() => bring('bin')}
          onMinimize={() => {
            minimizeModal('bin', recycle.name, binIcon)
            recycle.setBinModalOpen(false)
          }}
        >
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
      {compModalOpen && computerInfo && !minimizedModals.some(m => m.id === 'comp') && (
        <ModalWindow
          title={compName}
          onClose={() => setCompModalOpen(false)}
          zIndex={compZ}
          onActivate={() => bring('comp')}
          onMinimize={() => { setCompModalOpen(false); minimizeModal('comp', compName, computerIcon) }}
        >
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
      <EmailAssistant
        open={email.modalOpen && !minimizedModals.some(m => m.id === 'email')}
        onClose={() => email.setModalOpen(false)}
        zIndex={emailZ}
        onActivate={() => bring('email')}
        appName={email.name}
        onMinimize={() => { email.setModalOpen(false); minimizeModal('email', email.name, emailIcon) }}
      />
      {folder.modalOpen && !minimizedModals.some(m => m.id === 'folder') && (
        <ModalWindow
          title={folder.name}
          onClose={() => folder.setModalOpen(false)}
          zIndex={folderZ}
          onActivate={() => bring('folder')}
          onMinimize={() => { folder.setModalOpen(false); minimizeModal('folder', folder.name, folderIcon) }}
        >
  {folder.items.length === 0 ? (
  <div className="modal-empty-message">The folder is empty.</div>
) : (
  <div
    className="modal-bin-items"
    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
  >
    {folder.items.map((item) => (
      <div
        key={item.id}
        className="modal-bin-item"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
      >
        <img
          src={item.icon}
          alt={item.name}
          className="modal-bin-icon"
          draggable={false}
        />
        <span
          className="modal-bin-label"
          style={{ textAlign: "center" }}
        >
          {item.name}
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <button
            className="modal-bin-restore-btn"
            onClick={() => handleFolderItemOpen(item.id)}
          >
            Open
          </button>
          <button
            className="modal-bin-restore-btn"
            onClick={() => handleFolderItemDelete(item.id)}
          >
            Delete
          </button>
          <button
            className="modal-bin-restore-btn"
            onClick={() => handleFolderItemToDesktop(item.id)}
          >
            To Desktop
          </button>
        </div>
      </div>
    ))}
  </div>
)}

        </ModalWindow>
      )}
      {extraFolders.filter(f => f.modalOpen && !minimizedModals.some(m => m.id === f.id)).map(f => (
        <ModalWindow
          key={f.id}
          title={f.name}
          onClose={() => setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, modalOpen: false } : fl))}
          zIndex={f.z || folderZ}
          onActivate={() => bringExtraFolder(f.id)}
          onMinimize={() => {
            setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, modalOpen: false } : fl))
            minimizeModal(f.id, f.name, extraFolderIcon)
          }}
        >
          {(!f.items || f.items.length === 0) ? (
            <div className="modal-empty-message">The folder is empty.</div>
          ) : (
            <div className="modal-bin-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {f.items.map(item => (
                <div key={item.id} className="modal-bin-item" style={{ alignItems: 'center', gap: 4 }}>
                  <img src={item.icon || extraFolderIcon} alt={item.name} className="modal-bin-icon" draggable={false} />
                  <span className="modal-bin-label" style={{ textAlign: 'center' }}>{item.name}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    <button
                      className="modal-bin-restore-btn"
                      onClick={() => handleFolderItemOpen(item.id)}
                    >Open</button>
                    <button
                      className="modal-bin-restore-btn"
                      onClick={() => handleFolderItemDelete(item.id)}
                    >Delete</button>
                    <button
                      className="modal-bin-restore-btn"
                      onClick={() => handleFolderItemToDesktop(item.id)}
                    >To Desktop</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalWindow>
      ))}
      {/* Cloned items modals with minimize support */}
      {cloned.clones.filter(c => c.modalOpen && !minimizedModals.some(m => m.id === c.id)).map(c => (
        <ModalWindow
          key={c.id}
          title={c.name}
          onClose={() => cloned.closeClone(c.id)}
          zIndex={c.z || 56}
          onActivate={() => bring(c.id)}
          onMinimize={() => {
            cloned.closeClone(c.id)
            minimizeModal(c.id, c.name, c.icon)
          }}
        >
          {/* ...cloned modal content... */}
        </ModalWindow>
      ))}
      {menuOpen && <StartMenu menuRef={menuRef} onShutdown={onShutdown} onPrograms={handlePrograms} onGames={handleGames} />}
      <span style={{ display:'none' }}>{refreshTick}</span>
      <DesktopContextMenu x={deskMenu.x} y={deskMenu.y} open={deskMenu.open} onNewFolder={handleNewFolder} onRefresh={handleRefresh} onCleanUp={handleCleanUp} onPaste={handlePaste} canPaste={!!copiedItem} />
      {internet.visible && (
        <>
          <InternetIcon
            iconRef={internet.ref}
            style={internet.style}
            onMouseDown={internet.handleMouseDown}
            onContextMenu={internet.handleContextMenu}
            name={internet.name}
            renaming={internet.renaming}
            onRenameCommit={internet.commitRename}
            onRenameCancel={internet.cancelRename}
          />
          <InternetContextMenu
            x={internet.context.x}
            y={internet.context.y}
            open={internet.context.open}
            onOpen={() =>{ internet.closeContext()}}
            onDelete={internet.deleteSelf}
            onRename={internet.startRename}
            onCopy={() => { copyHandlers.copyInternet(); internet.closeContext(); }}
          />
        </>
      )}
      {minesweeper.visible && (
        <>
          <MinesweeperIcon
            iconRef={minesweeper.ref}
            style={minesweeper.style}
            onMouseDown={minesweeper.handleMouseDown}
            onContextMenu={minesweeper.handleContextMenu}
            name={minesweeper.name}
            renaming={minesweeper.renaming}
            onRenameCommit={minesweeper.commitRename}
            onRenameCancel={minesweeper.cancelRename}
            onClick={minesweeper.handleClick}
            onDoubleClick={minesweeper.handleDoubleClick}
          />
          <MinesweeperContextMenu
            x={minesweeper.context.x}
            y={minesweeper.context.y}
            open={minesweeper.context.open}
            onOpen={() => { minesweeper.setModalOpen(true); minesweeper.closeContext() }}
            onDelete={minesweeper.deleteSelf}
            onRename={minesweeper.startRename}
            onCopy={() => { copyHandlers.copyMinesweeper(); minesweeper.closeContext(); }}
          />
        </>
      )}
      {blog.visible && (
        <>
          <BlogIcon
            iconRef={blog.ref}
            style={blog.style}
            onMouseDown={blog.handleMouseDown}
            onContextMenu={blog.handleContextMenu}
            name={blog.name}
            renaming={blog.renaming}
            onRenameCommit={blog.commitRename}
            onRenameCancel={blog.cancelRename}
            onClick={blog.handleClick}
            onDoubleClick={blog.handleDoubleClick}
          />
          <BlogContextMenu
            x={blog.context.x}
            y={blog.context.y}
            open={blog.context.open}
            onOpen={() =>{ blog.setModalOpen(true); blog.closeContext(); bring('blog') }}
            onDelete={blog.deleteSelf}
            onRename={blog.startRename}
            onCopy={()=>{ copyHandlers.copyBlog(); blog.closeContext(); }}
          />
        </>
      )}
      {story.visible && (
        <>
          <StoryIcon
            iconRef={story.ref}
            style={story.style}
            onMouseDown={story.handleMouseDown}
            onContextMenu={story.handleContextMenu}
            name={story.name}
            renaming={story.renaming}
            onRenameCommit={story.commitRename}
            onRenameCancel={story.cancelRename}
            onClick={story.handleClick}
            onDoubleClick={story.handleDoubleClick}
          />
          <StoryContextMenu
            x={story.context.x}
            y={story.context.y}
            open={story.context.open}
            onOpen={() =>{ story.setModalOpen(true); story.closeContext(); bring('story') }}
            onDelete={story.deleteSelf}
            onRename={story.startRename}
            onCopy={()=>{ copyHandlers.copyStory(); story.closeContext(); }}
          />
        </>
      )}
      {social.visible && (
        <>
          <SocialIcon
            iconRef={social.ref}
            style={social.style}
            onMouseDown={social.handleMouseDown}
            onContextMenu={social.handleContextMenu}
            name={social.name}
            renaming={social.renaming}
            onRenameCommit={social.commitRename}
            onRenameCancel={social.cancelRename}
            onClick={social.handleClick}
            onDoubleClick={social.handleDoubleClick}
          />
          <SocialContextMenu
            x={social.context.x}
            y={social.context.y}
            open={social.context.open}
            onOpen={() =>{ social.setModalOpen(true); social.closeContext(); bring('social') }}
            onDelete={social.deleteSelf}
            onRename={social.startRename}
            onCopy={()=>{ copyHandlers.copySocial(); social.closeContext(); }}
          />
        </>
      )}
      <MinesweeperGameModal
        open={minesweeper.modalOpen && !minimizedModals.some(m => m.id === 'minesweeper')}
        onClose={() => minesweeper.setModalOpen(false)}
        zIndex={minesweeperZ}
        onActivate={() => bring('minesweeper')}
        onMinimize={() => { minesweeper.setModalOpen(false); minimizeModal('minesweeper', minesweeper.name, minesweeperIcon) }}
      />
      <BlogModal open={blog.modalOpen && !minimizedModals.some(m => m.id === 'blog')} onClose={() => blog.setModalOpen(false)} zIndex={blogZ} onActivate={() => bring('blog')} onMinimize={() => { blog.setModalOpen(false); minimizeModal('blog', blog.name, blogIcon) }} />
      <StoryModal open={story.modalOpen && !minimizedModals.some(m => m.id === 'story')} onClose={() => story.setModalOpen(false)} zIndex={storyZ} onActivate={() => bring('story')} onMinimize={() => { story.setModalOpen(false); minimizeModal('story', story.name, storyIcon) }} />
      <SocialModal open={social.modalOpen && !minimizedModals.some(m => m.id === 'social')} onClose={() => social.setModalOpen(false)} zIndex={socialZ} onActivate={() => bring('social')} onMinimize={() => { social.setModalOpen(false); minimizeModal('social', social.name, socialIcon) }} />

      {/* Start Menu Modals */}
      {programsModal && (
        <ModalWindow
          title="Programs"
          onClose={() => setProgramsModal(false)}
          zIndex={200}
        >
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }} onClick={() => { setProgramsModal(false); email.setModalOpen(true) }}>
                <img src={emailIcon} alt="Email" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <span>Email Assistant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }} onClick={() => { setProgramsModal(false); blog.setModalOpen(true) }}>
                <img src={blogIcon} alt="Blog" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <span>Blog Assistant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }} onClick={() => { setProgramsModal(false); story.setModalOpen(true) }}>
                <img src={storyIcon} alt="Story" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <span>Story Assistant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }} onClick={() => { setProgramsModal(false); social.setModalOpen(true) }}>
                <img src={socialIcon} alt="Social" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <span>Social Media Assistant</span>
              </div>
            </div>
          </div>
        </ModalWindow>
      )}

      {gamesModal && (
        <ModalWindow
          title="Games"
          onClose={() => setGamesModal(false)}
          zIndex={200}
        >
          <div>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px' }} onClick={() => { setGamesModal(false); minesweeper.setModalOpen(true) }}>
                <img src={minesweeperIcon} alt="Minesweeper" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <span>Minesweeper</span>
              </div>
            </div>
          </div>
        </ModalWindow>
      )}

    </div>
  )
}
