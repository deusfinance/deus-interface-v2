import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: clamp(250px, 90%, 1168px);
  margin: 0 auto;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
`

const Item = styled.div<{ selected: boolean; left: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  transition: all 0.3s ease;
  color: ${({ selected, theme }) => (selected ? theme.text1 : '#7c8893')};
  background: ${({ selected, theme }) => (selected ? '#1D282D' : theme.bg2)};
  margin: 6px;
  margin-right: ${({ left }) => left && '0'};
  margin-left: ${({ left }) => !left && '0'};
  border-radius: 8px;
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
    `}
  &:hover {
    cursor: pointer;
  }
`

const Line = styled.div`
  margin-top: 10px;
  width: 2px;
  height: 35px;
  background: ${({ theme }) => theme.bg0};
`

export enum ActionTypes {
  // EASY = 'EASY',
  MANUAL = 'MANUAL',
  DASHBOARD = 'DASHBOARD',
}

const ActionLabels = {
  // [ActionTypes.EASY]: 'Easy Migration',
  [ActionTypes.MANUAL]: 'Manual Migration',
  [ActionTypes.DASHBOARD]: 'My Migrations (Dashboard)',
}

export default function ActionSetter({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (value: ActionTypes) => void
}) {
  return (
    <Wrapper>
      {(Object.keys(ActionTypes) as Array<keyof typeof ActionTypes>).map((key, index) => {
        const label = ActionLabels[key]
        return (
          <React.Fragment key={index}>
            <Item
              left={index === 0}
              selected={key == selected}
              onClick={() => setSelected(ActionTypes[key])}
              key={index}
            >
              {label}
            </Item>
            {index === 0 && <Line />}
          </React.Fragment>
        )
      })}
    </Wrapper>
  )
}
