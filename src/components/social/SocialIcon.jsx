import React from 'react'
import socialIcon from '../../assets/win7/icons/social.ico'
import { Icon } from '../shared/Icon.jsx'

export function SocialIcon(props) {
  return <Icon {...props} iconSrc={socialIcon} alt="Social" name={props.name || 'Social'} />
}
