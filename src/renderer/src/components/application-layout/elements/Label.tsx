import clsx from 'clsx'
import { FC } from 'react'

export interface LabelProps {
  children: string
  style?: React.CSSProperties
  className?: string
}
export const Label: FC<LabelProps> = (props) => {
  return (
    <span
      style={props.style}
      className={clsx({
        'pf-item-text': true,
        [props.className || '']: true
      })}
    >
      {props.children}
    </span>
  )
}
