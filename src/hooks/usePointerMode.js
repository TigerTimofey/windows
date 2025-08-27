import { useMemo } from 'react'

export function usePointerMode() {
  const isTouchOrCoarse = useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      return (
        'ontouchstart' in window ||
        (navigator && navigator.maxTouchPoints > 0) ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      )
    } catch {
      return false
    }
  }, [])
  return { isTouchOrCoarse }
}
