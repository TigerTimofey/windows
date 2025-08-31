import React from 'react'
import storyIcon from '../../assets/win7/icons/story.ico'
import { Icon } from '../shared/Icon.jsx'

export function StoryIcon(props) {
  return <Icon {...props} iconSrc={storyIcon} alt="Our Story" name={props.name || 'Our Story'} />
}
