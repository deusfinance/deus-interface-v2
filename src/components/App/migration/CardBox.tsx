import { SupportedChainId } from 'constants/chains'
import MigrationCard from './MigrationCard'

import { DEUS_TOKEN, Tokens, XDEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  /* flex-flow: column nowrap; */
  /* overflow: visible; */
  /* margin: 0 auto; */
  /* font-family: Inter; */
`

export default function CardBox() {
  return (
    <Wrapper>
      <MigrationCard
        destinationTokens={[DEUS_TOKEN]}
        sourceTokens={[Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], Tokens['DEI'][SupportedChainId.FANTOM]]}
      />
      <MigrationCard
        destinationTokens={[DEUS_TOKEN, SYMM_TOKEN]}
        sourceTokens={[
          DEUS_TOKEN,
          XDEUS_TOKEN,
          Tokens['LEGACY_DEI'][SupportedChainId.FANTOM],
          Tokens['DEI'][SupportedChainId.FANTOM],
        ]}
      />
      <MigrationCard
        destinationTokens={[SYMM_TOKEN]}
        sourceTokens={[
          DEUS_TOKEN,
          XDEUS_TOKEN,
          Tokens['LEGACY_DEI'][SupportedChainId.FANTOM],
          Tokens['DEI'][SupportedChainId.FANTOM],
        ]}
      />
    </Wrapper>
  )
}
