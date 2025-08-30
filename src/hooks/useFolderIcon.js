import { useCallback, useEffect, useRef, useState } from 'react'
import folderIcon from '../assets/win7/icons/folder.ico'
import { getClampedBinPosition, isIconDroppedOnTarget } from './useDesktop.js'

export function useFolderIcon(binRef, onDroppedIntoBin, getExtraFolderTargets, onDroppedIntoExtraFolder) {
  const [pos, setPos] = useState({ x: null, y: null })
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const [items, setItems] = useState([]) 
  const ref = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const [context, setContext] = useState({ open: false, x: 0, y: 0 })
  const [name, setName] = useState('ghost-writer')
  const [renaming, setRenaming] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const isTouchOrCoarse = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    setDragging(true)
    movedRef.current = false
    const rect = ref.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  useEffect(() => {
    function onMove(e) {
      if (!dragging) return
      movedRef.current = true
      setPos(getClampedBinPosition(e, dragOffset, ref, 10))
    }
    function onUp() {
      if (!dragging) return
      setDragging(false)
      if (isIconDroppedOnTarget(ref, binRef)) {
        setVisible(false)
  onDroppedIntoBin && onDroppedIntoBin({ id: 'ghost-folder', name, icon: folderIcon })
        return
      }
      if (getExtraFolderTargets) {
        const targets = getExtraFolderTargets()
        const selfRect = ref.current.getBoundingClientRect()
        for (const t of targets) {
          if (!t.el) continue
          const r = t.el.getBoundingClientRect()
          if (!(selfRect.right < r.left || selfRect.left > r.right || selfRect.bottom < r.top || selfRect.top > r.bottom)) {
            setVisible(false)
            onDroppedIntoExtraFolder && onDroppedIntoExtraFolder({ id: 'ghost-folder', name, icon: folderIcon }, t.id)
            return
          }
        }
      }
    }
    if (dragging) {
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging, binRef, onDroppedIntoBin, name, getExtraFolderTargets, onDroppedIntoExtraFolder])

  const clampMenu = useCallback((x, y) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 140
    const baseItems = 2 
    const extraItems = 2 
    const menuHeight = (baseItems + extraItems) * 26
    return { x: Math.min(x, vw - menuWidth - 4), y: Math.min(y, vh - menuHeight - 4) }
  }, [])

  const openContextAt = useCallback((x, y) => { setContext({ open: true, ...clampMenu(x, y) }) }, [clampMenu])
  const closeContext = useCallback(() => { setContext(c => ({ ...c, open: false })) }, [])
  const handleContextMenu = useCallback((e) => { e.preventDefault(); if (!visible) return; openContextAt(e.clientX, e.clientY) }, [openContextAt, visible])

  const handleClick = useCallback(() => {
    if (!isTouchOrCoarse) return
    if (!visible) return
    if (!movedRef.current) setModalOpen(true)
  }, [isTouchOrCoarse, visible])

  const handleDoubleClick = useCallback(() => {
    if (isTouchOrCoarse) return
    if (!visible) return
    if (!movedRef.current) setModalOpen(true)
  }, [isTouchOrCoarse, visible])

  useEffect(() => {
    if (!context.open) return
    function onDoc(e) { if (!(e.target.closest && e.target.closest('.context-menu'))) closeContext() }
    function onKey(e) { if (e.key === 'Escape') closeContext() }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', closeContext)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', closeContext)
    }
  }, [context.open, closeContext])

  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex: 55 }
    : { left: 18, top: 210, position: 'fixed', zIndex: 55 }

  return {
    ref,
    visible,
    style,
    handleMouseDown,
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    context,
    closeContext,
  deleteSelf: () => { if (!visible) return; setVisible(false); closeContext(); onDroppedIntoBin && onDroppedIntoBin({ id: 'ghost-folder', name, icon: folderIcon }) },
    restore: () => { setVisible(true); setPos({ x: null, y: null }); closeContext() },
    modalOpen,
  setModalOpen,
  items,
  addItem: (item) => setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, { ...item }]),
  removeItem: (id) => setItems(prev => prev.filter(i => i.id !== id)),
  hasItem: (id) => items.some(i => i.id === id),
  name,
  startRename: () => { setRenaming(true); closeContext() },
  commitRename: (newName) => { if (newName) setName(newName.slice(0,32)); setRenaming(false) },
  cancelRename: () => setRenaming(false),
  renaming,
  copyDescriptor: () => ({ id: 'ghost-folder', name, icon: folderIcon })
  }
}
