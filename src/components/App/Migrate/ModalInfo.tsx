import styled from 'styled-components'

import { RowBetween, RowEnd, RowStart } from 'components/Row'

const MainWrapper = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  justify-content: center;
  margin: 10px 15px;
`

const Title = styled(RowStart)`
  font-family: 'Roboto';
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const Value = styled(RowEnd)`
  font-family: 'Space Grotesk';
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

export default function ModalInfo({ info }: { info: { title: string; value: string }[] }) {
  return (
    <MainWrapper>
      {info.map((info, index) => {
        return (
          <RowBetween key={index}>
            <Title>{info.title}</Title>
            <Value>{info.value}</Value>
          </RowBetween>
        )
      })}
    </MainWrapper>
  )
}
