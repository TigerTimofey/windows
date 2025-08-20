import React from 'react'
import ModalWindow from '../../modal/ModalWindow.jsx'

// Renders one extra folder modal and its items (including nested folders, system icons, and base folder)
export function ExtraFolderModal({ f, zIndex, bring, bringExtraFolder, setExtraFolders, email, setCompModalOpen, restoreComputer, folder, addItemToBin, extraFolderIcon, onClose }) {
  if (!f.modalOpen) return null

  function openItem(item) {
    if (item.id.startsWith('new-folder-')) {
      // Open nested extra folder and raise only that folder's z-index
      setExtraFolders(list => list.map(fl => fl.id === item.id ? { ...fl, modalOpen: true } : fl))
      bringExtraFolder && bringExtraFolder(item.id)
      return
    }
    if (item.id === 'email') { email.setModalOpen(true); bring('email'); return }
    if (item.id === 'mycomputer') { setCompModalOpen(true); bring('comp'); return }
  if (item.id === 'ghost-folder') { folder.setModalOpen(true); bring('folder'); return }
  }

  function deleteItem(item) {
    // Send everything to bin (including nested extra folders & base folder entry)
  addItemToBin({ id: item.id, name: item.name, icon: item.icon })
    setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, items: fl.items.filter(it => it.id !== item.id) } : fl))
    if (item.id.startsWith('new-folder-')) {
      setExtraFolders(list => list.map(fl => fl.id === item.id ? { ...fl, visible: false, modalOpen: false } : fl))
    }
    if (item.id === 'ghost-folder') {
      // hide base folder already hidden; nothing extra
      folder.setModalOpen(false)
    }
    if (item.id === 'email') email.setModalOpen(false)
    if (item.id === 'mycomputer') setCompModalOpen(false)
  }

  function toDesktop(item) {
    if (item.id === 'email') email.restore()
    else if (item.id === 'mycomputer') restoreComputer()
    else if (item.id === 'ghost-folder') folder.restore()
    else if (item.id.startsWith('new-folder-')) {
      setExtraFolders(list => list.map(fl => (
        fl.id === item.id
          ? { ...fl, visible: true, pos: { x: 18, y: 300 + list.filter(x => x.visible && x.id !== item.id).length * 90 } }
          : fl
      )))
    }
    setExtraFolders(list => list.map(fl => fl.id === f.id ? { ...fl, items: fl.items.filter(it => it.id !== item.id) } : fl))
  }

  return (
  <ModalWindow title={f.name} onClose={onClose} zIndex={zIndex} onActivate={() => (bringExtraFolder ? bringExtraFolder(f.id) : bring('folder'))}>
      {(!f.items || f.items.length === 0) ? (
        <div className="modal-empty-message">The folder is empty.</div>
      ) : (
        <div className="modal-bin-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {f.items.map(item => (
            <div key={item.id} className="modal-bin-item" style={{ alignItems: 'center', gap: 4 }}>
              <img src={item.icon || extraFolderIcon} alt={item.name} className="modal-bin-icon" draggable={false} />
              <span className="modal-bin-label" style={{ textAlign: 'center' }}>{item.name}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                <button className="modal-bin-restore-btn" onClick={() => openItem(item)}>Open</button>
                <button className="modal-bin-restore-btn" onClick={() => deleteItem(item)}>Delete</button>
                <button className="modal-bin-restore-btn" onClick={() => toDesktop(item)}>To Desktop</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalWindow>
  )
}
