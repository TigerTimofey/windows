import { useRef, useState, useEffect } from 'react'

// Manages duplicated (cloned) desktop icons for system items (email, mycomputer, ghost-folder)
// Each clone: { id, type, name, icon, pos:{x,y}, renaming, context:{open,x,y} }
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
    const baseY = 120
    const offset = clonesRef.current.length * 90
    const pos = { x: 120, y: baseY + offset }
    const z = ++zCounterRef.current
    const finalName = computeCloneName(name, baseNames)
    setClones(list => [...list, { id, type, name: finalName, icon, pos, renaming: false, context: { open: false, x:0, y:0 }, z }])
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
      setClones(list => list.map(c => c.id === id ? { ...c, pos: { x: Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - 64)), y: Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - 90)) } } : c))
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
          // delete clone to bin
            setClones(list => list.filter(c => c.id !== id))
            const clone = clonesRef.current.find(c => c.id === id)
            if (clone) addItemToBin({ id: clone.id, name: clone.name, icon: clone.icon })
            draggingIdRef.current = null
            return
        }
      }
      // Drop onto base folder
      if (el && baseFolder?.visible && baseFolder.ref?.current) {
        const rect = el.getBoundingClientRect()
        const baseRect = baseFolder.ref.current.getBoundingClientRect()
        if (intersects(rect, baseRect)) {
          const clone = clonesRef.current.find(c => c.id === id)
          if (clone) {
            // Remove clone from desktop and add as item (retain type so it can be opened)
            setClones(list => list.filter(c => c.id !== id))
            baseFolder.addItem({ id, name: clone.name, icon: clone.icon, type: clone.type })
          }
          draggingIdRef.current = null
          return
        }
      }
      // Drop onto extra folder targets
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

  return { clones, addClone, handleMouseDown, openClone, contextMenu, closeAllContexts, rename, startRename, deleteClone, copyDescriptor, cloneRefs }
}
