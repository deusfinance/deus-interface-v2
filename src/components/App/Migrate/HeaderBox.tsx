import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { ToolTip } from 'components/ToolTip'
import { RowCenter } from 'components/Row'
import { Info } from 'components/Icons'

import SymmLogo from '/public/static/images/tokens/symm.svg'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'
import { useGetEarlyMigrationDeadline } from 'hooks/useMigratePage'
import { getRemainingTime } from 'utils/time'
import { autoRefresh } from 'utils/retry'
import useWeb3React from 'hooks/useWeb3'
import { DeusText } from '../Stake/RewardBox'

const TopWrap = styled.div`
  font-family: 'Inter';
  position: relative;
  width: clamp(250px, 90%, 1168px);
  margin: 20px auto;
  min-height: 180px;
  background: ${({ theme }) => theme.bg0};
  padding: 20px;
  padding-top: 25px;
  padding-bottom: 50px;
  border-radius: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 20px;
  `};
`
const MainTitleSpan = styled.div`
  color: #d4fdf9;
  font-size: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 11px;
  `};
`
const SubTitleSpan = styled.div`
  color: #ebebec;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  padding-top: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 8px;
  `};
`
const DataBox = styled.div`
  display: flex;
  padding-top: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: block;
    padding-bottom: 20px;
  `};
`
const StickyTopWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 0px 0px 12px 12px;
  background: rgba(29, 40, 45, 0.3);
  height: 35px;
`
export const NoWrapSpan = styled.span`
  white-space: pre;
`
const TitleSpan = styled(NoWrapSpan)`
  color: #b6b6c7;
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 11px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 10px;
  `};
`
const TimeSpan = styled.span`
  color: #b0e2f1;
  font-size: 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 12px;
  `};
`
const Item = styled.div`
  display: inline-block;
  height: 100%;
  margin-right: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: row wrap;
    margin-right: 0;
    margin-bottom: 12px;
  `};
`
const Name = styled.div<{ underline?: boolean }>`
  color: #bea29c;
  font-size: 12px;
  font-family: Inter;
  text-decoration-line: ${({ underline }) => (underline ? `underline` : 'none')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
`
const ValueBox = styled.div`
  margin-top: 10px;
  color: #d5f1ed;
  font-size: 20px;
  font-family: Inter;
  gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-top: 0;
    margin-left: auto;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
`
const SubValue = styled.div`
  font-size: 10px;
  opacity: 0.7;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 7px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 6px;
  `};
`
const ExtensionSpan = styled.span<{ deusColor?: boolean }>`
  font-size: 13px;
  padding-left: 4px;
  color: ${({ theme }) => theme.symmColor};
  ${({ deusColor }) =>
    deusColor &&
    ` 
    background: -webkit-linear-gradient(0deg, #0badf4 -10.26%, #30efe4 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    padding-left: 2px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
`
const CustomTooltip = styled(ToolTip)`
  font-size: 0.8rem !important;
  color: #bea29c !important;
  border: 1px solid #bea29c !important;
  border-radius: 6px !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.65rem !important;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 0.5rem !important;
  `};
`
const InfoIcon = styled(Info)`
  margin-bottom: -1px;
  margin-left: 2px;
`
const ToolTipWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
`
const SymmText = styled.span`
  color: ${({ theme }) => theme.symmColor};
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function HeaderBox() {
  const { chainId } = useWeb3React()

  const [earlyMigrationDeadline, setEarlyMigrationDeadline] = useState('')
  const earlyMigrationDeadlineTimeStamp = useGetEarlyMigrationDeadline()

  useEffect(() => {
    return autoRefresh(() => {
      const { day, hours, minutes, seconds } = getRemainingTime(Number(earlyMigrationDeadlineTimeStamp))
      setEarlyMigrationDeadline(`${day}d : ${hours}h : ${minutes}m : ${seconds}s`)
    }, 1)
  }, [earlyMigrationDeadlineTimeStamp, chainId])

  const [migrationInfo, setMigrationInfo] = useState<any>(null)
  // const [error, setError] = useState(false)

  const getMigrationData = useCallback(async () => {
    try {
      const res = makeHttpRequest(`https://info.deus.finance/symm/v1/info`)
      return res
    } catch (error) {
      return null
    }
  }, [])

  const handleLoading = async () => {
    const rest = await getMigrationData()
    if (rest?.status === 'error') {
      // setError(true)
      setMigrationInfo(null)
    } else {
      setMigrationInfo(rest)
      // setError(false)
    }
  }

  useEffect(() => {
    handleLoading()
  }, [])

  const totalMigratedData = useMemo(() => {
    const balanced = toBN(migrationInfo?.total_migrated_to_balanced * 1e-18).toFixed(3) ?? 'N/A'
    const deus = toBN(migrationInfo?.total_migrated_to_deus * 1e-18).toFixed(3) ?? 'N/A'
    const symm = toBN(migrationInfo?.total_migrated_to_symm * 1e-18).toFixed(3) ?? 'N/A'

    const totalValue =
      toBN(
        migrationInfo?.total_migrated_to_balanced * 1e-18 +
          migrationInfo?.total_migrated_to_deus * 1e-18 +
          migrationInfo?.total_migrated_to_symm * 1e-18
      ).toFixed(2) ?? 'N/A'

    return {
      balanced,
      deus,
      symm,
      totalValue,
    }
  }, [migrationInfo])

  const TopWrapItems = useMemo(
    () => [
      {
        name: 'Early Migrator Bonus:',
        value: toBN(migrationInfo?.early_migration_bonus).toFixed(2) + '%' ?? 'N/A',
        underline: true,
        logo: true,
        infoLogo: true,
      },
      {
        name: 'Total Migrated:',
        value: totalMigratedData.totalValue,
        tooltip: true,
        extension: 'DEUS',
        deusColor: true,
      },
      {
        name: 'SYMM per DEUS ratio:',
        value:
          toBN(Number(migrationInfo?.unvested_symm_per_deus) + Number(migrationInfo?.vested_symm_per_deus)).toFixed(
            2
          ) ?? 'N/A',
        extension: 'SYMM per DEUS',
        subValue: {
          unvested: toBN(migrationInfo?.unvested_symm_per_deus).toFixed(3) ?? 'N/A',
          vested: toBN(migrationInfo?.vested_symm_per_deus).toFixed(3) ?? 'N/A',
        },
        deusColor: false,
      },
    ],
    [migrationInfo, totalMigratedData]
  )

  return (
    <TopWrap>
      <MainTitleSpan>Deposit your DEUS ecosystem tokens to migrate.</MainTitleSpan>
      <SubTitleSpan>
        Easy migration tab auto-migrates 100% of your DEUS ecosystem wallet balances into selected option. Manual lets
        you customize the amount you want to migrate. bDEI and legacyDEI to DEUS swaps are not instant, more information
        around when you will receive your DEUS tokens will be shared soon.
      </SubTitleSpan>
      <DataBox>
        {TopWrapItems &&
          TopWrapItems.map((item, index) => (
            <Item key={index}>
              <Name underline={item.underline}>
                {item.name}
                {item.infoLogo && <Info size={11} style={{ marginLeft: '3px', marginBottom: '-1px' }} />}
              </Name>
              <ValueBox data-tooltip-id="my-tooltip-multiline" data-for="id">
                <span>{item.value}</span>

                {item.extension && <ExtensionSpan deusColor={item.deusColor}>{item.extension}</ExtensionSpan>}

                {item.tooltip && (
                  <React.Fragment>
                    <a data-tip data-for={'multiline-id'}>
                      <InfoIcon size={12} />
                    </a>
                    <CustomTooltip id="multiline-id" arrowColor={'#bea29c'}>
                      <ToolTipWrap>
                        <span>
                          BALANCED: {totalMigratedData.balanced}
                          <DeusText> DEUS</DeusText>
                        </span>

                        <span>
                          DEUS: {totalMigratedData.deus}
                          <DeusText> DEUS</DeusText>
                        </span>

                        <span>
                          SYMM: {totalMigratedData.symm}
                          <DeusText> DEUS</DeusText>
                        </span>
                      </ToolTipWrap>
                    </CustomTooltip>
                  </React.Fragment>
                )}

                {item.logo && (
                  <span style={{ paddingLeft: '4px' }}>
                    <Image alt="SymmLogo" width={getImageSize()} height={14} src={SymmLogo} />
                  </span>
                )}

                {item.subValue && (
                  <SubValue>
                    ({item.subValue.unvested} <SymmText>UNVESTED</SymmText> / {item.subValue.vested} VESTED)
                  </SubValue>
                )}
              </ValueBox>
            </Item>
          ))}
      </DataBox>
      <StickyTopWrap>
        <RowCenter>
          <TitleSpan>Early Migration Ends in: </TitleSpan>
          <TimeSpan>{earlyMigrationDeadline}</TimeSpan>
        </RowCenter>
      </StickyTopWrap>
    </TopWrap>
  )
}
