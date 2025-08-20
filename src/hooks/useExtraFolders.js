import { useCallback, useEffect, useRef, useState } from 'react'

// Manages dynamic extra desktop folders: creation, drag & drop, nesting, recycle bin interaction.
// Accepts a baseFolderRef (ref object whose current will be set to the base folder hook object) to avoid hook ordering circular deps.
export function useExtraFolders({ baseFolderRef, recycleBinRef, addItemToBin, extraFolderIcon, zCounterRef }) {
  const [extraFolders, setExtraFolders] = useState([])
  const nextFolderNumRef = useRef(1)
  const draggingIdRef = useRef(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const folderRefs = useRef({}) // id -> DOM element
  const extraFoldersRef = useRef([])
  useEffect(() => { extraFoldersRef.current = extraFolders }, [extraFolders])

  const getExtraFolderTargets = useCallback(() => Object.entries(folderRefs.current).map(([id, el]) => ({ id, el })), [])

  function createNewFolder() {
    let n = nextFolderNumRef.current
    let proposed = `New Folder ${n}`
    const baseFolderName = baseFolderRef.current?.name || 'Folder'
    const existingNames = new Set([baseFolderName, ...extraFoldersRef.current.map(f => f.name)])
    while (existingNames.has(proposed)) { n += 1; proposed = `New Folder ${n}` }
    nextFolderNumRef.current = n + 1
    const id = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const baseY = 300
    const offset = extraFoldersRef.current.filter(f => f.visible).length * 90
    const z = ++zCounterRef.current
    setExtraFolders(list => [...list, { id, name: proposed, renaming: true, visible: true, pos: { x: 18, y: baseY + offset }, context: { open: false, x: 0, y: 0 }, modalOpen: false, items: [], z }])
  }

  const registerRef = useCallback((id, el) => { if (el) folderRefs.current[id] = el }, [])

  function handleMouseDown(id, e) {
    if (e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    draggingIdRef.current = id
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  // Raise z-index so dragged folder appears above others
  setExtraFolders(list => list.map(f => f.id === id ? { ...f, z: ++zCounterRef.current } : f))
  }

  // Drag & drop effect (only sets state, uses refs to avoid deps)
  useEffect(() => {
    function onMove(e) {
      const id = draggingIdRef.current
      if (!id) return
      setExtraFolders(list => list.map(f => {
        if (f.id !== id) return f
        const nx = e.clientX - dragOffsetRef.current.x
        const ny = e.clientY - dragOffsetRef.current.y
        return { ...f, pos: { x: Math.max(0, Math.min(nx, window.innerWidth - 64)), y: Math.max(0, Math.min(ny, window.innerHeight - 90)) } }
      }))
    }
    function intersects(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) }
    function onUp() {
      const id = draggingIdRef.current
      if (!id) return
      const draggedEl = folderRefs.current[id]
      if (draggedEl) {
        const rect = draggedEl.getBoundingClientRect()
        // Drop on base folder
        const baseFolder = baseFolderRef.current
        if (baseFolder?.visible && baseFolder.ref.current) {
          const baseRect = baseFolder.ref.current.getBoundingClientRect()
          if (intersects(rect, baseRect)) {
            const draggedName = extraFoldersRef.current.find(f => f.id === id)?.name || 'Folder'
            setExtraFolders(list => list.map(f => f.id === id ? { ...f, visible: false } : f))
            baseFolder.addItem({ id, name: draggedName, icon: extraFolderIcon, type: 'extra-folder' })
            draggingIdRef.current = null
            return
          }
        }
        // Drop on another extra folder
        for (const [tid, tel] of Object.entries(folderRefs.current)) {
          if (tid === id) continue
          if (!tel) continue
          const targetRect = tel.getBoundingClientRect()
          if (intersects(rect, targetRect)) {
            const draggedName = extraFoldersRef.current.find(f => f.id === id)?.name || 'Folder'
            setExtraFolders(list => list.map(f => {
              if (f.id === id) return { ...f, visible: false }
              if (f.id === tid) return { ...f, items: [...(f.items || []), { id, name: draggedName, icon: extraFolderIcon, type: 'extra-folder' }] }
              return f
            }))
            draggingIdRef.current = null
            return
          }
        }
        // Drop on recycle bin
        if (recycleBinRef.current) {
          const binRect = recycleBinRef.current.getBoundingClientRect()
          if (intersects(rect, binRect)) {
            const draggedName = extraFoldersRef.current.find(f => f.id === id)?.name || 'Folder'
            setExtraFolders(list => list.map(f => f.id === id ? { ...f, visible: false, modalOpen: false } : f))
            addItemToBin({ id, name: draggedName, icon: extraFolderIcon })
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
  }, [addItemToBin, baseFolderRef, extraFolderIcon, recycleBinRef])

  function openContext(id, e) {
    e.preventDefault()
    const x = e.clientX
    const y = e.clientY
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, context: { open: true, x, y } } : { ...f, context: { ...f.context, open: false } }))
  }

  const closeAllContexts = useCallback(() => setExtraFolders(list => list.map(f => ({ ...f, context: { ...f.context, open: false } }))), [])

  function revealOrCloneFromDescriptor(descriptor) {
    if (!descriptor || !descriptor.id.startsWith('new-folder-')) return
    setExtraFolders(list => {
      const existing = list.find(f => f.id === descriptor.id)
      if (existing) {
        return list.map(f => f.id === descriptor.id ? { ...f, visible: true, name: descriptor.name || f.name } : f)
      }
      const id = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  const z = ++zCounterRef.current
  const items = descriptor.items ? descriptor.items.map(it => ({ ...it })) : []
  return [...list, { id, name: descriptor.name || 'New Folder', renaming: false, visible: true, pos: { x: 18, y: 300 + list.filter(fl => fl.visible).length * 90 }, context: { open: false, x: 0, y: 0 }, modalOpen: false, items, z }]
    })
  }

  const addItemToExtraFolder = useCallback((folderId, item) => {
    setExtraFolders(list => list.map(f => f.id === folderId ? { ...f, items: f.items.some(i => i.id === item.id) ? f.items : [...f.items, item] } : f))
  }, [])

  function bringExtraFolder(id) {
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, z: ++zCounterRef.current } : f))
  }

  return {
    extraFolders,
    setExtraFolders,
    createNewFolder,
    registerRef,
    handleMouseDown,
    openContext,
    closeAllContexts,
    getExtraFolderTargets,
    revealOrCloneFromDescriptor,
    addItemToExtraFolder,
    bringExtraFolder
  }
}
