import { useCallback, useRef } from 'react'

export function useTouchDrag(ref, dragOffset, movedRef, setDragging) {
  const setDraggingRef = useRef(setDragging)

  // Update the ref whenever setDragging changes
  setDraggingRef.current = setDragging

  const handleTouchStart = useCallback((e) => {
    // e.preventDefault()
    setDraggingRef.current(true)
    movedRef.current = false
    const rect = ref.current.getBoundingClientRect()
    const touch = e.touches[0]
    dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }, [movedRef, dragOffset, ref])

  const createTouchHandlers = useCallback((onMove, onUp) => {
    const onTouchMove = (e) => {
      if (!setDraggingRef.current) return
      movedRef.current = true
      const touch = e.touches[0]
      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY }
      onMove(fakeEvent)
    }
    const onTouchEnd = () => {
      if (!setDraggingRef.current) return
      setDraggingRef.current(false)
      if (onUp) onUp()
    }

    return {
      onTouchMove,
      onTouchEnd
    }
  }, [movedRef])

  return { handleTouchStart, createTouchHandlers }
}
