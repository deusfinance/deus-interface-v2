import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import useWeb3React from 'hooks/useWeb3'
import { ChainInfo } from 'constants/chainInfo'

import { NavButton } from 'components/Button'
import { BridgeChains, MigrationChains, SolidlyChains } from 'constants/chains'
import { useRouter } from 'next/router'

const Button = styled(NavButton)`
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

  if (!account || !chainId || !Chain) {
    return null
  } else if (router.route.includes('/migration') && !MigrationChains.includes(chainId)) {
    return null
  } else if (router.route.includes('/bridge') && !BridgeChains.includes(chainId)) {
    return null
  } else if (
    !router.route.includes('/migration') &&
    !router.route.includes('/bridge') &&
    !SolidlyChains.includes(chainId)
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
