import styled from 'styled-components'

import { SupportedChainId } from 'constants/chains'
import { DEUS_TOKEN, Tokens, XDEUS_TOKEN, SYMM_TOKEN, bDEI_TOKEN } from 'constants/tokens'

import MigrationCard from './MigrationCard'

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
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
        firstDescription="DEUS will focus on the stablecoin concept while leveraging amassed veNFTs for yield generation through liquidity AMOs."
        secondDescription=" DEUS stakers will receive 100% of all fees generated through stablecoin minting, AMOs and future stablecoin products."
      />
      <MigrationCard
        destinationTokens={[DEUS_TOKEN, SYMM_TOKEN]}
        sourceTokens={[DEUS_TOKEN, XDEUS_TOKEN, Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], bDEI_TOKEN]}
        firstDescription="BALANCED migration will ensure the user's investment ratio remains the same as before the split, with exposure to perps and stablecoin maintained precisely."
        secondDescription="Migrate easily and confidently to not miss out on any development by choosing the balanced migration approach."
      />
      <MigrationCard
        destinationTokens={[SYMM_TOKEN]}
        sourceTokens={[DEUS_TOKEN, XDEUS_TOKEN, Tokens['LEGACY_DEI'][SupportedChainId.FANTOM], bDEI_TOKEN]}
        firstDescription='The SYMMIO project will continue advancing the P2P bilateral (symmetrical) derivatives concept initially called "DEUS v3."'
        secondDescription="Upon migrating to SYMM, migrators will be issued $SYMM tokens, and $SYMM stakers will enjoy 100% of all fees generated by all third-party frontends."
      />
    </Wrapper>
  )
}
