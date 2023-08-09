import styled from 'styled-components'

import Hero from 'components/Hero'
import { Container, Title } from 'components/App/StableCoin'
import SwapPage from 'components/App/Bridge'
import { Row } from 'components/Row'

const Wrapper = styled(Row)`
  margin-top: 50px;
  width: clamp(500px, 90%, 1000px);
  align-items: flex-start;
  flex-direction: row;
  gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`
export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #0badf4 -10.26%, #30efe4 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`
export const TopBorderWrap = styled.div<{ active?: boolean }>`
  background: ${({ theme }) => theme.deusColor};
  padding: 1px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.cLqdrColor};
  flex: 1;

  &:hover {
    filter: brightness(0.8);
  }
`
export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;
  height: 100%;
  width: 100%;
  display: flex;
`
// const ExternalLinkContainer = styled.div`
//   align-self: center;
//   display: flex;
//   background: none;
//   a {
//     color: ${({ theme }) => theme.text2};
//     &:hover {
//       color: ${({ theme }) => theme.text2};
//       text-decoration: underline;
//     }
//   }
// `

export default function Vest() {
  return (
    <Container>
      <Hero>
        <Title>DEUS/axlDEUS Bridge</Title>
      </Hero>
      <Wrapper>
        <SwapPage />
      </Wrapper>
    </Container>
  )
}
