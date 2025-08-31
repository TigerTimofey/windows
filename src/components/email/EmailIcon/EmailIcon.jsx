import React from 'react'
import emailIcon from '../../../assets/win7/icons/email.ico'
import { Icon } from '../../shared/Icon.jsx'
import './EmailIcon.css'

export function EmailIcon(props) {
  return <Icon {...props} iconSrc={emailIcon} alt="Email" name={props.name || 'Email'} className="email-icon-wrapper" />
}
