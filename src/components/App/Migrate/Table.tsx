import React, { useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { CurrencyAmount, Token } from '@sushiswap/core-sdk'

import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'
import SymmLogo from '/public/static/images/tokens/symm.svg'
import DeusLogo from '/public/static/images/tokens/deus.svg'

import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { MigrationTypes, MigrationVersion } from 'constants/migrationOptions'

import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import { BaseButton, PrimaryButtonWide } from 'components/Button'
import { useWalletModalToggle } from 'state/application/hooks'
import TokenBox from './TokenBox'

import { useTokenBalance } from 'state/wallet/hooks'
import ManualReviewModal from './ManualReviewModal'
import { DEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'
import { useGetUserMigrations } from 'hooks/useMigratePage'
import BigNumber from 'bignumber.js'
import { formatBalance, toBN } from 'utils/numbers'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useMigrationData } from 'context/Migration'

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
export const Cell = styled.td<{ justify?: boolean }>`
  align-items: center;
  vertical-align: middle;
  padding: 5px;
  padding-left: 16px;
  height: 75px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: fit-content;
`};
`
const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
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
const DividerContainer = styled.div`
  background-color: #101116;
  width: 100%;
  height: 2px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    background-color:#141414;
  `}
`

export default function Table({ MigrationOptions }: { MigrationOptions: MigrationTypes[] }) {
  const { account, chainId } = useWeb3React()

  const isLoading = false
  const [type, setType] = useState(MigrationType.DEUS)
  const [token, setToken] = useState<Token | undefined>(undefined)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState(false)

  const migrationInfo = useMigrationData()

  // TODO: this is a repeated code, better to put in one in place
  const balancedRatio = useMemo(() => {
    const symm = toBN(+migrationInfo?.total_migrated_to_symm * 1e-18)
    const total = toBN(800000).minus(symm)
    const ratio = total.div(800000)
    return ratio.toString()
  }, [migrationInfo])

  const { userMigrations } = useGetUserMigrations(Number(balancedRatio), account)

  function handleClickModal(type: MigrationType, inputToken: Token) {
    setType(type)
    setToken(inputToken)
    toggleReviewModal(true)
  }

  return (
    <>
      <Wrapper>
        <TableWrapper isEmpty={MigrationOptions.length === 0}>
          <tbody>
            {MigrationOptions.length > 0 &&
              MigrationOptions.map((migrationOption: MigrationTypes, index) => (
                <React.Fragment key={index}>
                  {chainId && migrationOption.supportedChains.includes(chainId) && (
                    <>
                      <DividerContainer />
                      <TableRow
                        key={index}
                        index={index}
                        migrationOption={migrationOption}
                        handleClickModal={handleClickModal}
                        userMigrations={userMigrations}
                      />
                    </>
                  )}
                </React.Fragment>
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
      <ManualReviewModal
        title={'Migrate to '}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputToken={token}
        outputToken={type === MigrationType.DEUS ? DEUS_TOKEN : SYMM_TOKEN}
        buttonText={awaitingSwapConfirmation ? 'Migrating ' : 'Migrate to '}
        awaiting={awaitingSwapConfirmation}
      />
    </>
  )
}

const TableRowContainer = styled.div`
  width: 100%;
  display: table;
`
const TableContent = styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:100%;
    display:flex;
    flex-direction:column;
    background:${({ theme }) => theme.bg2};
    padding-inline:12px;
  `};
`
const MyBalance = styled(Cell)`
  width: 20%;
  & > div {
    height: 100%;
    display: flex;
    align-items: center;
    margin-top: 0px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:100%;
    display:flex;
    justify-content:space-between;
  `};
`
const Label = styled.p`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:inline-block;
    font-size:12px;
    color:#7F8082;
  `};
`
const MyMigratedAmount = styled(Cell)`
  width: 25%;
  margin-block: auto;
  height: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:100%;
    display:flex;
    justify-content:space-between;
    &>div{
      column-gap:12px;
      display:flex;
      align-items:center;
      &>div{
        color:#82828C;
      }
    }
  `};
`
const MigrationButtonCell = styled(Cell)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    justify-content: space-between;
    column-gap: 8px;
    padding-left: 5px;
    padding-right: 0px;
    &>td{
      &:last-child{padding-right:0px}
      width:100%;
    }
  `};
`
const LargeButtonCellContainer = styled(Cell)`
  width: 15%;
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`
const TokenContainer = styled(Cell)`
  width: 25%;
  & > div {
    height: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    justify-content: space-between;
  `};
`
export enum MigrationType {
  BALANCED,
  DEUS,
  SYMM,
}

const TableRowContentWrapper = ({
  token,
  version,
  currencyBalance,
  active,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
  handleClickModal,
  userMigrations,
}: {
  token: Token
  version: MigrationVersion
  currencyBalance: CurrencyAmount<Token> | undefined
  active: MigrationTypes['active']
  chainIdError: boolean
  rpcChangerCallback: (chainId: any) => void
  account: string | null | undefined
  toggleWalletModal: () => void
  handleClickModal: (migrationType: MigrationType, inputToken: Token) => void
  userMigrations: Map<string, BigNumber>
}) => {
  const [currencyBalanceDisplay] = useMemo(() => {
    return [currencyBalance?.toSignificant(4)]
  }, [currencyBalance])

  return (
    <TableContent>
      <TokenContainer>
        <TokenBox token={token} active={active} />
      </TokenContainer>

      <MyBalance>
        <Label>My Balance:</Label>
        <Value> {currencyBalanceDisplay ? currencyBalanceDisplay : '0.00'} </Value>
      </MyBalance>

      <MyMigratedAmount>
        <Label>My Migrated Amount:</Label>
        <div>
          <Value>
            {formatBalance(userMigrations.get(token.address + '_' + '2')?.toString(), 3) ?? '0.00'}
            {formatBalance(userMigrations.get(token.address + '_' + '2')?.toString(), 3) === '' && '0.00'}
            {' ->'}
            <span style={{ paddingLeft: '6px' }}>
              <Image alt="SymmLogo" width={17} height={12} src={SymmLogo} />
            </span>
          </Value>
          <Value>
            {formatBalance(userMigrations.get(token.address + '_' + '1')?.toString(), 3) ?? '0.00'}
            {formatBalance(userMigrations.get(token.address + '_' + '1')?.toString(), 3) === '' && '0.00'}
            {' ->'}
            <span style={{ paddingLeft: '6px' }}>
              <Image alt="DeusLogo" width={16} height={16} src={DeusLogo} />
            </span>
          </Value>
        </div>
      </MyMigratedAmount>

      <MigrationButtonCell>
        <Cell style={{ paddingLeft: 5 }}>
          {account && !chainIdError && version === MigrationVersion.DUAL && (
            <MigrationButton onClick={() => handleClickModal(MigrationType.DEUS, token)} deus>
              Migrate to {DEUS_TOKEN.name}
            </MigrationButton>
          )}
        </Cell>

        <Cell style={{ paddingLeft: 5 }}>
          {!account ? (
            <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
              <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
            </PrimaryButtonWide>
          ) : chainIdError ? (
            <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
              <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
            </PrimaryButtonWide>
          ) : (
            <MigrationButton onClick={() => handleClickModal(MigrationType.SYMM, token)}>
              Migrate to {SYMM_TOKEN.name}
            </MigrationButton>
          )}
        </Cell>
      </MigrationButtonCell>
      <LargeButtonCellContainer>
        {account && !chainIdError && version === MigrationVersion.DUAL && (
          <MigrationButton onClick={() => handleClickModal(MigrationType.DEUS, token)} deus>
            Migrate to {DEUS_TOKEN.name}
          </MigrationButton>
        )}
      </LargeButtonCellContainer>

      <LargeButtonCellContainer>
        {!account ? (
          <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
            <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
          </PrimaryButtonWide>
        ) : chainIdError ? (
          <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
            <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
          </PrimaryButtonWide>
        ) : (
          <MigrationButton onClick={() => handleClickModal(MigrationType.SYMM, token)}>
            Migrate to {SYMM_TOKEN.name}
          </MigrationButton>
        )}
      </LargeButtonCellContainer>
    </TableContent>
  )
}

const TableRowContent = ({
  migrationOption,
  handleClickModal,
  userMigrations,
}: {
  migrationOption: MigrationTypes
  handleClickModal: (migrationType: MigrationType, inputToken: Token) => void
  userMigrations: Map<string, BigNumber>
}) => {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { token: tokens, version, active } = migrationOption

  const token = chainId ? tokens[chainId] : undefined
  const currencyBalance = useTokenBalance(account ?? undefined, token ?? undefined)
  const chainIdError = !useSupportedChainId()

  return (
    <React.Fragment>
      {token && (
        <TableRowContainer>
          <TableRowContentWrapper
            active={active}
            token={token}
            currencyBalance={currencyBalance}
            version={version}
            chainIdError={chainIdError}
            rpcChangerCallback={rpcChangerCallback}
            account={account}
            toggleWalletModal={toggleWalletModal}
            handleClickModal={handleClickModal}
            userMigrations={userMigrations}
          />
        </TableRowContainer>
      )}
    </React.Fragment>
  )
}

function TableRow({
  migrationOption,
  index,
  handleClickModal,
  userMigrations,
}: {
  migrationOption: MigrationTypes
  index: number
  handleClickModal: (migrationType: MigrationType, inputToken: Token) => void
  userMigrations: Map<string, BigNumber>
}) {
  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      <TableRowContent
        userMigrations={userMigrations}
        handleClickModal={handleClickModal}
        migrationOption={migrationOption}
      />
    </ZebraStripesRow>
  )
}
