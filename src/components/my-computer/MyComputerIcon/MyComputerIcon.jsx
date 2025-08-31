import React from 'react'
import myComputerIcon from '../../../assets/win7/icons/mycomputer.svg'
import { Icon } from '../../shared/Icon.jsx'

export function MyComputerIcon(props) {
  return <Icon {...props} iconSrc={myComputerIcon} alt="My Computer" name={props.name || 'My Computer'} />
}