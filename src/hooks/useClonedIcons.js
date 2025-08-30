import { useRef, useState, useEffect } from 'react'

export function useClonedIcons({ zCounterRef, recycleBinRef, addItemToBin, openHandlers, baseFolder, getExtraFolderTargets, addItemToExtraFolder }) {
  const [clones, setClones] = useState([])
  const cloneRefs = useRef({})
  const draggingIdRef = useRef(null)
  const dragOffsetRef = useRef({ x:0, y:0 })
  const clonesRef = useRef([])
  useEffect(()=>{ clonesRef.current = clones }, [clones])

  function bringClone(id) {
    setClones(list => list.map(c => c.id === id ? { ...c, z: ++zCounterRef.current } : c))
  }

  function computeCloneName(originalName, baseNames=[]) {
    const existing = new Set([...baseNames, ...clonesRef.current.map(c => c.name)])
    let root = originalName
    const m = root.match(/^(.*) copy\((\d+)\)$/)
    if (m) root = m[1]
    let i = 1
    let candidate = `${root} copy(${i})`
    while (existing.has(candidate)) { i += 1; candidate = `${root} copy(${i})` }
    return candidate
  }

  function addClone({ type, name, icon, baseNames }) {
    const id = `clone-${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
    const taskbar = document.querySelector('.windows-taskbar')
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 40
    const maxY = window.innerHeight - taskbarHeight - 100 - 10
    const maxX = window.innerWidth - 64
    const iconsPerRow = 5
    const iconSpacingX = 100
    const iconSpacingY = 90
    const baseX = 120
    const baseY = 120
    const cloneCount = clonesRef.current.length
    let posX = baseX + (cloneCount % iconsPerRow) * iconSpacingX
    let posY = baseY + Math.floor(cloneCount / iconsPerRow) * iconSpacingY
    if (posY > maxY) posY = maxY
    if (posX > maxX) posX = maxX
    console.log(`Pasting item at x: ${posX}, y: ${posY}, windowHeight: ${window.innerHeight}, taskbarHeight: ${taskbarHeight}, maxY: ${maxY}, maxX: ${maxX}`)
    const z = ++zCounterRef.current
    const finalName = computeCloneName(name, baseNames)
    setClones(list => [...list, { id, type, name: finalName, icon, pos: { x: posX, y: posY }, renaming: false, context: { open: false, x:0, y:0 }, z }])
  }

  function handleMouseDown(id, e) {
    if (e.button !== 0) return
    bringClone(id)
    const rect = e.currentTarget.getBoundingClientRect()
    draggingIdRef.current = id
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  useEffect(()=>{
    function onMove(e){
      const id = draggingIdRef.current
      if(!id) return
      const taskbar = document.querySelector('.windows-taskbar')
      const taskbarHeight = taskbar ? taskbar.offsetHeight : 40
      const maxY = window.innerHeight - taskbarHeight - 150 - 10
      setClones(list => list.map(c => c.id === id ? { ...c, pos: { x: Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - 64)), y: Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, maxY)) } } : c))
    }
    function intersects(a,b){ return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) }
    function onUp(){
      const id = draggingIdRef.current
      if(!id) return
      const el = cloneRefs.current[id]
      if (el && recycleBinRef.current) {
        const rect = el.getBoundingClientRect()
        const binRect = recycleBinRef.current.getBoundingClientRect()
        if (intersects(rect, binRect)) {
            setClones(list => list.filter(c => c.id !== id))
            const clone = clonesRef.current.find(c => c.id === id)
            if (clone) addItemToBin({ id: clone.id, name: clone.name, icon: clone.icon })
            draggingIdRef.current = null
            return
        }
      }
      if (el && baseFolder?.visible && baseFolder.ref?.current) {
        const rect = el.getBoundingClientRect()
        const baseRect = baseFolder.ref.current.getBoundingClientRect()
        if (intersects(rect, baseRect)) {
          const clone = clonesRef.current.find(c => c.id === id)
          if (clone) {
            setClones(list => list.filter(c => c.id !== id))
            baseFolder.addItem({ id, name: clone.name, icon: clone.icon, type: clone.type })
          }
          draggingIdRef.current = null
          return
        }
      }
      if (el && getExtraFolderTargets) {
        const rect = el.getBoundingClientRect()
        const targets = getExtraFolderTargets()
        for (const t of targets) {
          const tel = t.el
            if (!tel) continue
          const tr = tel.getBoundingClientRect()
          if (intersects(rect, tr)) {
            const clone = clonesRef.current.find(c => c.id === id)
            if (clone) {
              setClones(list => list.filter(c => c.id !== id))
              addItemToExtraFolder && addItemToExtraFolder(t.id, { id, name: clone.name, icon: clone.icon, type: clone.type })
            }
            draggingIdRef.current = null
            return
          }
        }
      }
      draggingIdRef.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [addItemToBin, recycleBinRef, baseFolder, getExtraFolderTargets, addItemToExtraFolder])

  function openClone(clone){
    const handler = openHandlers[clone.type]
    if (handler) handler()
  }

  function contextMenu(id, e){
    e.preventDefault()
    setClones(list => list.map(c => c.id === id ? { ...c, context: { open: true, x: e.clientX, y: e.clientY } } : { ...c, context: { ...c.context, open: false } }))
  }
  function closeAllContexts(){ setClones(list => list.map(c => ({ ...c, context: { ...c.context, open: false } }))) }

  function rename(id, newName){ setClones(list => list.map(c => c.id === id ? { ...c, name: newName.slice(0,32), renaming: false } : c)) }
  function startRename(id){ setClones(list => list.map(c => c.id === id ? { ...c, renaming: true } : c)) }
  function deleteClone(id){
    setClones(list => list.filter(c => c.id !== id))
    const clone = clonesRef.current.find(c => c.id === id)
    if (clone) addItemToBin({ id: clone.id, name: clone.name, icon: clone.icon })
  }
  function copyDescriptor(id){
    const clone = clonesRef.current.find(c => c.id === id)
    if (!clone) return null
    return { id: clone.id, name: clone.name, icon: clone.icon, type: clone.type }
  }

  function restoreClone(cloneDescriptor) {
    setClones(prev => {
      if (prev.some(c => c.id === cloneDescriptor.id)) return prev
      return [
        ...prev,
        {
          ...cloneDescriptor,
          pos: { x: 100, y: 100 }, 
          z: 56,
          modalOpen: false,
          renaming: false,
          context: { open: false, x: 0, y: 0 }
        }
      ]
    })
  }

  return {
    clones, addClone, handleMouseDown, openClone, contextMenu, closeAllContexts, rename, startRename, deleteClone, copyDescriptor, cloneRefs, restoreClone
  }
}
