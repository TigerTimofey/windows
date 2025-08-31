import React from 'react'
import folderIcon from '../../../assets/win7/icons/folder.ico'
import { Icon } from '../../shared/Icon.jsx'

export function FolderIcon(props) {
  return <Icon {...props} iconSrc={folderIcon} alt="ghost-writer" name={props.name || 'ghost-writer'} />
}
