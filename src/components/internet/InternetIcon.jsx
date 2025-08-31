import React, { useEffect, useRef } from 'react'
import internetIcon from '../../assets/win7/icons/gitgub.png'
import { Icon } from '../shared/Icon.jsx'

export function InternetIcon({ iconRef, style, onMouseDown, onContextMenu, name = 'GitHub', renaming = false, onRenameCommit, onRenameCancel, onClick, onDoubleClick }) {
  const inputRef = useRef(null)
  useEffect(() => { if (renaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [renaming])

  const isTouchOrCoarse = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )

  const openGitHub = (e) => {
    if (e) e.preventDefault()
    window.open('https://github.com/TigerTimofey/windows', '_blank', 'noopener,noreferrer')
  }

  const handleClick = isTouchOrCoarse ? openGitHub : onClick
  const handleDoubleClick = !isTouchOrCoarse ? openGitHub : onDoubleClick

  return (
    <Icon
      iconRef={iconRef}
      style={style}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      name={name}
      renaming={renaming}
      onRenameCommit={onRenameCommit}
      onRenameCancel={onRenameCancel}
      iconSrc={internetIcon}
      alt="GitHub"
    />
  )
}
