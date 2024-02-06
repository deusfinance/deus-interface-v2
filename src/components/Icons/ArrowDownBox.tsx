import React from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

const Circle = styled.div<{
  size: number
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  /* width: ${({ size }) => size + 'px'}; */
  /* height: ${({ size }) => size + 'px'}; */
  background: rgba(34, 35, 37, 1);
  width: 44px;
  height: 52px;
  margin: -6px auto;
  z-index: 1;
`

export default function ArrowDownBox({ size = 30, ...rest }: { size?: number; [x: string]: any }) {
  return (
    <Circle size={size} {...rest}>
      <ArrowDown size={size} color="rgba(111, 115, 128, 1)" />
    </Circle>
  )
}
