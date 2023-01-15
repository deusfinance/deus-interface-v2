import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import veDEUS_LOGO from '/public/static/images/pages/veDEUS/veDEUS.svg'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'
import { DefaultHandlerError } from 'utils/parseError'

import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'
import { useVeDistContract } from 'hooks/useContract'
import { useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useDistRewards, { useVeMigrationData } from 'hooks/useDistRewards'

import Hero from 'components/Hero'
import { PrimaryButtonWide } from 'components/Button'
import { RowFixed, RowBetween } from 'components/Row'
import StatsHeader from 'components/StatsHeader'
import { Container } from 'components/App/StableCoin'
import { useSearch, SearchField, Table, TopBorder, TopBorderWrap, ButtonText } from 'components/App/Vest'
import MigrateAllManager from 'components/App/Vest/MigrateAllManager'
import { ExternalLink } from 'components/Link'
import ExternalLinkImage from '/public/static/images/pages/common/down.svg'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1168px);

  & > * {
    &:nth-child(3) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg0};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;

  & > * {
    margin: 10px;
    margin-right: 1px;
  }
`

const ButtonWrapper = styled(RowFixed)`
  gap: 4px;
  & > * {
    height: 50px;
  }
`

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
`
const ExternalLinkContainer = styled.div`
  align-self: center;
  display: flex;
  background: none;
  a {
    color: ${({ theme }) => theme.text2};
    &:hover {
      color: ${({ theme }) => theme.text2};
      text-decoration: underline;
    }
  }
`

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showMigrateAllManager, setShowMigrateAllManager] = useState(false)
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const addTransaction = useTransactionAdder()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)
  const isSupportedChainId = useSupportedChainId()
  const veDistContract = useVeDistContract()
  const ownedNfts = useOwnerVeDeusNFTs()
  const nftIds = ownedNfts.results
  const rewards = useDistRewards()
  const migData = useVeMigrationData(nftIds)

  const toggleWalletModal = useWalletModalToggle()

  const { snapshot, searchProps } = useSearch()
  const snapshotList = useMemo(() => {
    return snapshot.options.map((obj) => {
      return obj.value
    })
  }, [snapshot])

  useEffect(() => {
    setShowMigrateAllManager(false)
  }, [chainId, account])

  const toggleMigrateAllManager = () => {
    if (totalRewards > 0) {
      toast.error('First claim all rewards. After migration, unclaimed rewards will be lost.')
      return
    }
    setShowMigrateAllManager(true)
  }

  const [unClaimedIds, totalRewards] = useMemo(() => {
    if (!nftIds.length || !rewards.length || !migData.lockEnds) return [[], 0]
    let total = 0
    return [
      rewards.reduce((acc: number[], value: number, index: number) => {
        if (!value) return acc
        const lockHasEnded = dayjs.utc(migData.lockEnds[index]).isBefore(dayjs.utc().subtract(10, 'seconds'))
        if (lockHasEnded) {
          return acc
        }
        acc.push(nftIds[index])
        total += value
        return acc
      }, []),
      total,
    ]
  }, [nftIds, rewards, migData])

  const onClaimAll = useCallback(async () => {
    try {
      if (awaitingConfirmation || showTransactionPending || !totalRewards) return
      if (!veDistContract || !account || !isSupportedChainId || !unClaimedIds.length) return
      setAwaitingConfirmation(true)
      const response = await veDistContract.claimAll(unClaimedIds)
      addTransaction(response, { summary: `Claim All veDEUS rewards`, vest: { hash: response.hash } })
      setAwaitingConfirmation(false)
      setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [
    awaitingConfirmation,
    showTransactionPending,
    totalRewards,
    veDistContract,
    account,
    isSupportedChainId,
    unClaimedIds,
    addTransaction,
  ])

  function getClaimAllButton() {
    if (!snapshotList.length || !totalRewards) return
    let text = ''
    if (awaitingConfirmation) text = 'Confirming...'
    else if (showTransactionPending) text = 'Claiming...'
    else if (totalRewards) text = `Claim all ${formatAmount(totalRewards)} veDEUS`

    if (isMobile) {
      return (
        <PrimaryButtonWide style={{ marginTop: '2px', marginBottom: '12px' }} onClick={onClaimAll}>
          <ButtonText>{text}</ButtonText>
        </PrimaryButtonWide>
      )
    } else {
      return (
        <PrimaryButtonWide onClick={onClaimAll}>
          <ButtonText>{text}</ButtonText>
        </PrimaryButtonWide>
      )
    }
  }

  function getMainContent() {
    return !account ? (
      <TopBorderWrap>
        <TopBorder>
          <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
            <ButtonText gradientText>Connect Wallet</ButtonText>
          </PrimaryButtonWide>
        </TopBorder>
      </TopBorderWrap>
    ) : (
      !!snapshotList.length && (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide transparentBG onClick={toggleMigrateAllManager}>
              <ButtonText gradientText>Migrate ALL to xDEUS</ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    )
  }

  function getUpperRow() {
    if (isMobile) {
      return (
        <UpperRow>
          <FirstRowWrapper>
            <SearchField searchProps={searchProps} />
            {getMainContent()}
          </FirstRowWrapper>
          {getClaimAllButton()}
        </UpperRow>
      )
    } else {
      return (
        <UpperRow>
          <div>
            <SearchField searchProps={searchProps} />
          </div>
          <ButtonWrapper>
            {getClaimAllButton()}
            {getMainContent()}
          </ButtonWrapper>
        </UpperRow>
      )
    }
  }

  const items = useMemo(
    () => [
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) },
      { name: 'veDEUS Supply', value: formatAmount(parseFloat(lockedVeDEUS), 0) },
      {
        name: '',
        value: (
          <ExternalLinkContainer>
            <ExternalLink href="https://docs.deus.finance/xdeus/vedeus-greater-than-xdeus-migrator">
              Read more <Image alt="read more" width={10} height={10} src={ExternalLinkImage} />
            </ExternalLink>
          </ExternalLinkContainer>
        ),
        hasOwnColor: true,
      },
    ],
    [deusPrice, lockedVeDEUS]
  )

  return (
    <Container>
      <Hero>
        <Image src={veDEUS_LOGO} height={'90px'} alt="Logo" />
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        {getUpperRow()}
        <Table
          nftIds={snapshotList as number[]}
          isMobile={isMobile}
          rewards={rewards}
          migrationAmounts={migData.migrationAmounts}
          isLoading={ownedNfts.isLoading}
        />
      </Wrapper>
      <MigrateAllManager
        isOpen={showMigrateAllManager}
        onDismiss={() => setShowMigrateAllManager(false)}
        nftIds={nftIds}
        deusAmounts={migData.deusAmounts}
        migrationAmounts={migData.migrationAmounts}
      />
    </Container>
  )
}
