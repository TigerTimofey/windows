import { useRef, useCallback, useEffect } from 'react'
import clickSound from '../assets/win7/sounds/click.mp3'
import trashSound from '../assets/win7/sounds/trash.mp3'
import errorSound from '../assets/win7/sounds/error.mp3'

export function useSounds() {
  const clickRef = useRef(null)
  const playClick = useCallback(() => {
    try {
      if (!clickRef.current) clickRef.current = new Audio(clickSound)
      const a = clickRef.current
      a.volume = 0.35
      a.currentTime = 0
      a.play().catch(()=>{})
  } catch { /* ignore click sound errors */ }
  }, [])

  const playTrash = useCallback(() => {
    try {
      const a = new Audio(trashSound)
      a.currentTime = 0
      a.play().catch(()=>{})
  } catch { /* ignore trash sound errors */ }
  }, [])

  const playError = useCallback(() => {
    try {
      const a = new Audio(errorSound)
      a.currentTime = 0
      a.play().catch(()=>{})
  } catch { /* ignore error sound errors */ }
  }, [])

  useEffect(() => {
    function global(e){ if (e.button === 0 || e.button === 2) playClick() }
    document.addEventListener('mousedown', global)
    return () => document.removeEventListener('mousedown', global)
  }, [playClick])

  return { playClick, playTrash, playError }
}
