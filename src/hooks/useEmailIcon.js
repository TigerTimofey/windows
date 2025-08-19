import { useCallback, useEffect, useRef, useState } from 'react'
import emailIcon from '../assets/win7/icons/email.ico'
import { getClampedBinPosition, isIconDroppedOnTarget } from '../hooks/useDesktop.js'

export function useEmailIcon(binRef, folderRef, onDroppedIntoBin, onDroppedIntoFolder) {
  const [pos, setPos] = useState({ x: null, y: null })
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const ref = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const [context, setContext] = useState({ open: false, x: 0, y: 0 })
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
        onDroppedIntoBin && onDroppedIntoBin({ id: 'email', name: 'Email', icon: emailIcon })
        return
      }
      if (folderRef && isIconDroppedOnTarget(ref, folderRef)) {
        setVisible(false)
        onDroppedIntoFolder && onDroppedIntoFolder({ id: 'email', name: 'Email', icon: emailIcon })
        return
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
  }, [dragging, binRef, folderRef, onDroppedIntoBin, onDroppedIntoFolder])

  const clampMenu = useCallback((x, y) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 140
    const menuHeight = 52
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

  // Email icon: base zIndex 50; elevate while dragging above folder (55)
  const baseZ = 50
  const dragZ = 70
  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex: dragging ? dragZ : baseZ }
    : { left: 18, top: 120, position: 'fixed', zIndex: dragging ? dragZ : baseZ }

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
    deleteSelf: () => { if (!visible) return; setVisible(false); closeContext(); onDroppedIntoBin && onDroppedIntoBin({ id: 'email', name: 'Email', icon: emailIcon }) },
  restore: () => { setVisible(true); setPos({ x: null, y: null }); closeContext() },
  modalOpen,
  setModalOpen,
  setPosition: (x, y) => setPos({ x, y })
  }
}
