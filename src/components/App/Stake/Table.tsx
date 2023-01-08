import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { Token } from '@sushiswap/core-sdk'

import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'

import { LiquidityPool, StakingType, StakingVersion } from 'constants/stakingPools'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import { useCustomCoingeckoPrice } from 'hooks/useCoingeckoPrice'
import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { useUserInfo } from 'hooks/useStakingInfo'

import { formatDollarAmount } from 'utils/numbers'

import TokenBox from 'components/App/Stake/TokenBox'
import RewardBox from 'components/App/Stake/RewardBox'
import { ExternalLink } from 'components/Link'
import { Divider, HStack, VStack } from '../Staking/common/Layout'
import { PrimaryButtonWide } from 'components/Button'

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

export const Cell = styled.td<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 90px;
`

const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
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

const ZebraStripesRow = styled(Row)<{ isEven?: boolean }>`
  background: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    background:none;
  `};
`

const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const TopBorderWrap = styled.div<{ active?: boolean }>`
  background: ${({ theme }) => theme.deusColor};
  padding: 2px;
  border-radius: 12px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.clqdrBlueColor)};
  }
`

export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  height: 100%;
  width: 100%;
  display: flex;
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

export default function Table({ isMobile, stakings }: { isMobile?: boolean; stakings: StakingType[] }) {
  const { account } = useWeb3React()

  const isLoading = false

  return (
    <Wrapper>
      <TableWrapper isEmpty={stakings.length === 0}>
        <tbody>
          {stakings.length > 0 &&
            stakings.map((stakingPool: StakingType, index) => (
              <>
                <Divider backgroundColor="#101116" />
                <TableRow key={index} index={index} staking={stakingPool} isMobile={isMobile} />
              </>
            ))}
        </tbody>
        {stakings.length === 0 && (
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
    </Wrapper>
  )
}

const CustomButton = styled(ExternalLink)`
  width: 100%;
  padding: 14px 12px;
  span {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height:34px;
  `}
`

enum BUTTON_TYPE {
  MINI = 'MINI',
}

const titles = {
  mini: 'Manage',
}
const CustomButtonWrapper = ({ type, href, isActive }: { type: BUTTON_TYPE; href: string; isActive: boolean }) => {
  return (
    <CustomButton transparentBG href={isActive && href}>
      <ButtonText>
        {type === BUTTON_TYPE.MINI ? titles.mini : 'Farm on'}
        <HStack style={{ marginLeft: '1ch', alignItems: 'flex-end' }}>
          <Image width={8} height={8} src={BUTTON_TYPE.MINI} alt={titles.mini} />
        </HStack>
      </ButtonText>
    </CustomButton>
  )
}
const SpaceBetween = styled(HStack)`
  justify-content: space-between;
`
const TableRowLargeContainer = styled.div`
  width: 100%;
  display: table;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`
const MiniStakeHeaderContainer = styled(SpaceBetween)``
const MiniStakeContainer = styled.div`
  margin-block: 2px;
  background: ${({ theme }) => theme.bg1};
  display: none;
  padding: 16px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display:block;
  `};
`
const MiniStakeContentContainer = styled(VStack)`
  margin-top: 16px;
`
const MiniTopBorderWrap = styled(TopBorderWrap)`
  min-width: 109px;
  margin: 0px;
  & > * {
    min-width: 109px;
    max-height: 32px;
  }
`
interface ITableRowContent {
  tokens: Token[]
  name: StakingType['name']
  active: StakingType['active']
  rewardTokens: StakingType['rewardTokens']
  handleClick: () => void
  apr: number
  tvl: number
  provideLink?: string
  version: StakingVersion
}

const TableRowMiniContent = ({
  tokens,
  name,
  active,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
}: ITableRowContent) => {
  return (
    <MiniStakeContainer>
      <MiniStakeHeaderContainer>
        <TokenBox tokens={tokens} title={name} active={active} />
        <div>
          <MiniTopBorderWrap>
            <TopBorder {...(version !== StakingVersion.EXTERNAL && { onClick: active ? handleClick : undefined })}>
              {version === StakingVersion.EXTERNAL && provideLink ? (
                <CustomButtonWrapper isActive={active} href={provideLink} type={BUTTON_TYPE.MINI} />
              ) : (
                <PrimaryButtonWide transparentBG>
                  <ButtonText gradientText={!active}>{active ? 'Manage' : 'Withdraw'}</ButtonText>
                </PrimaryButtonWide>
              )}
            </TopBorder>
          </MiniTopBorderWrap>
        </div>
      </MiniStakeHeaderContainer>
      <MiniStakeContentContainer>
        <SpaceBetween>
          <Name>TVL</Name>
          <Value>{formatDollarAmount(tvl)}</Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>APR</Name>
          <Value> {apr !== -1 ? apr.toFixed(0) + '%' : 'N/A'} </Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>Reward Tokens</Name>
          <RewardBox tokens={rewardTokens} />
        </SpaceBetween>
      </MiniStakeContentContainer>
    </MiniStakeContainer>
  )
}

const TableRowLargeContent = ({
  tokens,
  name,
  active,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
}: ITableRowContent) => {
  return (
    <>
      <Cell width={'25%'}>
        <TokenBox tokens={tokens} title={name} active={active} />
      </Cell>

      <Cell width={'10%'}>
        <Name>APR</Name>
        <Value> {apr !== -1 ? apr.toFixed(0) + '%' : 'N/A'} </Value>
      </Cell>

      <Cell width={'18%'}>
        <Name>TVL</Name>
        <Value>{formatDollarAmount(tvl)}</Value>
      </Cell>

      <Cell style={{ textAlign: 'start' }}>
        <Name>Reward Tokens</Name>
        <RewardBox tokens={rewardTokens} />
      </Cell>

      <Cell width={'20%'} style={{ padding: '5px 10px' }}>
        <TopBorderWrap {...(version !== StakingVersion.EXTERNAL && { onClick: active ? handleClick : undefined })}>
          <TopBorder>
            {version === StakingVersion.EXTERNAL && provideLink ? (
              <CustomButtonWrapper isActive={active} href={provideLink} type={BUTTON_TYPE.MINI} />
            ) : (
              <PrimaryButtonWide style={{ backgroundColor: '#101116' }} transparentBG>
                <ButtonText gradientText={!active}>{active ? 'Manage' : 'Withdraw'}</ButtonText>
              </PrimaryButtonWide>
            )}
          </TopBorder>
        </TopBorderWrap>
      </Cell>
    </>
  )
}

const TableRowContent = ({ staking }: { staking: StakingType }) => {
  const { id, rewardTokens, active, name, provideLink = undefined, version } = staking
  const liquidityPool = LiquidityPool.find((p) => p.id === staking.id) || LiquidityPool[0]
  const tokens = liquidityPool?.tokens

  //const apr = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)

  // generate total APR if pools have secondary APRs
  const primaryApy = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)
  const secondaryApy = staking.hasSecondaryApy ? staking.secondaryAprHook(liquidityPool, staking) : 0
  const apr = primaryApy + secondaryApy

  const priceToken = liquidityPool.priceToken?.symbol ?? ''
  const price = useCustomCoingeckoPrice(priceToken) ?? '0'

  const poolBalances = usePoolBalances(liquidityPool)

  const totalLockedValue = useMemo(() => {
    return poolBalances[1] * 2 * parseFloat(price)
  }, [price, poolBalances])

  const isSingleStakingPool = useMemo(() => {
    return staking.isSingleStaking
  }, [staking])

  const { totalDepositedAmount } = useUserInfo(staking)

  const { swapRatio } = useVDeusStats()

  const totalDepositedValue = useMemo(() => {
    return totalDepositedAmount * swapRatio * parseFloat(price)
  }, [price, totalDepositedAmount, swapRatio])

  const router = useRouter()
  const handleClick = useCallback(() => {
    router.push(`/xdeus/stake/manage/${id}`)
  }, [id, router])
  return (
    <>
      <TableRowLargeContainer>
        <TableRowLargeContent
          active={active}
          handleClick={handleClick}
          name={name}
          rewardTokens={rewardTokens}
          tokens={tokens}
          apr={apr}
          tvl={isSingleStakingPool ? totalDepositedValue : totalLockedValue}
          provideLink={provideLink}
          version={version}
        />
      </TableRowLargeContainer>
      <TableRowMiniContent
        active={active}
        handleClick={handleClick}
        name={name}
        rewardTokens={rewardTokens}
        tokens={tokens}
        apr={apr}
        tvl={isSingleStakingPool ? totalDepositedValue : totalLockedValue}
        provideLink={provideLink}
        version={version}
      />
    </>
  )
}

function TableRow({ staking, index, isMobile }: { staking: StakingType; index: number; isMobile?: boolean }) {
  // const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  // const [ClaimAwaitingConfirmation, setClaimAwaitingConfirmation] = useState(false)
  // const [pendingTxHash, setPendingTxHash] = useState('')

  // const { id, rewardTokens, active, name } = staking

  // const veDEUSContract = useVeDeusContract()
  // const addTransaction = useTransactionAdder()
  // const showTransactionPending = useHasPendingVest(pendingTxHash, true)
  // const veDistContract = useVeDistContract()

  // subtracting 10 seconds to mitigate this from being true on page load
  // const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd])

  // const onClaim = useCallback(async () => {
  //   try {
  //     if (!veDistContract) return
  //     setClaimAwaitingConfirmation(true)
  //     const response = await veDistContract.claim(nftId)
  //     addTransaction(response, { summary: `Claim #${nftId} reward`, vest: { hash: response.hash } })
  //     setPendingTxHash(response.hash)
  //     setClaimAwaitingConfirmation(false)
  //   } catch (err) {
  //     console.log(DefaultHandlerError(err))
  //     setClaimAwaitingConfirmation(false)
  //     setPendingTxHash('')
  //     if (err?.code === 4001) {
  //       toast.error('Transaction rejected.')
  //     } else toast.error(DefaultHandlerError(err))
  //   }
  // }, [veDistContract, nftId, addTransaction])

  // const onWithdraw = useCallback(async () => {
  //   try {
  //     if (!veDEUSContract || !lockHasEnded) return
  //     setAwaitingConfirmation(true)
  //     const response = await veDEUSContract.withdraw(nftId)
  //     addTransaction(response, { summary: `Withdraw #${nftId} from Vesting`, vest: { hash: response.hash } })
  //     setPendingTxHash(response.hash)
  //     setAwaitingConfirmation(false)
  //   } catch (err) {
  //     console.error(err)
  //     setAwaitingConfirmation(false)
  //     setPendingTxHash('')
  //   }
  // }, [veDEUSContract, lockHasEnded, nftId, addTransaction])

  // function getExpirationCell() {
  //   if (!lockHasEnded)
  //     return (
  //       <>
  //         <Name>Expiration</Name>
  //         <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
  //         {/* <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription> */}
  //       </>
  //     )
  //   return (
  //     <ExpirationPassed>
  //       <Name>Expired in</Name>
  //       <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
  //     </ExpirationPassed>
  //   )
  // }

  // function getClaimWithdrawCell() {
  //   if (awaitingConfirmation || showTransactionPending) {
  //     return (
  //       <TopBorderWrap>
  //         <TopBorder>
  //           <PrimaryButtonWide transparentBG>
  //             <ButtonText gradientText>
  //               {awaitingConfirmation ? 'Confirming' : 'Withdrawing'} <DotFlashing />
  //             </ButtonText>
  //           </PrimaryButtonWide>
  //         </TopBorder>
  //       </TopBorderWrap>
  //     )
  //   } else if (lockHasEnded) {
  //     return (
  //       <TopBorderWrap>
  //         <TopBorder>
  //           <PrimaryButtonWide transparentBG onClick={onWithdraw}>
  //             <ButtonText gradientText>Withdraw</ButtonText>
  //           </PrimaryButtonWide>
  //         </TopBorder>
  //       </TopBorderWrap>
  //     )
  //   } else if (reward) {
  //     if (ClaimAwaitingConfirmation || showTransactionPending) {
  //       return (
  //         <PrimaryButtonWide>
  //           <ButtonText>
  //             {ClaimAwaitingConfirmation ? 'Confirming' : 'Claiming'} <DotFlashing />
  //           </ButtonText>
  //         </PrimaryButtonWide>
  //       )
  //     }
  //     return (
  //       <PrimaryButtonWide style={{ margin: '0 auto' }} onClick={onClaim}>
  //         <ButtonText>Claim {formatAmount(reward, 3)}</ButtonText>
  //       </PrimaryButtonWide>
  //     )
  //   }
  //   return null
  // }

  // function getTableRowMobile() {
  //   return (
  //     <MobileWrapper>
  //       <FirstRow>
  //         <RowCenter>
  //           <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
  //           <NFTWrap>
  //             <CellAmount>veDEUS #{nftId}</CellAmount>
  //           </NFTWrap>
  //         </RowCenter>

  //         <RowCenter style={{ padding: '5px 2px' }}>{getClaimWithdrawCell()}</RowCenter>

  //         <RowCenter style={{ padding: '5px 2px' }}>
  //           <PrimaryButtonWide whiteBorder onClick={() => toggleLockManager(nftId)}>
  //             <ButtonText>Update Lock</ButtonText>
  //           </PrimaryButtonWide>
  //         </RowCenter>
  //       </FirstRow>

  //       <MobileCell>
  //         <Name>Vest Amount</Name>
  //         <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
  //       </MobileCell>

  //       <MobileCell>
  //         <Name>Vest Value</Name>
  //         <Value>{formatAmount(parseFloat(veDEUSAmount), 6)} veDEUS</Value>
  //       </MobileCell>

  //       <MobileCell>{getExpirationCell()}</MobileCell>
  //     </MobileWrapper>
  //   )
  // }

  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      <TableRowContent staking={staking} />
    </ZebraStripesRow>
  )
}
