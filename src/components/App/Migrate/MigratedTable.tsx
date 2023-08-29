import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { Token } from '@sushiswap/core-sdk'

import { useWeb3React } from '@web3-react/core'
import TokenBox from './TokenBox'
import { makeHttpRequest } from 'utils/http'
import { ChainInfo } from 'constants/chainInfo'
import { BN_ZERO, formatBalance, formatNumber, toBN } from 'utils/numbers'
import BigNumber from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import { DeusText } from '../Stake/RewardBox'
import { CustomTooltip2, InfoIcon, SymmText, ToolTipWrap } from './HeaderBox'
import { InputField } from 'components/Input'
import { BaseButton, PrimaryButtonWide } from 'components/Button'
import { RowBetween } from 'components/Row'
import { ArrowRight } from 'react-feather'
import { useBalancedRatio } from 'hooks/useMigratePage'
import { truncateAddress } from 'utils/account'
import { Tokens } from 'constants/tokens'
import { useMigrationData } from 'context/Migration'
import { useWalletModalToggle } from 'state/application/hooks'
import { MigrationOptions } from 'constants/migrationOptions'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`
const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
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
export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  height: 100%;
  width: 100%;
  display: flex;
`
const DividerContainer = styled.div`
  background-color: #101116;
  width: 100%;
  height: 2px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    background-color:#141414;
  `}
`
const LargeContent = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`
const TableInputWrapper = styled.div`
  border: 1px solid #4b4949e5;
  display: flex;
  padding: 4px 8px;
  border-radius: 8px;
  margin-inline: 20px 13px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: auto;
  & > input {
    height: 32px;
    color: #f1f1f1;
    font-size: 14px;
    font-family: Inter;
  }
`
const CheckButton = styled(BaseButton)`
  background: linear-gradient(90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
  width: 120px;
  position: relative;
  height: 32px;
  border-radius: 8px;
  &:hover {
    background: linear-gradient(-90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
  }
  &:before {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1d282d;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    z-index: 0;
    border-radius: 8px;
  }
  & > span {
    background: linear-gradient(90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
    display: inline-block;
    width: 100%;
    padding-block: 8px;
    border-radius: 8px;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    z-index: 1;
  }
`
const TotalMigrationAmountWrapper = styled(RowBetween)`
  padding-top: 20px;
  padding-bottom: 30px;
  margin-inline: 8px;
  padding-inline: 12px 5px;
  width: auto;
  p {
    font-size: 16px;
    font-weight: 500;
    font-family: Inter;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-size:10px;
    `}
  }
  & > div {
    display: flex;
    width: fit-content;
    align-items: center;
    & > p:first-child {
      background: linear-gradient(90deg, #0badf4, #30efe4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: right;
    }
    & > svg {
      margin-inline: 1ch;
      width: 14px;
      height: 14px;
      ${({ theme }) => theme.mediaWidth.upToSmall`
        width:10px;
        height:10px;
    `}
    }
    & > p:nth-child(3) {
      background: linear-gradient(90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
`
const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg1};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  & > * {
    margin: 8px 8px;
  }
`
const TableTitle = styled(Cell)`
  height: fit-content;
  color: #7f8082;
  font-size: 12px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: start;
  padding-left: 12px;
`
const ButtonText = styled.span`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `}
`
const WalletConnectButton = styled(PrimaryButtonWide)`
  max-width: 160px;
  max-height: 32px;
`
interface IMigrationInfo {
  user: string
  tokenAddress: string
  amount: number
  timestamp: number
  block: number
  migrationPreference: number
}

function getAllUpperRow() {
  return (
    <UpperRow>
      <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <TableTitle width="20%">Token</TableTitle>
        <TableTitle width="20%">Chain</TableTitle>
        <TableTitle width="25%">My Migrated Amount</TableTitle>
        <TableTitle width="35%">Claimable Token</TableTitle>
      </div>
    </UpperRow>
  )
}

export default function MigratedTable() {
  const { account } = useWeb3React()
  const [hasData, setHasData] = useState(false)
  const [checked, setChecked] = useState(false)
  const [tableDataLoading, setTableDataLoading] = useState(false)
  const toggleWalletModal = useWalletModalToggle()
  const [allMigrationData, setAllMigrationData] = useState<any>(undefined)

  const getAllMigrationData = useCallback(async (signature: string) => {
    try {
      const res = await makeHttpRequest(`https://info.deus.finance/symm/v1/user-info?signature=${signature}`)
      return res
    } catch (error) {
      return null
    }
  }, [])

  const handleAllMigration = useCallback(
    async (signature: string) => {
      setTableDataLoading(true)
      const rest = await getAllMigrationData(signature)
      if (rest?.status === 'error') {
        setAllMigrationData(null)
        setHasData(false)
      } else if (rest) {
        const values = Object.entries(rest)
        setAllMigrationData(values)
        setHasData(true)
      }
      setTableDataLoading(false)
    },
    [getAllMigrationData]
  )

  const handleCheck = useCallback(async () => {
    setChecked(true)
    const signature = localStorage.getItem('migrationTermOfServiceSignature' + account?.toString())
    if (signature) handleAllMigration(signature)
  }, [account, handleAllMigration])

  useEffect(() => {
    console.log('account changed')
    setAllMigrationData(null)
    setHasData(false)
    setChecked(false)
  }, [account])

  const isAllMigrationDataEmpty = useMemo(() => {
    if (allMigrationData?.length > 0) {
      for (let index = 0; index < allMigrationData?.length; index++) {
        const element = allMigrationData[index]
        if (element[1].length > 0) return false
      }
      return true
    }
    return true
  }, [allMigrationData])

  const migrationAmount: Array<Array<{ amount: number; token: string; chainId: number; migrationPreference: number }>> =
    useMemo(() => {
      if (allMigrationData?.length > 0) {
        return allMigrationData.map(([key, values]: [string, []]) =>
          values.map((migrationInfo) => ({
            amount: migrationInfo[2],
            token: migrationInfo[1],
            migrationPreference: migrationInfo[5],
            chainId: key,
          }))
        )
      }
      return
    }, [allMigrationData])

  const [totalAmount, setTotalAmount] = useState(0)
  const [totalAmountToDeus, setTotalAmountToDeus] = useState(0)
  const balancedRatio = useBalancedRatio()
  const ratio = Number(balancedRatio)

  useEffect(() => {
    let amount = BN_ZERO
    let amountToDeusOnly = BN_ZERO

    const filteredMigrationAmount = migrationAmount?.filter((migrationAmount) => migrationAmount.length !== 0)
    filteredMigrationAmount?.forEach((item) => {
      item?.forEach((value) => {
        if (value.migrationPreference === MigrationType.BALANCED) {
          const migrationInfoAmount = toBN(value?.amount.toString())
          const migrationInfoAmount_toDeus = migrationInfoAmount.times(ratio)

          switch (value.token) {
            case Tokens['DEUS'][value.chainId].address:
              amount = amount.plus(value.amount)
              amountToDeusOnly = amountToDeusOnly.plus(migrationInfoAmount_toDeus)
              break

            case Tokens['XDEUS'][value.chainId].address:
              amount = amount.plus(value.amount)
              amountToDeusOnly = amountToDeusOnly.plus(migrationInfoAmount_toDeus)
              break

            case Tokens['bDEI_TOKEN'][value.chainId].address:
              amount = amount.plus(value.amount / MigrationOptions[3].divideRatio)
              amountToDeusOnly = amountToDeusOnly.plus(migrationInfoAmount_toDeus.div(MigrationOptions[3].divideRatio))
              break

            case Tokens['LEGACY_DEI'][value.chainId].address:
              amount = amount.plus(value.amount / MigrationOptions[2].divideRatio)
              amountToDeusOnly = amountToDeusOnly.plus(migrationInfoAmount_toDeus.div(MigrationOptions[2].divideRatio))
              break
          }
        } else {
          switch (value.token) {
            case Tokens['DEUS'][value.chainId].address:
              amount = amount.plus(value.amount)
              if (value.migrationPreference === MigrationType.DEUS)
                amountToDeusOnly = amountToDeusOnly.plus(value.amount)
              break

            case Tokens['XDEUS'][value.chainId].address:
              amount = amount.plus(value.amount)
              if (value.migrationPreference === MigrationType.DEUS)
                amountToDeusOnly = amountToDeusOnly.plus(value.amount)
              break

            case Tokens['bDEI_TOKEN'][value.chainId].address:
              amount = amount.plus(value.amount / MigrationOptions[3].divideRatio)
              if (value.migrationPreference === MigrationType.DEUS)
                amountToDeusOnly = amountToDeusOnly.plus(value.amount / MigrationOptions[3].divideRatio)
              break

            case Tokens['LEGACY_DEI'][value.chainId].address:
              amount = amount.plus(value.amount / MigrationOptions[2].divideRatio)
              if (value.migrationPreference === MigrationType.DEUS)
                amountToDeusOnly = amountToDeusOnly.plus(value.amount / MigrationOptions[2].divideRatio)
              break
          }
        }
      })
    })
    setTotalAmount(Number(amount.div(1e18)))
    setTotalAmountToDeus(Number(amountToDeusOnly.div(1e18)))
  }, [migrationAmount, ratio])

  const migrationContextData = useMigrationData()
  const [calculatedSymmPerDeusUnvested, calculatedSymmPerDeusVested, calculatedSymmPerDeusTotal] = useMemo(() => {
    const totalAmountToSymm = totalAmount - totalAmountToDeus
    const calculatedSymmPerDeusUnvested = Number(migrationContextData?.unvested_symm_per_deus) * totalAmountToSymm
    const calculatedSymmPerDeusVested = Number(migrationContextData?.vested_symm_per_deus) * totalAmountToSymm
    const calculatedSymmPerDeusTotal = calculatedSymmPerDeusVested + calculatedSymmPerDeusUnvested
    return [calculatedSymmPerDeusUnvested, calculatedSymmPerDeusVested, calculatedSymmPerDeusTotal]
  }, [
    migrationContextData?.unvested_symm_per_deus,
    migrationContextData?.vested_symm_per_deus,
    totalAmount,
    totalAmountToDeus,
  ])

  return (
    <div style={{ width: '100%' }}>
      <TableInputWrapper>
        <InputField value={account ? truncateAddress(account) : ''} disabled placeholder="Wallet address" />
        {account ? (
          <CheckButton onClick={() => handleCheck()}>
            <span>Check</span>
          </CheckButton>
        ) : (
          <WalletConnectButton transparentBG onClick={toggleWalletModal}>
            <ButtonText>Connect Wallet</ButtonText>
          </WalletConnectButton>
        )}
      </TableInputWrapper>
      {hasData && (
        <TotalMigrationAmountWrapper>
          <p>My Total Migrated Amount to SYMM:</p>
          <div>
            <p>{formatNumber(toBN(totalAmount).toFixed(3).toString())} DEUS</p>
            <ArrowRight />
            <p>{formatNumber(toBN(calculatedSymmPerDeusTotal).toFixed(3).toString())} SYMM</p>
            <React.Fragment>
              <a data-tip data-for={'multiline-id3'}>
                <InfoIcon size={12} />
              </a>
              <CustomTooltip2 id="multiline-id3" arrowColor={'#bea29c'}>
                <ToolTipWrap>
                  <span style={{ color: 'white' }}>
                    <p>
                      <SymmText>UNLOCKED: </SymmText>
                      <span>{formatNumber(toBN(calculatedSymmPerDeusUnvested).toFixed(3).toString())}</span>
                    </p>
                    <p style={{ padding: '5px' }}></p>
                    <p>
                      <span style={{ color: '#bea29c' }}>LOCKED: </span>
                      <span>{formatNumber(toBN(calculatedSymmPerDeusVested).toFixed(3).toString())}</span>
                    </p>
                  </span>
                </ToolTipWrap>
              </CustomTooltip2>
            </React.Fragment>
          </div>
        </TotalMigrationAmountWrapper>
      )}
      {hasData && <LargeContent>{getAllUpperRow()}</LargeContent>}
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
          {isAllMigrationDataEmpty && checked && (
            <tbody>
              <tr>
                <td>
                  {!account ? (
                    <NoResults warning>Wallet is not connected!</NoResults>
                  ) : tableDataLoading ? (
                    <NoResults>Loading...</NoResults>
                  ) : (
                    <NoResults>No Migration found</NoResults>
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </TableWrapper>
      </Wrapper>
    </div>
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
const TokenContainer = styled(Cell)`
  width: 20%;
  & > div {
    height: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
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

const MigrationSourceTokens = [Tokens['DEUS'], Tokens['XDEUS'], Tokens['LEGACY_DEI'], Tokens['bDEI_TOKEN']]

const TableRowContent = ({ migrationInfo, chain }: { migrationInfo: IMigrationInfo; chain: number }) => {
  const { tokenAddress, amount: migratedAmount } = migrationInfo
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const balancedRatio = useBalancedRatio()
  const ratio = Number(balancedRatio)
  let migratedToDEUS = BN_ZERO
  let migratedToSYMM = BN_ZERO
  const migrationInfoAmount = toBN(migrationInfo?.amount.toString()).toString()

  const divideRatio = MigrationOptions.find((option) => option.token[chain]?.name === token?.name)?.divideRatio || 1

  if (migrationInfo.migrationPreference === MigrationType.BALANCED) {
    const amount: BigNumber = toBN(formatUnits(migrationInfoAmount, 18)).times(ratio)
    migratedToDEUS = migratedToDEUS.plus(amount).div(divideRatio)

    const amount2: BigNumber = toBN(formatUnits(migrationInfoAmount, 18)).minus(amount)
    migratedToSYMM = migratedToSYMM.plus(amount2).div(divideRatio)
  } else {
    const amount: BigNumber = toBN(formatUnits(migrationInfoAmount, 18))
    if (migrationInfo.migrationPreference === MigrationType.DEUS) {
      migratedToDEUS = migratedToDEUS.plus(amount).div(divideRatio)
    } else if (migrationInfo.migrationPreference === MigrationType.SYMM) {
      migratedToSYMM = migratedToSYMM.plus(amount).div(divideRatio)
    }
  }

  return (
    <React.Fragment>
      {token && (
        <TableRowContainer>
          <TableRowContentWrapper
            token={token}
            migratedAmount={migratedAmount}
            migratedToDEUS={migratedToDEUS}
            migratedToSYMM={migratedToSYMM}
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
  migratedToDEUS,
  migratedToSYMM,
}: {
  token: Token
  migratedAmount: number
  migratedToDEUS: BigNumber
  migratedToSYMM: BigNumber
}) => {
  const chain = token?.chainId
  const migrationContextData = useMigrationData()

  const calculatedSymmPerDeus = useMemo(
    () =>
      toBN(
        Number(migrationContextData?.unvested_symm_per_deus) + Number(migrationContextData?.vested_symm_per_deus)
      ).multipliedBy(migratedToSYMM),
    [migrationContextData, migratedToSYMM]
  )

  return (
    <TableContent>
      <TokenContainer>
        <TokenBox token={token} active />
      </TokenContainer>

      <MyBalance>
        <Label>Chain:</Label>
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
            {formatNumber(formatBalance(toBN(migratedAmount * 1e-18).toString(), 3)) ?? 'N/A'} {token.symbol}
          </Value>
        </div>
      </MyMigratedAmount>

      <MyMigratedAmount>
        <Label>Claimable Token:</Label>
        <div>
          <Value>
            {migratedToDEUS.toString() !== '0' && (
              <span>
                {formatNumber(formatBalance(migratedToDEUS.toString(), 3))} <DeusText>DEUS</DeusText>
              </span>
            )}
            {migratedToDEUS.toString() !== '0' && migratedToSYMM.toString() !== '0' && <span>, </span>}
            {migratedToSYMM.toString() !== '0' && (
              <span>
                {formatNumber(formatBalance(calculatedSymmPerDeus.toString(), 3))} <SymmText>SYMM</SymmText>
              </span>
            )}
          </Value>
        </div>
      </MyMigratedAmount>
    </TableContent>
  )
}
