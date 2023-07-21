import React, { useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { Token } from '@sushiswap/core-sdk'

import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'

import useWeb3React from 'hooks/useWeb3'

import { BaseButton } from 'components/Button'
import TokenBox from './TokenBox'

import { useSignMessage } from 'hooks/useMigrateCallback'
import { makeHttpRequest } from 'utils/http'
import { MigrationSourceTokens } from './CardBox'
import { ChainInfo } from 'constants/chainInfo'
import { toBN } from 'utils/numbers'

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

interface IMigrationInfo {
  user: string
  tokenAddress: string
  amount: number
  timestamp: number
  block: number
  migrationPreference: number
}

export default function MigratedTable() {
  const { account, chainId } = useWeb3React()

  const isLoading = false
  const [type, setType] = useState(MigrationType.DEUS)
  const [token, setToken] = useState<Token | undefined>(undefined)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState(false)
  const [allMigrationData, setAllMigrationData] = useState<any>(undefined)

  const signatureItem = 'signature_' + account?.toString()
  const [signature, setSignature] = useState(localStorage.getItem(signatureItem))
  // const signatureMessage = 'In order to see your migrated amount across all chains, you need to sign the message.'
  const signatureMessage = 'SYMM'

  const {
    state: signCallbackState,
    callback: signCallback,
    error: signCallbackError,
  } = useSignMessage(signatureMessage)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function setLoadedSignature(arg0: string) {
    if (arg0) {
      setSignature(arg0)
      localStorage.setItem(signatureItem, arg0)
    }
  }

  const getAllMigrationData = useCallback(async () => {
    try {
      const res = await makeHttpRequest(`https://info.deus.finance/symm/v1/info/${signature}`)
      return res
    } catch (error) {
      return null
    }
  }, [signature])

  const handleSign = useCallback(async () => {
    console.log('called handleSign')
    console.log(signCallbackState, signCallbackError)
    if (!signCallback) return
    if (signature) return
    try {
      const response = await signCallback()
      setLoadedSignature(response)
    } catch (e) {
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [signCallbackState, signCallbackError, signCallback, signature, setLoadedSignature])

  const handleAllMigration = async () => {
    if (allMigrationData) return
    const rest = await getAllMigrationData()
    if (rest?.status === 'error') {
      setAllMigrationData(null)
    } else if (rest) {
      const values = Object.entries(rest)
      // console.log(rest)
      setAllMigrationData(values)
    }
  }

  useEffect(() => {
    handleSign()
    handleAllMigration()
  }, [])

  return (
    <Wrapper>
      <TableWrapper>
        <tbody>
          {allMigrationData?.length > 0 &&
            allMigrationData.map(([key, values]: [string, []]) =>
              values.map((migrationInfo, index) => (
                <React.Fragment key={index}>
                  <>
                    <DividerContainer />
                    <TableRow
                      migrationInfo={{
                        user: migrationInfo[0],
                        tokenAddress: migrationInfo[1],
                        amount: migrationInfo[2],
                        timestamp: migrationInfo[3],
                        block: migrationInfo[4],
                        migrationPreference: migrationInfo[5],
                      }}
                      chain={+key}
                    />
                  </>
                </React.Fragment>
              ))
            )}
        </tbody>
        {allMigrationData?.length === 0 && (
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
  width: 20%;
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

function TableRow({ migrationInfo, chain }: { migrationInfo: IMigrationInfo; chain: number }) {
  return (
    <ZebraStripesRow>
      <TableRowContent migrationInfo={migrationInfo} chain={chain} />
    </ZebraStripesRow>
  )
}

const TableRowContent = ({ migrationInfo, chain }: { migrationInfo: IMigrationInfo; chain: number }) => {
  // const { chainId, account } = useWeb3React()
  const { tokenAddress, amount: migratedAmount, migrationPreference } = migrationInfo
  const [token, setToken] = useState<Token | undefined>(undefined)

  const handleToken = useCallback(() => {
    for (let i = 0; i < MigrationSourceTokens.length; i++) {
      const token = MigrationSourceTokens[i]
      const selectedToken = token[chain]
      if (selectedToken && selectedToken?.address === tokenAddress) {
        setToken(selectedToken)
      }
    }
  }, [chain, tokenAddress])

  useEffect(() => {
    handleToken()
  }, [])

  return (
    <React.Fragment>
      {token && (
        <TableRowContainer>
          <TableRowContentWrapper
            token={token}
            migratedAmount={migratedAmount}
            migrationPreference={migrationPreference}
          />
        </TableRowContainer>
      )}
    </React.Fragment>
  )
}

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

const InlineRow = styled.div<{ active?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }
  ${({ active, theme }) =>
    active &&
    ` color: ${theme.text1};
      pointer-events: none;
  `};
`
const ChainDiv = styled.div`
  margin-right: auto;
  margin-left: 6px;
  margin-top: 2px;
`

const TableRowContentWrapper = ({
  token,
  migratedAmount,
  migrationPreference,
}: {
  token: Token
  migratedAmount: number
  migrationPreference: number
}) => {
  const chain = token?.chainId
  return (
    <TableContent>
      <TokenContainer>
        <TokenBox token={token} active />
      </TokenContainer>

      <MyBalance>
        <Label>Chain</Label>
        <Value>
          <div>
            <InlineRow active>
              <Image
                src={ChainInfo[chain].logoUrl}
                width={getImageSize() + 'px'}
                height={getImageSize() + 'px'}
                alt={`${ChainInfo[chain].label}-logo`}
              />
              <ChainDiv>{ChainInfo[chain].label}</ChainDiv>
            </InlineRow>
          </div>
        </Value>
      </MyBalance>

      <MyMigratedAmount>
        <Label>My Migrated Amount:</Label>
        <div>
          <Value>
            {toBN(migratedAmount * 1e-18).toString() ?? 'N/A'} {token.symbol}
          </Value>
        </div>
      </MyMigratedAmount>
    </TableContent>
  )
}
