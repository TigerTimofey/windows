import React from 'react'
import blogIcon from '../../assets/win7/icons/blog.ico'
import { Icon } from '../shared/Icon.jsx'

export function BlogIcon(props) {
  return <Icon {...props} iconSrc={blogIcon} alt="Blog" name={props.name || 'Blog'} />
}
