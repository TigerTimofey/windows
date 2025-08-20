import { useEffect, useRef, useState, useCallback } from 'react'
import { getClampedBinPosition } from '../hooks/useDesktop.js'

export function useRecycleBin() {
  const [binPos, setBinPos] = useState({ x: null, y: null })
  const [dragging, setDragging] = useState(false)
  const binRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [context, setContext] = useState({ open: false, x: 0, y: 0 })
  const [name, setName] = useState('Recycle Bin')
  const [renaming, setRenaming] = useState(false)
  const longPressTimer = useRef(null)
  const [items, setItems] = useState([])

  function handleMouseDown(e) {
    if (e.button !== 0) return
    setDragging(true)
    const rect = binRef.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging) return
      setBinPos(getClampedBinPosition(e, dragOffset, binRef, 10))
    }
    function onMouseUp() { setDragging(false) }
    if (dragging) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  function clampMenu(x, y) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 180
    const menuHeight = 68
    return {
      x: Math.min(x, vw - menuWidth - 4),
      y: Math.min(y, vh - menuHeight - 4)
    }
  }

  const openContextAt = useCallback((x, y) => {
    setContext({ open: true, ...clampMenu(x, y) })
  }, [])
  function closeContext() { setContext(c => ({ ...c, open: false })) }

  function handleContextMenu(e) {
    e.preventDefault()
    if (dragging) return
    openContextAt(e.clientX, e.clientY)
  }

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    longPressTimer.current = setTimeout(() => openContextAt(t.clientX, t.clientY), 600)
  }
  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    if (!context.open) return
    function onDoc(e) {
      if (!(e.target.closest && e.target.closest('.context-menu'))) {
        closeContext()
      }
    }
    function onKey(e) { if (e.key === 'Escape') closeContext() }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', closeContext)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', closeContext)
    }
  }, [context.open, openContextAt])

  useEffect(() => {
    function globalCtx(e) {
      if (!binRef.current) return
      if (e.target === binRef.current || binRef.current.contains(e.target)) {
        if (!context.open) {
          e.preventDefault()
          openContextAt(e.clientX, e.clientY)
        }
      }
    }
    document.addEventListener('contextmenu', globalCtx)
    return () => document.removeEventListener('contextmenu', globalCtx)
  }, [context.open, openContextAt])

  return {
    binRef,
    binPos,
    setBinPos,
    dragging,
    items,
    setItems,
    context,
    openContextAt,
    closeContext,
    handleMouseDown,
    handleContextMenu,
    handleTouchStart,
    cancelLongPress,
  name,
  startRename: () => { setRenaming(true); closeContext() },
  commitRename: (newName) => { if (newName) setName(newName.slice(0,32)); setRenaming(false) },
  cancelRename: () => setRenaming(false),
  renaming,
  copyDescriptor: () => ({ id: 'recycle-bin', name })
  }
}
