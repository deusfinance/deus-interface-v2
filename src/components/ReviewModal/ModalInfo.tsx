import { RowBetween, RowEnd, RowStart } from 'components/Row'
import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
  margin: 10px 15px;
`

const Title = styled(RowStart)`
  font-family: 'Noto Sans';
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.text5};
`

const Value = styled(RowEnd)`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.text1};

  font-family: 'Noto Sans Mono';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  text-align: right;

  color: ${({ theme }) => theme.text6};
`

export default function ModalInfo({ info }: { info: { title: string; value: string }[] }) {
  return (
    <Wrapper>
      {info.map((info, index) => {
        return (
          <RowBetween key={index}>
            <Title>{info.title}:</Title>
            <Value>{info.value}</Value>
          </RowBetween>
        )
      })}
    </Wrapper>
  )
}
