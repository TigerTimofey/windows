// Centralized folder item actions to keep App.jsx cleaner
// Each function receives dependency objects to avoid tight coupling.

export function openItemFromBaseFolder(id, { email, bring, setCompModalOpen, setExtraFolders, folder, zCounterRef, bringExtraFolder }) {
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
}

export function deleteItemFromBaseFolder(id, { folder, addItemToBin, email, setExtraFolders, extraFolderIcon }) {
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
}

export function moveItemFromBaseFolderToDesktop(id, { folder, email, restoreComputer, setExtraFolders }) {
  if (id === 'email') { folder.removeItem('email'); email.restore(); return }
  if (id === 'mycomputer') { folder.removeItem('mycomputer'); restoreComputer(); return }
  if (id.startsWith('new-folder-')) {
    // show the extra folder back on desktop
    folder.removeItem(id)
    setExtraFolders(list => list.map(f => f.id === id ? { ...f, visible: true } : f))
    return
  }
  if (id === 'ghost-folder') { folder.removeItem('ghost-folder'); folder.restore(); return }
}
