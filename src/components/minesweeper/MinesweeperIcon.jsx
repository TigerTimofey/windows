import React from 'react'
import minesweeperIcon from '../../assets/win7/icons/minesweeper.png'
import { Icon } from '../shared/Icon.jsx'

export function MinesweeperIcon(props) {
  return <Icon {...props} iconSrc={minesweeperIcon} alt="Minesweeper" name={props.name || 'Minesweeper'} />
}
