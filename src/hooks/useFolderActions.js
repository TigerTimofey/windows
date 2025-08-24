// Centralized folder item actions to keep App.jsx cleaner
// Each function receives dependency objects to avoid tight coupling.

export function openItemFromBaseFolder(id, { email, bring, setCompModalOpen, setExtraFolders, folder, zCounterRef, bringExtraFolder, internet }) {
  if (id === 'email') { email.setModalOpen(true); bring('email'); return }
  if (id === 'mycomputer') { setCompModalOpen(true); bring('comp'); return }
  if (id.startsWith('new-folder-')) {
  setExtraFolders(list => list.map(f => f.id === id ? { ...f, modalOpen: true, z: f.z ? f.z : ++zCounterRef.current } : f))
  // Ensure the newly opened nested folder is above its container
  if (bringExtraFolder) bringExtraFolder(id)
    return
  }
  if (id === 'ghost-folder') {
    // elevate ghost-folder z first so it appears above the container modal
  ++zCounterRef.current
    folder.setModalOpen(true)
    // Ensure base folder z state updates through supplied bring mechanism
    bring('folder')
    return
  }
  // Support cloned system icons stored inside the base folder by their clone ids (prefixed 'clone-')
  if (id.startsWith('clone-email-') || id.startsWith('clone-email')) { email.setModalOpen(true); bring('email'); return }
  if (id.startsWith('clone-mycomputer-') || id.startsWith('clone-mycomputer')) { setCompModalOpen(true); bring('comp'); return }
  if (id.startsWith('clone-ghost-') || id.startsWith('clone-ghost')) { folder.setModalOpen(true); bring('folder'); return }
  if (id === 'internet') { internet && internet.restore && internet.restore(); return }
}

export function deleteItemFromBaseFolder(id, { folder, addItemToBin, email, setExtraFolders, extraFolderIcon, internet }) {
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
    // Remove reference, hide the extra folder on desktop, and move to bin like other deletions
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
}

export function moveItemFromBaseFolderToDesktop(id, { folder, email, restoreComputer, setExtraFolders, internet }) {
  if (id === 'email') { folder.removeItem('email'); email.restore(); return }
  if (id === 'mycomputer') { folder.removeItem('mycomputer'); restoreComputer(); return }
  if (id.startsWith('new-folder-')) {
    // show the extra folder back on desktop
    folder.removeItem(id)
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, visible: true } : f))
    return
  }
  if (id === 'ghost-folder') { folder.removeItem('ghost-folder'); folder.restore(); return }
  if (id === 'internet') { folder.removeItem('internet'); internet && internet.restore && internet.restore(); return }
}
