import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import { BaseButton, PrimaryButtonWide } from 'components/Button'
import { RowBetween } from 'components/Row'
import ClaimDeus, { DeusText } from './ClaimDeus'
import {
  ButtonWrap,
  InlineRow,
  MyMigratedAmount,
  SmallChainWrap,
  TableContent,
  TableRowContainer,
} from './MigratedTable'
import TokenBox from './TokenBox'
import { Label } from 'recharts'
import { formatBalance, formatNumber, toBN } from 'utils/numbers'
import { Token } from '@sushiswap/core-sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'
import { INFO_URL } from 'constants/misc'
import useWeb3React from 'hooks/useWeb3'
import { truncateAddress } from 'utils/address'
import { InputField } from 'components/Input'
import { useWalletModalToggle } from 'state/application/hooks'
import { Tokens } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { CustomTooltip2, InfoIcon, ToolTipWrap } from './HeaderBox'

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
export const TableInputWrapper = styled.div`
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
export const CheckButton = styled(BaseButton)`
  opacity: 0.5;
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
export const TokenContainer = styled(Cell)`
  width: 38%;
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
export interface IMigrationInfo {
  user: string
  tokenAddress: string
  amount: number
  timestamp: number
  block: number
  migrationPreference: number
  indexInChain: number
}

export function getAllUpperRow() {
  return (
    <UpperRow>
      <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <TableTitle width="35%">Token</TableTitle>
        <TableTitle width="20%">
          Snapshot Amount{' '}
          <React.Fragment>
            <a data-tip data-for={'multiline-id4'}>
              <InfoIcon size={12} style={{ color: 'gray' }} />
            </a>
            <CustomTooltip2 id="multiline-id4" arrowColor={'#bea29c'}>
              <ToolTipWrap>
                <span style={{ color: 'white' }}>
                  The amount, applicable to the Fantom chain, is the lesser of the June 7 snapshot balance or the total
                  you have migrated.
                </span>
              </ToolTipWrap>
            </CustomTooltip2>
          </React.Fragment>
        </TableTitle>
        <TableTitle width="20%">Claimable DEUS</TableTitle>
      </div>
    </UpperRow>
  )
}

export default function ClaimWrap() {
  const { account } = useWeb3React()
  const [claimable_deus_amount, setClaimable_deus_amount] = useState<any>(undefined)
  const [proof, setProof] = useState<any>(undefined)
  const [snapshotData, setSnapshotData] = useState<any>(undefined)
  const [error, setError] = useState(false)

  const toggleWalletModal = useWalletModalToggle()

  const findUserData = useCallback(async () => {
    if (!account) return null
    try {
      const { href: url } = new URL(`/symm/proofs/fantomClaimDeus/${account}/`, INFO_URL)
      const res = makeHttpRequest(url)
      return res
    } catch (error) {
      return null
    }
  }, [account])

  const handleCheck = useCallback(async () => {
    const userData = await findUserData()
    if (userData?.status === 'error') {
      setError(true)
    } else {
      setClaimable_deus_amount(userData['claimable_deus_amount'])
      setProof(userData['proof'])
      if (userData['user_data']) setSnapshotData(userData['user_data'])
      else setSnapshotData(undefined)
      setError(false)
    }
  }, [findUserData])

  useEffect(() => {
    if (account) handleCheck()
  }, [account, handleCheck])

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

      {account && (
        <TotalMigrationAmountWrapper>
          <ClaimDeus claimable_deus_amount={claimable_deus_amount} proof={proof} />
        </TotalMigrationAmountWrapper>
      )}

      {!error && snapshotData && <LargeContent>{getAllUpperRow()}</LargeContent>}

      {!error && snapshotData && snapshotData['fantom'] && snapshotData['arbitrum'] && (
        <Wrapper>
          <TableWrapper>
            <tbody>
              <DividerContainer />
              <ZebraStripesRow>
                <TableRowContainer>
                  <TableRowContentWrapper
                    token={Tokens['bDEI_TOKEN'][SupportedChainId.FANTOM]}
                    amount={(
                      (Number(snapshotData['fantom']['bDEI']['1']) < Number(snapshotData['fantom']?.snapshot?.bDEI)
                        ? Number(snapshotData['fantom']['bDEI']['1'])
                        : Number(snapshotData['fantom']?.snapshot?.bDEI)) +
                      Number(snapshotData['arbitrum']['bDEI']['1'])
                    ).toString()}
                  />
                  <TableRowContentWrapper
                    token={Tokens['LEGACY_DEI'][SupportedChainId.FANTOM]}
                    amount={(
                      (Number(snapshotData['fantom']['legacyDEI']['1']) <
                      Number(snapshotData['fantom']?.snapshot?.legacyDEI)
                        ? Number(snapshotData['fantom']['legacyDEI']['1'])
                        : Number(snapshotData['fantom']?.snapshot?.legacyDEI)) +
                      Number(snapshotData['arbitrum']['legacyDEI']['1'])
                    ).toString()}
                  />
                  <TableRowContentWrapper
                    token={Tokens['DEUS'][SupportedChainId.FANTOM]}
                    amount={(
                      Number(snapshotData['other']?.['DEUS']?.[1]) + Number(snapshotData['other']?.['DEUS']?.[0] * 0.09)
                    ).toString()}
                  />
                  <TableRowContentWrapper
                    token={Tokens['XDEUS'][SupportedChainId.FANTOM]}
                    amount={(
                      Number(snapshotData['other']?.['xDEUS']?.[1]) +
                      Number(snapshotData['other']?.['xDEUS']?.[0] * 0.09)
                    ).toString()}
                  />
                </TableRowContainer>
              </ZebraStripesRow>
            </tbody>
          </TableWrapper>
        </Wrapper>
      )}
    </div>
  )
}

export const getImageSize = () => {
  return isMobile ? 8 : 12
}

const TableRowContentWrapper = ({ token, amount }: { token: Token; amount: string }) => {
  const hasSnapshot = token.symbol !== 'DEUS' && token.symbol !== 'xmultiDEUS'
  return (
    <>
      <TableContent>
        <TokenContainer>
          <Row style={{ marginBottom: '12px' }}>
            <TokenBox token={token} />
          </Row>
          <SmallChainWrap>
            <InlineRow active>
              {hasSnapshot ? (
                <div>
                  <span>Based on the June 7 snapshot on </span>
                  <span style={{ color: ChainInfo[SupportedChainId.FANTOM].color }}>
                    {ChainInfo[SupportedChainId.FANTOM].label}{' '}
                  </span>
                  <Image
                    src={ChainInfo[SupportedChainId.FANTOM].logoUrl}
                    width={getImageSize() + 'px'}
                    height={getImageSize() + 'px'}
                    alt={`${ChainInfo[SupportedChainId.FANTOM].label}-logo`}
                  />{' '}
                  &{' '}
                  <span style={{ color: ChainInfo[SupportedChainId.ARBITRUM].color }}>
                    {ChainInfo[SupportedChainId.ARBITRUM].label}{' '}
                  </span>
                  <Image
                    src={ChainInfo[SupportedChainId.ARBITRUM].logoUrl}
                    width={getImageSize() + 'px'}
                    height={getImageSize() + 'px'}
                    alt={`${ChainInfo[SupportedChainId.ARBITRUM].label}-logo`}
                  />
                </div>
              ) : (
                <div>On All chains</div>
              )}
            </InlineRow>
          </SmallChainWrap>
        </TokenContainer>
        <MyMigratedAmount>
          <Label>Snapshot Amount:</Label>
          {hasSnapshot ? (
            <div>
              <Value>
                {formatNumber(formatBalance(toBN(Number(amount) * 1e-18).toString())) ?? 'N/A'}{' '}
                <span style={{ color: '#8B8B8B' }}>{token.symbol}</span>
              </Value>
            </div>
          ) : (
            <div>-</div>
          )}
        </MyMigratedAmount>
        <MyMigratedAmount>
          <Label>Claimable DEUS:</Label>
          <Value>
            <span>
              {formatNumber(
                formatBalance(
                  toBN(amount)
                    .div(token?.symbol === 'LegacyDEI' ? 217 : token?.symbol === 'bDEI' ? 185 : 1)
                    .times(1e-18)
                    .toString()
                )
              ) ?? 'N/A'}{' '}
              <DeusText>DEUS</DeusText>
            </span>
          </Value>
        </MyMigratedAmount>

        <ButtonWrap></ButtonWrap>
      </TableContent>
    </>
  )
}
