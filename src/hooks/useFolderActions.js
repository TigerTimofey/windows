export function openItemFromBaseFolder(id, { email, bring, setCompModalOpen, setExtraFolders, folder, zCounterRef, bringExtraFolder, internet, minesweeper, blog, story, social }) {
  if (id === 'email') { email.setModalOpen(true); bring('email'); return }
  if (id === 'mycomputer') { setCompModalOpen(true); bring('comp'); return }
  if (id.startsWith('new-folder-')) {
  setExtraFolders(list => list.map(f => f.id === id ? { ...f, modalOpen: true, z: f.z ? f.z : ++zCounterRef.current } : f))
  if (bringExtraFolder) bringExtraFolder(id)
    return
  }
  if (id === 'ghost-folder') {
  ++zCounterRef.current
    folder.setModalOpen(true)
    bring('folder')
    return
  }
  if (id.startsWith('clone-email-') || id.startsWith('clone-email')) { email.setModalOpen(true); bring('email'); return }
  if (id.startsWith('clone-mycomputer-') || id.startsWith('clone-mycomputer')) { setCompModalOpen(true); bring('comp'); return }
  if (id.startsWith('clone-ghost-') || id.startsWith('clone-ghost')) { folder.setModalOpen(true); bring('folder'); return }
  if (id.startsWith('clone-minesweeper-') || id.startsWith('clone-minesweeper')) { minesweeper.setModalOpen(true); bring('minesweeper'); return }
  if (id.startsWith('clone-blog-') || id.startsWith('clone-blog')) { blog.setModalOpen(true); bring('blog'); return }
  if (id.startsWith('clone-story-') || id.startsWith('clone-story')) { story.setModalOpen(true); bring('story'); return }
  if (id.startsWith('clone-social-') || id.startsWith('clone-social')) { social.setModalOpen(true); bring('social'); return }
  if (id === 'internet') { internet && internet.restore && internet.restore(); return }
  if (id === 'blog') { blog.setModalOpen(true); bring('blog'); return }
  if (id === 'story') { story.setModalOpen(true); bring('story'); return }
  if (id === 'social') { social.setModalOpen(true); bring('social'); return }
}

export function deleteItemFromBaseFolder(id, { folder, addItemToBin, email, setExtraFolders, extraFolderIcon, internet, blog, story, social }) {
  if (id === 'email') {
    folder.removeItem('email')
    addItemToBin({ id: 'email', name: email.name, icon: email.copyDescriptor().icon })
    return
  }
  if (id === 'mycomputer') {
    folder.removeItem('mycomputer')
    addItemToBin({ id: 'mycomputer', name: 'My Computer', icon: undefined })
    return
  }
  if (id.startsWith('new-folder-')) {
    folder.removeItem(id)
    let removedName = 'New Folder'
    setExtraFolders(list => list.map(f => {
      if (f.id === id) { removedName = f.name; return { ...f, visible: false, modalOpen: false } }
      return f
    }))
    addItemToBin({ id, name: removedName, icon: extraFolderIcon })
  }
  if (id === 'internet') {
    folder.removeItem('internet')
    addItemToBin({ id: 'internet', name: internet.name, icon: internet.copyDescriptor().icon })
    return
  }
  if (id === 'blog') {
    folder.removeItem('blog')
    addItemToBin({ id: 'blog', name: blog.name, icon: blog.copyDescriptor().icon })
    return
  }
  if (id === 'story') {
    folder.removeItem('story')
    addItemToBin({ id: 'story', name: story.name, icon: story.copyDescriptor().icon })
    return
  }
  if (id === 'social') {
    folder.removeItem('social')
    addItemToBin({ id: 'social', name: social.name, icon: social.copyDescriptor().icon })
    return
  }
}

export function moveItemFromBaseFolderToDesktop(id, { folder, email, restoreComputer, setExtraFolders, internet, blog, social }) {
  if (id === 'email') { folder.removeItem('email'); email.restore(); return }
  if (id === 'mycomputer') { folder.removeItem('mycomputer'); restoreComputer(); return }
  if (id.startsWith('new-folder-')) {
    folder.removeItem(id)
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, visible: true } : f))
    return
  }
  if (id === 'ghost-folder') { folder.removeItem('ghost-folder'); folder.restore(); return }
  if (id === 'internet') { folder.removeItem('internet'); internet && internet.restore && internet.restore(); return }
    if (id === 'blog') { folder.removeItem('blog'); blog.restore(); return }
  if (id === 'social') { folder.removeItem('social'); social.restore(); return }
}
