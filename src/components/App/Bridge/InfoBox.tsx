import styled from 'styled-components'
import { ExternalLink } from 'components/Link'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`
const Wrapper = styled(Container)`
  width: clamp(250px, 75%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
  & > p {
    margin-top: 8px;
    margin-bottom: 8px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 75%;
  `}
`
const Title = styled.span`
  color: ${({ theme }) => theme.clqdChartPrimaryColor};
  font-size: 24px;
  margin-bottom: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
  `}
`

export default function InfoBox() {
  const squidRouterLink = 'https://v2.app.squidrouter.com/'

  return (
    <Wrapper>
      <Title>Explainer: </Title>
      <p>
        1. If bridging to or from Base and Optimism, swap to axlDEUS, bridge{' '}
        <ExternalLink href={squidRouterLink} style={{ textDecoration: 'underline' }}>
          here
        </ExternalLink>
        , then swap to DEUS
      </p>
      <p>
        2. For all other chains, bridge DEUS directly{' '}
        <ExternalLink href={squidRouterLink} style={{ textDecoration: 'underline' }}>
          here
        </ExternalLink>
      </p>
      <p style={{ paddingTop: '20px' }}>
        Find the full guide{' '}
        <ExternalLink href="https://docs.deus.finance/bridge/how-to-bridge" style={{ textDecoration: 'underline' }}>
          here
        </ExternalLink>
      </p>
    </Wrapper>
  )
}
