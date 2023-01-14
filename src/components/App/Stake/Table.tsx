import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { Token } from '@sushiswap/core-sdk'

import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'
import ExternalIcon from '/public/static/images/pages/stake/down.svg'
import Solidly from '/public/static/images/pages/stake/solid.png'

import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import { LiquidityPool, StakingType, StakingVersion } from 'constants/stakingPools'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import { useCustomCoingeckoPrice } from 'hooks/useCoingeckoPrice'
import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { useUserInfo } from 'hooks/useStakingInfo'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import { formatDollarAmount } from 'utils/numbers'

import TokenBox from 'components/App/Stake/TokenBox'
import RewardBox from 'components/App/Stake/RewardBox'
import { ExternalLink } from 'components/Link'
import { Divider, HStack, VStack } from '../Staking/common/Layout'
import { PrimaryButtonWide } from 'components/Button'
import { useWalletModalToggle } from 'state/application/hooks'

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
  background: ${({ theme, active }) => (active ? theme.deusColor : theme.white)};
  padding: 2px;
  border-radius: 12px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.clqdrBlueColor : theme.white)};
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
  SOLIDLY = 'SOLIDLY',
  MINI = 'MINI',
}

const titles = {
  solidly: 'Solidly',
  mini: 'Manage',
}
const CustomButtonWrapper = ({ type, href, isActive }: { type: BUTTON_TYPE; href: string; isActive: boolean }) => {
  return (
    <CustomButton transparentBG href={isActive && href}>
      <ButtonText>
        {type === BUTTON_TYPE.MINI ? titles.mini : 'Farm on ' + titles.solidly}
        <HStack style={{ marginLeft: '1ch', alignItems: 'flex-end' }}>
          <Image
            width={type === BUTTON_TYPE.SOLIDLY ? 24 : 8}
            height={type === BUTTON_TYPE.SOLIDLY ? 24 : 8}
            src={type === BUTTON_TYPE.SOLIDLY ? Solidly : ExternalIcon}
            alt={type === BUTTON_TYPE.SOLIDLY ? titles.solidly : titles.mini}
          />
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
  chain: string
  rewardTokens: StakingType['rewardTokens']
  handleClick: () => void
  apr: number
  tvl: number
  provideLink?: string
  version: StakingVersion
  chainIdError: boolean
  rpcChangerCallback: (chainId: any) => void
  account: string | null | undefined
  toggleWalletModal: () => void
}

const TableRowMiniContent = ({
  tokens,
  name,
  active,
  chain,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  return (
    <MiniStakeContainer>
      <MiniStakeHeaderContainer>
        <TokenBox tokens={tokens} chain={chain} title={name} active={active} />
        <div>
          <MiniTopBorderWrap>
            <TopBorder
              {...(version !== StakingVersion.EXTERNAL && {
                onClick: active && !chainIdError ? handleClick : undefined,
              })}
            >
              {!account ? (
                <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
                  <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
                </PrimaryButtonWide>
              ) : chainIdError ? (
                <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
                  <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
                </PrimaryButtonWide>
              ) : version === StakingVersion.EXTERNAL && provideLink ? (
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
          <Value>{tvl ? formatDollarAmount(tvl) : 'N/A'}</Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>APR</Name>
          <Value> {apr ? apr.toFixed(0) + '%' : 'N/A'} </Value>
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
  chain,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  return (
    <>
      <Cell width={'25%'}>
        <TokenBox tokens={tokens} title={name} chain={chain} active={active} />
      </Cell>

      <Cell width={'10%'}>
        <Name>APR</Name>
        <Value> {apr ? apr.toFixed(0) + '%' : 'N/A'} </Value>
      </Cell>

      <Cell width={'18%'}>
        <Name>TVL</Name>
        <Value>{tvl ? formatDollarAmount(tvl) : 'N/A'}</Value>
      </Cell>

      <Cell style={{ textAlign: 'start' }}>
        <Name>Reward Tokens</Name>
        <RewardBox tokens={rewardTokens} />
      </Cell>

      <Cell width={'20%'} style={{ padding: '5px 10px' }}>
        <TopBorderWrap
          active={!chainIdError}
          {...(version !== StakingVersion.EXTERNAL && { onClick: active && !chainIdError ? handleClick : undefined })}
        >
          <TopBorder>
            {!account ? (
              <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
                <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
              </PrimaryButtonWide>
            ) : chainIdError ? (
              <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
                <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
              </PrimaryButtonWide>
            ) : version === StakingVersion.EXTERNAL && provideLink ? (
              <CustomButtonWrapper
                isActive={active}
                href={provideLink}
                type={provideLink.includes('solidly') ? BUTTON_TYPE.SOLIDLY : BUTTON_TYPE.MINI}
              />
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
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { id, rewardTokens, active, name, provideLink = undefined, version, chain } = staking
  const liquidityPool = LiquidityPool.find((p) => p.id === staking.id) || LiquidityPool[0]
  const tokens = liquidityPool?.tokens

  //const apr = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)

  // generate total APR if pools have secondary APRs
  const primaryApy = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)
  const secondaryApy =
    staking.version === StakingVersion.EXTERNAL ? 0 : staking.secondaryAprHook(liquidityPool, staking)

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

  const supportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.FANTOM
  }, [chainId, account])

  const tvl =
    staking.version === StakingVersion.EXTERNAL ? 0 : isSingleStakingPool ? totalDepositedValue : totalLockedValue

  const router = useRouter()
  const handleClick = useCallback(() => {
    router.push(`/xdeus/stake/manage/${id}`)
  }, [id, router])
  return (
    <>
      <TableRowLargeContainer>
        <TableRowLargeContent
          active={active}
          chain={chain}
          handleClick={handleClick}
          name={name}
          rewardTokens={rewardTokens}
          tokens={tokens}
          apr={apr}
          tvl={tvl}
          provideLink={provideLink}
          version={version}
          chainIdError={!supportedChainId}
          rpcChangerCallback={rpcChangerCallback}
          account={account}
          toggleWalletModal={toggleWalletModal}
        />
      </TableRowLargeContainer>
      <TableRowMiniContent
        active={active}
        chain={chain}
        handleClick={handleClick}
        name={name}
        rewardTokens={rewardTokens}
        tokens={tokens}
        apr={apr}
        tvl={tvl}
        provideLink={provideLink}
        version={version}
        chainIdError={!supportedChainId}
        rpcChangerCallback={rpcChangerCallback}
        account={account}
        toggleWalletModal={toggleWalletModal}
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
