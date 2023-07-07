import styled from 'styled-components'

import { SupportedChainId } from 'constants/chains'
import { DEUS_TOKEN, Tokens, XDEUS_TOKEN, SYMM_TOKEN, bDEI_TOKEN } from 'constants/tokens'

import MigrationCard from './MigrationCard'

const Wrapper = styled.div`
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column wrap;
    padding: 10px;
  `};
`

export default function CardBox() {
  return (
    <Wrapper>
      <MigrationCard
        destinationTokens={[DEUS_TOKEN]}
        sourceTokens={[Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], bDEI_TOKEN]}
      />
      <MigrationCard
        destinationTokens={[DEUS_TOKEN, SYMM_TOKEN]}
        sourceTokens={[DEUS_TOKEN, XDEUS_TOKEN, Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], bDEI_TOKEN]}
      />
      <MigrationCard
        destinationTokens={[SYMM_TOKEN]}
        sourceTokens={[DEUS_TOKEN, XDEUS_TOKEN, Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], bDEI_TOKEN]}
      />
    </Wrapper>
  )
}
