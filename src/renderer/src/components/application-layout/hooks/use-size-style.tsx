import React from 'react'
import { Direction } from '../types'

export const useSizeStyle = (size: number | undefined, direction: Direction) => {
  const style: React.CSSProperties = {}
  if (size && direction === Direction.Horizontal) {
    style.maxWidth = `${size}px`
    style.minWidth = `${size}px`
    style.width = `${size}px`
  } else if (size && direction === Direction.Vertical) {
    style.maxHeight = `${size}px`
    style.minHeight = `${size}px`
    style.height = `${size}px`
  } else if (!direction) {
    style.maxWidth = `${size}px`
    style.maxWidth = `${size}px`
    style.minWidth = `${size}px`
    style.width = `${size}px`
  }
  return style
}
