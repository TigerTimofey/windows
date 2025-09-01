import { useCallback, useEffect, useRef, useState } from 'react'
import minesweeperIcon from '../assets/win7/icons/minesweeper.png'
import { getClampedBinPosition, isIconDroppedOnTarget } from './useDesktop.js'
import { useTouchDrag } from './useTouchDrag.js'

export function useMinesweeperIcon(binRef, onDroppedIntoBin, folderRef, onDroppedIntoFolder, getExtraFolderTargets, onDroppedIntoExtraFolder) {
  const [pos, setPos] = useState({ x: 18, y: 390 })
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const ref = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const [context, setContext] = useState({ open: false, x: 0, y: 0 })
  const [name, setName] = useState('Minesweeper')
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
      if (binRef && isIconDroppedOnTarget(ref, binRef)) {
        setVisible(false)
        onDroppedIntoBin && onDroppedIntoBin({ id: 'minesweeper', name, icon: minesweeperIcon })
        return
      }
      if (folderRef && isIconDroppedOnTarget(ref, folderRef)) {
        setVisible(false)
        onDroppedIntoFolder && onDroppedIntoFolder({ id: 'minesweeper', name, icon: minesweeperIcon })
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
            onDroppedIntoExtraFolder && onDroppedIntoExtraFolder({ id: 'minesweeper', name, icon: minesweeperIcon }, t.id)
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
  }, [dragging, binRef, folderRef, onDroppedIntoBin, onDroppedIntoFolder, name, getExtraFolderTargets, onDroppedIntoExtraFolder, createTouchHandlers])

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

  const baseZ = 50
  const dragZ = 70
  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex: dragging ? dragZ : baseZ }
    : { left: 120, top: 300, position: 'fixed', zIndex: dragging ? dragZ : baseZ }

  const restore = useCallback(() => {
    setVisible(true)
    setPos({ x: 18, y: 390 })
    closeContext()
  }, [closeContext])

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
    deleteSelf: () => { if (!visible) return; setVisible(false); closeContext(); onDroppedIntoBin && onDroppedIntoBin({ id: 'minesweeper', name, icon: minesweeperIcon }) },
    restore,
    setPosition: (x, y) => setPos({ x, y }),
    name,
    renaming,
    startRename: () => { setRenaming(true); closeContext() },
    commitRename: (val) => { if (val) setName(val.slice(0,32)); setRenaming(false) },
    cancelRename: () => setRenaming(false),
    modalOpen,
    setModalOpen
  }
}
