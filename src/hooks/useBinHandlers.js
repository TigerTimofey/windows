import { useState, useCallback } from 'react'


export function useBinHandlers({ recycle, email, folder, revealOrCloneFromDescriptor, restoreComputer, trashSound, isTouchOrCoarse, bring, restoreInternet, restoreMinesweeper, restoreBlog, restoreStory, restoreSocial }) {
  const [binModalOpen, setBinModalOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const playTrashSound = useCallback(() => {
    try {
      const audio = new Audio(trashSound)
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch { /* ignore */ }
  }, [trashSound])

  const handleBinDoubleClick = useCallback(() => { setBinModalOpen(true); bring && bring('bin') }, [bring])
  const handleBinClick = useCallback(() => { if (isTouchOrCoarse) { setBinModalOpen(true); bring && bring('bin') } }, [isTouchOrCoarse, bring])
  const handleBinModalClose = useCallback(() => setBinModalOpen(false), [])

  const handleEmptyRequest = useCallback(() => { if (recycle.items.length) setConfirmClearOpen(true) }, [recycle.items.length])

  const handleRestoreAll = useCallback(() => {
    if (!recycle.items.length) return
    if (recycle.items.some(i => i.id === 'mycomputer')) restoreComputer()
    if (recycle.items.some(i => i.id === 'email')) email.restore()
    if (recycle.items.some(i => i.id === 'ghost-folder')) folder.restore()
    if (recycle.items.some(i => i.id === 'internet')) restoreInternet && restoreInternet()
    if (recycle.items.some(i => i.id === 'minesweeper')) restoreMinesweeper && restoreMinesweeper()
    if (recycle.items.some(i => i.id === 'blog')) restoreBlog && restoreBlog()
    if (recycle.items.some(i => i.id === 'story')) restoreStory && restoreStory()
    if (recycle.items.some(i => i.id === 'social')) restoreSocial && restoreSocial()
    recycle.items.filter(i => i.id && i.id.startsWith('new-folder-')).forEach(item => revealOrCloneFromDescriptor(item))
    recycle.setItems([])
  }, [recycle, restoreComputer, email, folder, revealOrCloneFromDescriptor, restoreInternet, restoreMinesweeper, restoreBlog, restoreStory, restoreSocial])

  const handleRestoreItem = useCallback((id) => {
    recycle.setItems(items => items.filter(i => i.id !== id))
    if (id === 'mycomputer') restoreComputer()
    else if (id === 'email') email.restore()
    else if (id === 'ghost-folder') folder.restore()
    else if (id === 'internet') restoreInternet && restoreInternet()
    else if (id === 'minesweeper') restoreMinesweeper && restoreMinesweeper()
    else if (id === 'blog') restoreBlog && restoreBlog()
    else if (id === 'story') restoreStory && restoreStory()
    else if (id === 'social') restoreSocial && restoreSocial()
    else if (id.startsWith && id.startsWith('new-folder-')) {
      const item = recycle.items.find(i => i.id === id)
      if (item) revealOrCloneFromDescriptor(item)
    }
  }, [recycle, restoreComputer, email, folder, revealOrCloneFromDescriptor, restoreInternet, restoreMinesweeper, restoreBlog, restoreStory, restoreSocial])

  const handleConfirmEmpty = useCallback(() => {
    if (recycle.items.length) playTrashSound()
    recycle.setItems([])
    setConfirmClearOpen(false)
  }, [recycle, playTrashSound])
  const handleCancelEmpty = useCallback(() => setConfirmClearOpen(false), [])

  return {
    binModalOpen,
    confirmClearOpen,
    handleBinDoubleClick,
    handleBinClick,
    handleBinModalClose,
    handleEmptyRequest,
    handleRestoreAll,
    handleRestoreItem,
    handleConfirmEmpty,
    handleCancelEmpty
  }
}
