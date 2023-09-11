import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import { useWeb3React } from '@web3-react/core'
import { ChainInfo } from 'constants/chainInfo'

import { NavButton } from 'components/Button'
import { BRIDGE_CHAIN_IDS, MIGRATION_CHAIN_IDS, APP_CHAIN_IDS } from 'constants/chains'
import { useRouter } from 'next/router'

export const Button = styled(NavButton)`
  background: ${({ theme }) => theme.bg1};
  justify-content: space-between;
  gap: 5px;

  &:focus,
  &:hover {
    cursor: default;
    border: 1px solid ${({ theme }) => theme.text3};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      &:nth-child(2) {
        display: none;
      }
    }
  `};
`

const Text = styled.p`
  width: fit-content;
  /* overflow: hidden; */
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`

export default function Web3Network() {
  const { account, chainId } = useWeb3React()
  const router = useRouter()

  const Chain = useMemo(() => {
    return chainId && chainId in ChainInfo ? ChainInfo[chainId] : null
  }, [chainId])

  if (!account || !chainId || !Chain || (!APP_CHAIN_IDS.includes(chainId) && !router.route.includes('/migration'))) {
    return null
  } else if (router.route.includes('/migration') && !MIGRATION_CHAIN_IDS.includes(chainId)) {
    return null
  } else if (router.route.includes('/bridge') && !BRIDGE_CHAIN_IDS.includes(chainId)) {
    return null
  } else if (
    !router.route.includes('/migration') &&
    !router.route.includes('/bridge') &&
    !APP_CHAIN_IDS.includes(chainId)
  ) {
    return null
  }

  return (
    <Button>
      <Image src={Chain.logoUrl} alt={Chain.label} width={20} height={20} />
      <Text>{Chain.label}</Text>
    </Button>
  )
}

// import React from 'react'
// import styled from 'styled-components'

// import { useWeb3React } from '@web3-react/core'
// import { ChainInfo } from 'constants/chainInfo'
// import { FALLBACK_CHAIN_ID, SUPPORTED_CHAIN_IDS } from 'constants/chains'

// import { NavButton } from 'components/Button'
// import ImageWithFallback from 'components/ImageWithFallback'

// const Button = styled(NavButton)`
//   padding: 0px 5px;
//   cursor: default;
//   height: 40px;
//   background: transparent;
//   border: 1px solid ${({ theme }) => theme.bg1};
//   border-radius: 0px 6px 6px 0px;
// `

// export default function Web3Network() {
//   const { account, chainId } = useWeb3React()

//   const Chain = ChainInfo[chainId || FALLBACK_CHAIN_ID]

//   if (!account || !chainId || !Chain || !SUPPORTED_CHAIN_IDS.includes(chainId)) {
//     return null
//   }

//   return (
//     <Button>
//       <ImageWithFallback src={Chain.logoUrl} alt={Chain.label} width={28} height={28} />
//       {/* <div>{Chain.label}</div> */}
//     </Button>
//   )
// }
