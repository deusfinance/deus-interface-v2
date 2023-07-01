import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { CurrencyAmount, Token } from '@sushiswap/core-sdk'

import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'
import ExternalIcon from '/public/static/images/pages/stake/down.svg'
import Solidly from '/public/static/images/pages/stake/solidly.svg'

import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import TokenBox from 'components/App/Migration/TokenBox'
import { ExternalLink } from 'components/Link'
import { Divider, HStack, VStack } from '../Staking/common/Layout'
import { BaseButton, PrimaryButtonWide } from 'components/Button'
import { useWalletModalToggle } from 'state/application/hooks'
import { MigrationTypes, MigrationVersion } from 'constants/migrationOptions'
import { useTokenBalance } from 'state/wallet/hooks'

import SymmLogo from '/public/static/images/tokens/symm.svg'
import DeusLogo from '/public/static/images/tokens/deus.svg'
import { isMobile } from 'react-device-detect'

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
  /* text-align: center; */
  vertical-align: middle;
  padding: 5px;
  padding-left: 16px;
  height: 75px;
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

const MigrationButton = styled(BaseButton)<{ deus?: boolean }>`
  /* width: 152px; */
  height: 40px;
  border-radius: 8px;
  background: #141414;
  color: ${({ theme, deus }) => (deus ? '#01F5E4' : theme.symmColor)};
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 2px;

  &:hover {
    background: #242424;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 12px;
  `}
`

export default function Table({ MigrationOptions }: { MigrationOptions: MigrationTypes[] }) {
  const { account } = useWeb3React()

  const isLoading = false

  return (
    <Wrapper>
      <TableWrapper isEmpty={MigrationOptions.length === 0}>
        <tbody>
          {MigrationOptions.length > 0 &&
            MigrationOptions.map((migrationOption: MigrationTypes, index) => (
              <>
                <Divider backgroundColor="#101116" />
                <TableRow key={index} index={index} migrationOption={migrationOption} />
              </>
            ))}
        </tbody>
        {MigrationOptions.length === 0 && (
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
        {type === BUTTON_TYPE.MINI ? titles.mini : 'Farm on '}
        <HStack style={{ marginLeft: '1ch', alignItems: 'flex-end' }}>
          <Image
            width={type === BUTTON_TYPE.SOLIDLY ? 64 : 0}
            height={type === BUTTON_TYPE.SOLIDLY ? 24 : 0}
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
  token: Token
  version: MigrationVersion
  currencyBalance: CurrencyAmount<Token> | undefined
  active: MigrationTypes['active']
  handleClick: () => void
  chainIdError: boolean
  rpcChangerCallback: (chainId: any) => void
  account: string | null | undefined
  toggleWalletModal: () => void
}

const TableRowMiniContent = ({
  token,
  version,
  currencyBalance,
  active,
  handleClick,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  return <></>
}

const TableRowLargeContent = ({
  token,
  version,
  currencyBalance,
  active,
  handleClick,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  const [currencyBalanceDisplay] = useMemo(() => {
    return [currencyBalance?.toSignificant(4)]
  }, [currencyBalance])

  return (
    <>
      <Cell width={'25%'}>
        <TokenBox token={token} active={active} />
      </Cell>

      <Cell width={'20%'}>
        <Value> {currencyBalanceDisplay ? currencyBalanceDisplay : '0.00'} </Value>
      </Cell>

      <Cell width={'25%'}>
        <Value>
          {'N/A ->'}
          <span style={{ paddingLeft: '6px' }}>
            <Image alt="SymmLogo" width={17} height={12} src={SymmLogo} />
          </span>
        </Value>
        {version === MigrationVersion.DUAL && (
          <Value>
            {'N/A ->'}
            <span style={{ paddingLeft: '6px' }}>
              <Image alt="DeusLogo" width={16} height={16} src={DeusLogo} />
            </span>
          </Value>
        )}
      </Cell>

      <Cell width={'15%'}>
        {account && !chainIdError && version === MigrationVersion.DUAL && (
          <MigrationButton deus>Migrate to DEUS</MigrationButton>
        )}
      </Cell>

      <Cell width={'15%'}>
        {!account ? (
          <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
            <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
          </PrimaryButtonWide>
        ) : chainIdError ? (
          <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
            <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
          </PrimaryButtonWide>
        ) : (
          <MigrationButton>Migrate to SYMM</MigrationButton>
        )}
      </Cell>
    </>
  )
}

const TableRowContent = ({ migrationOption }: { migrationOption: MigrationTypes }) => {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { token, version, active } = migrationOption
  const router = useRouter()

  const supportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.FANTOM || chainId === SupportedChainId.ARBITRUM
  }, [chainId, account])

  const handleClick = useCallback(() => {
    router.push(`/symm-migrate`)
  }, [router])

  const currencyBalance = useTokenBalance(account ?? undefined, token ?? undefined)

  return (
    <>
      <TableRowLargeContainer>
        <TableRowLargeContent
          active={active}
          handleClick={handleClick}
          token={token}
          currencyBalance={currencyBalance}
          version={version}
          chainIdError={!supportedChainId}
          rpcChangerCallback={rpcChangerCallback}
          account={account}
          toggleWalletModal={toggleWalletModal}
        />
      </TableRowLargeContainer>
      <TableRowMiniContent
        active={active}
        handleClick={handleClick}
        token={token}
        currencyBalance={currencyBalance}
        version={version}
        chainIdError={!supportedChainId}
        rpcChangerCallback={rpcChangerCallback}
        account={account}
        toggleWalletModal={toggleWalletModal}
      />
    </>
  )
}

function TableRow({ migrationOption, index }: { migrationOption: MigrationTypes; index: number }) {
  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      <TableRowContent migrationOption={migrationOption} />
    </ZebraStripesRow>
  )
}
