import React from 'react'
import { FC } from 'react'

export interface IconButtonProps {
  children: React.ReactElement
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const IconButton: FC<IconButtonProps> = (props) => {
  const children =
    !props.children.props.width && !props.children.props.height
      ? React.cloneElement(props.children as React.ReactElement, {
          width: 16,
          height: 16
        })
      : props.children

  return (
    <button className="pf-item-icon-button" onClick={props.onClick}>
      {children}
    </button>
  )
}
