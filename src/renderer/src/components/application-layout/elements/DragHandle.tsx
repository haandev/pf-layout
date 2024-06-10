import IconDragVertical from '../icons/IconDragVertical'
import clsx from 'clsx'
import { FC } from 'react'

export const DragHandle: FC = () => {
  return (
    <div
      className={clsx({
        'pf-drag-handle': true
      })}
    >
      <IconDragVertical height={20} width={20} />
    </div>
  )
}
