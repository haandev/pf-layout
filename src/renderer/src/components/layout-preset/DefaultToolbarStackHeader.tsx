import { FC, useRef } from 'react'
import clsx from 'clsx'
import { useParentDirection, useValidateElement } from '../application-layout/hooks'
import IconChevronsRight from '../application-layout/icons/IconChevronsRight'
import IconChevronsLeft from '../application-layout/icons/IconChevronsLeft'
import { Direction } from '../application-layout/types'
import IconChevronsDown from '../application-layout/icons/IconChevronsDown'
import IconChevronsUp from '../application-layout/icons/IconChevronsUp'
import IconXmark from '../application-layout/icons/IconXmark'

export interface DefaultToolbarStackHeaderProps {
  leftButton?: {
    onLeftChevronClick?: undefined | null | false | (() => void)
    onRightChevronClick?: undefined | null | false | (() => void)
  }
  rightButton?: {
    onLeftChevronClick?: undefined | null | false | (() => void)
    onRightChevronClick?: undefined | null | false | (() => void)
  }
  onClose?: () => void
}
export const DefaultToolbarStackHeader: FC<DefaultToolbarStackHeaderProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStackHeader must be used within a ToolbarStack.')
    }
  })

  const toolbarStackDirection = useParentDirection(rootRef, '.pf-toolbar-stack')

  const isVertical = toolbarStackDirection === Direction.Vertical

  const _left = [
    props.leftButton?.onRightChevronClick && (
      <button key="left-right" onClick={() => props.leftButton?.onRightChevronClick && props.leftButton.onRightChevronClick()}>
        {isVertical ? <IconChevronsRight width={10} height={10} /> : <IconChevronsDown width={10} height={10} />}
      </button>
    ),
    props.leftButton?.onLeftChevronClick && (
      <button key="left-left" onClick={() => props.leftButton?.onLeftChevronClick && props.leftButton.onLeftChevronClick()}>
        {isVertical ? <IconChevronsLeft width={10} height={10} /> : <IconChevronsUp width={10} height={10} />}
      </button>
    )
  ]
  const _right = [
    props.rightButton?.onRightChevronClick && (
      <button key="right-right" onClick={() => props.rightButton?.onRightChevronClick && props.rightButton.onRightChevronClick()}>
        {isVertical ? <IconChevronsRight width={10} height={10} /> : <IconChevronsDown width={10} height={10} />}
      </button>
    ),
    props.rightButton?.onLeftChevronClick && (
      <button key="right-left" onClick={() => props.rightButton?.onLeftChevronClick && props.rightButton.onLeftChevronClick()}>
        {isVertical ? <IconChevronsLeft width={10} height={10} /> : <IconChevronsUp width={10} height={10} />}
      </button>
    )
  ]
  const group = rootRef.current?.closest('.pf-toolbar-stack-group')
  const stack = rootRef.current?.closest('.pf-toolbar-stack')
  const isFirstChild = group?.firstElementChild === stack

  const close = props.onClose ? (
    <button onClick={() => props.onClose?.()}>
      <IconXmark width={8} height={8} />
    </button>
  ) : null
  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack-header': true
      })}
    >
      <div className="pf-stack-header-left">
        {isFirstChild && close}
        {_left}
      </div>
      <div className="pf-stack-header-right">{_right}</div>
    </div>
  )
}
