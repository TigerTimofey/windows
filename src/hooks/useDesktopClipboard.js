import { useState, useCallback } from 'react'


export function useDesktopClipboard({ folder, email, recycle, extraFoldersRef, revealOrCloneFromDescriptor }) {
  const [copiedItem, setCopiedItem] = useState(null)

  const captureCopy = useCallback((descriptor) => setCopiedItem(descriptor), [])

  const makeUnique = useCallback((baseName) => {
    const existingNames = new Set([
      folder.name,
      email.name,
      recycle.name,
      ...extraFoldersRef.current.map(f => f.name)
    ])
    if (!existingNames.has(baseName)) return baseName
    const match = baseName.match(/^(.*) copy\((\d+)\)$/)
    let stem = baseName
    if (match) stem = match[1]
    let idx = 1
    let candidate = `${stem} copy(${idx})`
    while (existingNames.has(candidate)) { idx += 1; candidate = `${stem} copy(${idx})` }
    return candidate
  }, [folder.name, email.name, recycle.name, extraFoldersRef])

  const paste = useCallback(() => {
    if (!copiedItem) return
    // Only allow folders to be pasted
    if (copiedItem.type === 'extra-folder' || copiedItem.id?.startsWith('new-folder-')) {
      const clone = { ...copiedItem, id: `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}` }
      clone.name = makeUnique(clone.name || 'New Folder')
      clone.items = (copiedItem.items || []).map(it => ({ ...it }))
      revealOrCloneFromDescriptor(clone)
    }
  }, [copiedItem, makeUnique, revealOrCloneFromDescriptor])

  return { copiedItem, captureCopy, paste }
}

export function buildCopyHandlers({ folder, captureCopy, extraFolderIcon }) {
  return {
    copyFolder: () => {
      const newId = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      captureCopy({ id: newId, name: folder.name, icon: extraFolderIcon, type: 'extra-folder', items: folder.items.map(it => ({ ...it })) })
      navigator.clipboard?.writeText(folder.name).catch(()=>{})
    },
    copyExtraFolder: (tgt) => {
      const newId = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      captureCopy({ id: newId, name: tgt.name, icon: extraFolderIcon, type: 'extra-folder', items: (tgt.items||[]).map(it => ({...it})) })
      navigator.clipboard?.writeText(tgt.name).catch(()=>{})
    }
  }
}
      