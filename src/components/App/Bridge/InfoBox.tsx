import { ExternalLink } from 'components/Link'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  width: 280px;
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
  & > p {
    margin-top: 6px;
    margin-bottom: 6px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 75%;
  `}
`

export default function InfoBox() {
  return (
    <Wrapper>
      <span style={{ color: 'green' }}>Explainer: </span>
      <p>
        If the destination chain is Arbitrum, swap to axlDEUS and bridge{' '}
        <ExternalLink
          href="https://satellite.money/?source=arbitrum&destination=ethereum&asset_denom=deus-wei&destination_address="
          style={{ textDecoration: 'underline' }}
        >
          here
        </ExternalLink>
      </p>
      <p>
        If the source chain is Arbitrum, bridge{' '}
        <ExternalLink
          href="https://satellite.money/?source=arbitrum&destination=ethereum&asset_denom=deus-wei&destination_address="
          style={{ textDecoration: 'underline' }}
        >
          here
        </ExternalLink>{' '}
        then swap to DEUS
      </p>
      <p>
        If both the source and destination chains are not Arbitrum, swap to axlDEUS, bridge{' '}
        <ExternalLink
          href="https://satellite.money/?source=arbitrum&destination=ethereum&asset_denom=deus-wei&destination_address="
          style={{ textDecoration: 'underline' }}
        >
          here
        </ExternalLink>
        , then swap to DEUS
      </p>
      <p>
        Find the full guide{' '}
        <ExternalLink href="https://docs.deus.finance/bridge/how-to-bridge" style={{ textDecoration: 'underline' }}>
          here
        </ExternalLink>
      </p>
    </Wrapper>
  )
}
