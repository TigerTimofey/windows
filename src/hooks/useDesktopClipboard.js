import { useState, useCallback } from 'react'
import myComputerIconAsset from '../assets/win7/icons/mycomputer.svg'

export function useDesktopClipboard({ folder, email, recycle, extraFoldersRef, cloned, revealOrCloneFromDescriptor }) {
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
    const baseNames = [folder.name, email.name, recycle.name]
    if (copiedItem.type === 'email') {
      cloned.addClone({ type: 'email', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'mycomputer') {
      cloned.addClone({ type: 'mycomputer', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'ghost') {
      cloned.addClone({ type: 'ghost', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'internet') {
      cloned.addClone({ type: 'internet', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'minesweeper') {
      cloned.addClone({ type: 'minesweeper', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'blog') {
      cloned.addClone({ type: 'blog', name: copiedItem.name, icon: copiedItem.icon, baseNames })
    } else if (copiedItem.type === 'extra-folder' || copiedItem.id?.startsWith('new-folder-')) {
      const clone = { ...copiedItem, id: `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}` }
      clone.name = makeUnique(clone.name || 'New Folder')
      clone.items = (copiedItem.items || []).map(it => ({ ...it }))
      revealOrCloneFromDescriptor(clone)
    }
  }, [copiedItem, folder.name, email.name, recycle.name, cloned, makeUnique, revealOrCloneFromDescriptor])

  return { copiedItem, captureCopy, paste }
}

export function buildCopyHandlers({ email, folder, recycle, compName, captureCopy, extraFolderIcon, internet, minesweeper, blog }) {
  return {
    copyEmail: () => { captureCopy({ id: 'email', name: email.name, icon: email.copyDescriptor().icon, type: 'email' }); navigator.clipboard?.writeText(email.name).catch(()=>{}) },
    copyFolder: () => {
      const newId = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      captureCopy({ id: newId, name: folder.name, icon: extraFolderIcon, type: 'extra-folder', items: folder.items.map(it => ({ ...it })) })
      navigator.clipboard?.writeText(folder.name).catch(()=>{})
    },
    copyBin: () => { captureCopy(recycle.copyDescriptor()); navigator.clipboard?.writeText(recycle.name).catch(()=>{}) },
    copyComputer: () => { captureCopy({ id: 'mycomputer', name: compName, icon: myComputerIconAsset, type: 'mycomputer' }); navigator.clipboard?.writeText(compName).catch(()=>{}) },
    copyExtraFolder: (tgt) => {
      const newId = `new-folder-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      captureCopy({ id: newId, name: tgt.name, icon: extraFolderIcon, type: 'extra-folder', items: (tgt.items||[]).map(it => ({...it})) })
      navigator.clipboard?.writeText(tgt.name).catch(()=>{})
    },
    copyInternet: () => {
      captureCopy({ id: 'internet', name: internet.name, icon: internet.copyDescriptor().icon, type: 'internet' })
      navigator.clipboard?.writeText(internet.name).catch(()=>{})
    },
    copyMinesweeper: () => {
      captureCopy({ id: 'minesweeper', name: minesweeper.name, icon: minesweeper.copyDescriptor().icon, type: 'minesweeper' })
      navigator.clipboard?.writeText(minesweeper.name).catch(()=>{})
    },
    copyBlog: () => {
      captureCopy({ id: 'blog', name: blog.name, icon: blog.copyDescriptor().icon, type: 'blog' })
      navigator.clipboard?.writeText(blog.name).catch(()=>{})
    }
  }
}
