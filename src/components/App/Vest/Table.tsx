import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import Image from 'next/image'
import toast from 'react-hot-toast'

import { useVeDeusContract } from 'hooks/useContract'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVestedInformation } from 'hooks/useVested'
import { useVeDistContract } from 'hooks/useContract'

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'

import { formatAmount, formatBalance } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import { ButtonText, TopBorder, TopBorderWrap } from 'components/App/Vest'
import useWeb3React from 'hooks/useWeb3'
import MigrateSingleNFT from './MigrateSingleNFT'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`

const TableWrapper = styled.table<{ isEmpty?: boolean }>`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: ${({ isEmpty }) => (isEmpty ? '12px' : '0')};
  border-bottom-left-radius: ${({ isEmpty }) => (isEmpty ? '12px' : '0')};
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px;
`

const Cell = styled.td<{
  justify?: boolean
}>`
  align-items: center;
  padding: 5px;
  height: 90px;
`

const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
`

const CellAmount = styled.div`
  font-size: 0.85rem;
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.95rem;
  `};
`

const Name = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 12px;
  `};
`

const Value = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
`

const VDeusValue = styled(Value)`
  color: ${({ theme }) => theme.clqdrBlueColor};
`

const ZebraStripesRow = styled(Row)<{ isEven?: boolean }>`
  background: ${({ isEven, theme }) => (isEven ? theme.bg2 : theme.bg1)};
`

const ExpirationPassed = styled.div`
  & > * {
    color: ${({ theme }) => theme.yellow4};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    width: 100%;
    justify-content: space-between;
  `};
`

const MobileCell = styled.div`
  display: flex;
  justify-content: space-between;
  width: 95%;
  margin-left: 10px;
`

const MobileWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`

const itemsPerPage = 10

export default function Table({
  nftIds,
  isMobile,
  rewards,
  migrationAmounts,
  isLoading,
}: {
  nftIds: number[]
  migrationAmounts: string[]
  isMobile?: boolean
  rewards: number[]
  isLoading: boolean
}) {
  const [offset, setOffset] = useState(0)
  const { account } = useWeb3React()

  const paginatedItems = useMemo(() => {
    return nftIds.slice(offset, offset + itemsPerPage)
  }, [nftIds, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(nftIds.length / itemsPerPage)
  }, [nftIds])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <>
      <Wrapper>
        <TableWrapper isEmpty={paginatedItems.length === 0}>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => {
                const nftIndex = nftIds.indexOf(nftId)
                return (
                  <TableRow
                    key={index}
                    index={index}
                    nftId={nftId}
                    isMobile={isMobile}
                    reward={rewards[nftIndex] ?? 0}
                    migrationAmount={formatBalance(migrationAmounts[nftIndex]) ?? '0'}
                  />
                )
              })}
          </tbody>
          {paginatedItems.length === 0 && (
            <tbody>
              <tr>
                <td>
                  <div style={{ margin: '0 auto' }}>
                    {isLoading ? (
                      <Image src={isMobile ? LOADING_LOCK_MOBILE : LOADING_LOCK} alt="loading-lock" />
                    ) : (
                      <Image src={isMobile ? EMPTY_LOCK_MOBILE : EMPTY_LOCK} alt="empty-lock" />
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  {!account ? (
                    <NoResults warning>Wallet is not connected!</NoResults>
                  ) : isLoading ? (
                    <NoResults>Loading...</NoResults>
                  ) : (
                    <NoResults>No lock found</NoResults>
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </TableWrapper>
        <PaginationWrapper>
          {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
        </PaginationWrapper>
      </Wrapper>
    </>
  )
}

function TableRow({
  nftId,
  index,
  isMobile,
  reward,
  migrationAmount,
}: {
  nftId: number
  index: number
  isMobile?: boolean
  reward: number
  migrationAmount: string
}) {
  const [showSingleMigrateNFT, setShowSingleMigrateNFT] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [ClaimAwaitingConfirmation, setClaimAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const { deusAmount, lockEnd } = useVestedInformation(nftId)
  const veDEUSContract = useVeDeusContract()
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useHasPendingVest(pendingTxHash, true)
  const veDistContract = useVeDistContract()

  // subtracting 10 seconds to mitigate this from being true on page load
  const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd])

  const onClaim = useCallback(async () => {
    try {
      if (!veDistContract) return
      setClaimAwaitingConfirmation(true)
      const response = await veDistContract.claim(nftId)
      addTransaction(response, { summary: `Claim #${nftId} reward`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setClaimAwaitingConfirmation(false)
    } catch (err) {
      console.log(DefaultHandlerError(err))
      setClaimAwaitingConfirmation(false)
      setPendingTxHash('')
      if (err?.code === 4001) {
        toast.error('Transaction rejected.')
      } else toast.error(DefaultHandlerError(err))
    }
  }, [veDistContract, nftId, addTransaction])

  const onMigrate = useCallback(() => {
    if (reward > 0 && !lockHasEnded) {
      toast.error('First claim rewards. After migration, unclaimed rewards will be lost.')
      return
    }
    setShowSingleMigrateNFT(true)
  }, [reward, lockHasEnded])

  const onWithdraw = useCallback(async () => {
    try {
      if (!veDEUSContract || !lockHasEnded) return
      setAwaitingConfirmation(true)
      const response = await veDEUSContract.withdraw(nftId)
      addTransaction(response, { summary: `Withdraw #${nftId} from Vesting`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [veDEUSContract, lockHasEnded, nftId, addTransaction])

  function getExpirationCell() {
    if (!lockHasEnded)
      return (
        <>
          <Name>Expiration</Name>
          <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
          {/* <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription> */}
        </>
      )
    return (
      <ExpirationPassed>
        <Name>Expired in</Name>
        <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
      </ExpirationPassed>
    )
  }

  function getMigrateCell() {
    // if (awaitingRedeemConfirmation) {
    //   return (
    //     <MainButton>
    //       Migrating to ERC20 <DotFlashing />
    //     </MainButton>
    //   )
    // }

    return (
      <PrimaryButtonWide whiteBorder onClick={onMigrate}>
        <ButtonText>Migrate to xDEUS</ButtonText>
      </PrimaryButtonWide>
    )
  }

  function getClaimWithdrawCell() {
    if (awaitingConfirmation || showTransactionPending) {
      return (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide transparentBG>
              <ButtonText gradientText>
                {awaitingConfirmation ? 'Confirming' : 'Withdrawing'} <DotFlashing />
              </ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    } else if (lockHasEnded) {
      return (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide transparentBG onClick={onWithdraw}>
              <ButtonText gradientText>Withdraw</ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    } else if (reward) {
      if (ClaimAwaitingConfirmation || showTransactionPending) {
        return (
          <PrimaryButtonWide>
            <ButtonText>
              {ClaimAwaitingConfirmation ? 'Confirming' : 'Claiming'} <DotFlashing />
            </ButtonText>
          </PrimaryButtonWide>
        )
      }
      return (
        <PrimaryButtonWide style={{ margin: '0 auto' }} onClick={onClaim}>
          <ButtonText>Claim {formatAmount(reward, 3)}</ButtonText>
        </PrimaryButtonWide>
      )
    }
    return null
  }

  function getTableRow() {
    return (
      <>
        <Cell>
          <RowCenter>
            <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
            <NFTWrap>
              <CellAmount>veDEUS #{nftId}</CellAmount>
            </NFTWrap>
          </RowCenter>
        </Cell>

        <Cell>
          <Name>Vest Amount</Name>
          <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
        </Cell>

        <Cell>
          <Name>Migration Amount</Name>
          <VDeusValue>{migrationAmount} xDEUS</VDeusValue>
        </Cell>

        <Cell style={{ padding: '5px 10px' }}>{getExpirationCell()}</Cell>

        <Cell style={{ padding: '5px 10px' }}>{getClaimWithdrawCell()}</Cell>

        <Cell style={{ padding: '5px 10px' }}>
          {/* {getApproveButton()} */}
          {getMigrateCell()}
        </Cell>
      </>
    )
  }

  function getTableRowMobile() {
    return (
      <MobileWrapper>
        <FirstRow>
          <RowCenter>
            <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
            <NFTWrap>
              <CellAmount>veDEUS #{nftId}</CellAmount>
            </NFTWrap>
          </RowCenter>

          <RowCenter style={{ padding: '5px 2px' }}>{getClaimWithdrawCell()}</RowCenter>

          <RowCenter style={{ padding: '5px 2px' }}>
            {/* {getApproveButton()} */}
            {getMigrateCell()}
          </RowCenter>
        </FirstRow>

        <MobileCell>
          <Name>Vest Amount</Name>
          <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
        </MobileCell>

        <Cell>
          <Name>Migration Amount</Name>
          <VDeusValue>{migrationAmount} xDEUS</VDeusValue>
        </Cell>

        <MobileCell>{getExpirationCell()}</MobileCell>
      </MobileWrapper>
    )
  }

  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      {isMobile ? getTableRowMobile() : getTableRow()}
      <MigrateSingleNFT
        isOpen={showSingleMigrateNFT}
        onDismiss={() => setShowSingleMigrateNFT(false)}
        nftId={nftId}
        deusAmount={formatBalance(deusAmount)}
        migrationAmount={migrationAmount}
      />
    </ZebraStripesRow>
  )
}
