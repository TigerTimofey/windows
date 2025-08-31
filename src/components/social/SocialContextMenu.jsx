import React from 'react'
import { ContextMenu } from '../shared/ContextMenu.jsx'

export function SocialContextMenu({ x, y, open, onOpen, onDelete, onRename }) {
  const items = [
    { label: 'Open', onClick: onOpen },
    { label: 'Delete', onClick: onDelete },
    { label: 'Rename', onClick: onRename }
  ]
  return <ContextMenu x={x} y={y} open={open} items={items} />
}
