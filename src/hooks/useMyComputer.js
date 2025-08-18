import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClampedBinPosition, isIconDroppedOnTarget } from '../utils/desktop.js'
import myComputerIcon from '../assets/win7/mycomputer.svg'

export function useMyComputer(binRef, onDroppedIntoBin) {
  const [pos, setPos] = useState({ x: null, y: null })
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const ref = useRef(null)

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
        setModalOpen(false)
        onDroppedIntoBin && onDroppedIntoBin({ id: 'mycomputer', name: 'My Computer', icon: myComputerIcon })
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
  }, [dragging, binRef, onDroppedIntoBin])

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

  const style = pos.x !== null && pos.y !== null
    ? { left: pos.x, top: pos.y, position: 'fixed', zIndex: 51 }
    : { left: 18, top: 18, position: 'fixed', zIndex: 51 }

  const systemInfo = useMemo(() => {
    if (!modalOpen) return null
    if (typeof window === 'undefined') return null
    const nav = navigator || {}
    return {
      platform: nav.platform,
      userAgent: nav.userAgent,
      cores: nav.hardwareConcurrency || 'N/A',
      memory: nav.deviceMemory ? nav.deviceMemory + ' GB' : 'N/A',
      online: nav.onLine ? 'Online' : 'Offline'
    }
  }, [modalOpen])

  const [extra, setExtra] = useState(null)
  useEffect(() => {
    if (!modalOpen) { setExtra(null); return }
    let cancelled = false
    ;(async () => {
      const ext = {}
      try {
        ext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        ext.localTime = new Date().toLocaleString()
        ext.colorDepth = window.screen.colorDepth
        if (navigator.storage && navigator.storage.estimate) {
          const { quota, usage } = await navigator.storage.estimate()
          if (!cancelled) {
            ext.storage = {
              quota: quota ? Math.round(quota / (1024*1024)) + ' MB' : 'N/A',
              usage: usage ? Math.round(usage / (1024*1024)) + ' MB' : 'N/A'
            }
          }
        }
        if (navigator.getBattery) {
          try {
            const batt = await navigator.getBattery()
            if (!cancelled) {
              ext.battery = {
                level: Math.round(batt.level * 100) + '%',
                charging: batt.charging ? 'Charging' : 'Not Charging'
              }
            }
          } catch { /* battery API not available */ }
        }
        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
        if (conn) {
          ext.connection = { downlink: conn.downlink + ' Mbps', rtt: conn.rtt + ' ms', type: conn.effectiveType }
        }
        if (performance && performance.memory) {
          const m = performance.memory
            ext.jsHeap = {
              used: Math.round(m.usedJSHeapSize / (1024*1024)) + ' MB',
              total: Math.round(m.totalJSHeapSize / (1024*1024)) + ' MB'
            }
        }
  } catch { /* extra info collection failed */ }
      if (!cancelled) setExtra(ext)
    })()
    return () => { cancelled = true }
  }, [modalOpen])

  return {
    ref,
    pos,
    dragging,
    visible,
    modalOpen,
    setModalOpen,
    handleMouseDown,
    handleClick,
    handleDoubleClick,
    style,
    systemInfo,
    extra,
  }
}
