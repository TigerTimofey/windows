import { useState, useCallback } from 'react'


export function useDesktopClipboard({ folder, email, recycle, extraFoldersRef, revealOrCloneFromDescriptor, story }) {
  const [copiedItem, setCopiedItem] = useState(null)

  const captureCopy = useCallback((descriptor) => setCopiedItem(descriptor), [])

  const makeUnique = useCallback((baseName) => {
    const existingNames = new Set([
      folder.name,
      email.name,
      recycle.name,
      story?.name,
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
  }, [folder.name, email.name, recycle.name, story?.name, extraFoldersRef])

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

export function buildCopyHandlers({ email, folder, recycle, compName, captureCopy, extraFolderIcon, internet, minesweeper, blog, story }) {
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
    },
    copyEmail: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(email.name).catch(()=>{})
    },
    copyBlog: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(blog.name).catch(()=>{})
    },
    copyStory: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(story.name).catch(()=>{})
    },
    copyComputer: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(compName).catch(()=>{})
    },
    copyBin: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(recycle.name).catch(()=>{})
    },
    copyInternet: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(internet.name).catch(()=>{})
    },
    copyMinesweeper: () => {
      // For now, just copy the name to clipboard
      navigator.clipboard?.writeText(minesweeper.name).catch(()=>{})
    }
  }
}
      