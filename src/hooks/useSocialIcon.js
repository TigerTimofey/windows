import { useCallback, useEffect, useRef, useState } from 'react'
import socialIcon from '../assets/win7/icons/social.ico'
import { getClampedBinPosition, isIconDroppedOnTarget } from './useDesktop.js'
import { useTouchDrag } from './useTouchDrag.js'

export function useSocialIcon(binRef, addItemToBin, folderRef, onDroppedIntoFolder, getExtraFolderTargets, onDroppedIntoExtraFolder) {
  const [pos, setPos] = useState({ x: 110, y: 210 })
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const ref = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const [context, setContext] = useState({ open: false, x: 0, y: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('Social')
  const [renaming, setRenaming] = useState(false)
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

  const { handleTouchStart, createTouchHandlers } = useTouchDrag(ref, dragOffset, movedRef, setDragging)

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
        addItemToBin && addItemToBin({ id: 'social', name, icon: socialIcon })
        return
      }
      if (folderRef && isIconDroppedOnTarget(ref, folderRef)) {
        setVisible(false)
        onDroppedIntoFolder && onDroppedIntoFolder({ id: 'social', name, icon: socialIcon })
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
            onDroppedIntoExtraFolder && onDroppedIntoExtraFolder({ id: 'social', name, icon: socialIcon }, t.id)
            return
          }
        }
      }
    }
    const touchHandlers = createTouchHandlers(onMove, onUp)
    if (dragging) {
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      document.addEventListener('touchmove', touchHandlers.onTouchMove, { passive: false })
      document.addEventListener('touchend', touchHandlers.onTouchEnd, { passive: false })
    }
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', touchHandlers.onTouchMove, { passive: false })
      document.removeEventListener('touchend', touchHandlers.onTouchEnd, { passive: false })
    }
  }, [dragging, binRef, folderRef, addItemToBin, onDroppedIntoFolder, name, getExtraFolderTargets, onDroppedIntoExtraFolder, createTouchHandlers])

  const clampMenu = useCallback((x, y) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 140
    const menuHeight = 4 * 26
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

  const baseZ = 52
  const dragZ = 72
  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex: dragging ? dragZ : baseZ }
    : { left: 110, top: 210, position: 'fixed', zIndex: dragging ? dragZ : baseZ }

  return {
    ref,
    visible,
    style,
    handleMouseDown,
    handleTouchStart,
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    context,
    closeContext,
    deleteSelf: () => { if (!visible) return; setVisible(false); closeContext(); addItemToBin && addItemToBin({ id: 'social', name, icon: socialIcon }) },
    restore: () => {
      setVisible(true)
      setPos({ x: null, y: null })
      closeContext()
    },
    modalOpen,
    setModalOpen,
    setPosition: (x, y) => setPos({ x, y }),
    name,
    renaming,
    startRename: () => { setRenaming(true); closeContext() },
    commitRename: (val) => { if (val) setName(val.slice(0,32)); setRenaming(false) },
    cancelRename: () => setRenaming(false),
    copyDescriptor: () => ({ id: 'social', name, icon: socialIcon })
  }
}
