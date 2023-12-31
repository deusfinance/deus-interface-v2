import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { ToolTip } from 'components/ToolTip'
import { Info } from 'components/Icons'

import SymmLogo from '/public/static/images/tokens/symm.svg'
import { formatNumber, toBN } from 'utils/numbers'
import { useGetEarlyMigrationDeadline } from 'hooks/useMigratePage'
import { getRemainingTime } from 'utils/time'
import { autoRefresh } from 'utils/retry'
import useWeb3React from 'hooks/useWeb3'
import { DeusText } from '../Stake/RewardBox'
import { Link as LinkIcon } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import { useMigrationData } from 'context/Migration'
import { RowCenter } from 'components/Row'

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
  max-width: 465px !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.65rem !important;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 0.5rem !important;
  `};
`
export const CustomTooltip2 = styled(ToolTip)`
  font-size: 0.9rem !important;
  color: #bea29c !important;
  border: 1px solid #bea29c !important;
  border-radius: 6px !important;
  max-width: 465px !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.8rem !important;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 0.65rem !important;
  `};
`
export const InfoIcon = styled(Info)`
  margin-bottom: -1px;
  margin-left: 2px;
`
export const ToolTipWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
`
export const SymmText = styled.span`
  color: ${({ theme }) => theme.symmColor};
`
export const BlockSpan = styled.span`
  display: block;
`
const ExternalLinkIcon = styled(LinkIcon)`
  margin-left: 3px;
  path {
    fill: #bea29c;
  }
`
const ExternalLinkIconWhite = styled(LinkIcon)`
  margin-left: 3px;
  path {
    fill: #fff;
  }
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function HeaderBox() {
  const { chainId } = useWeb3React()

  const [earlyMigrationDeadline, setEarlyMigrationDeadline] = useState('')
  const [lateMigrationDeadline, setLateMigrationDeadline] = useState('')
  const [isEarlyMigrationDeadlineFinished, setIsEarlyMigrationDeadlineFinished] = useState(false)
  const [isLateMigrationDeadlineFinished, setIsLateMigrationDeadlineFinished] = useState(false)
  const earlyMigrationDeadlineTimeStamp = useGetEarlyMigrationDeadline()
  const lateMigrationDeadlineTimeStamp = '1704067199'

  useEffect(() => {
    return autoRefresh(() => {
      const { diff, day, hours, minutes, seconds } = getRemainingTime(Number(earlyMigrationDeadlineTimeStamp))
      setIsEarlyMigrationDeadlineFinished(diff === 0)
      setEarlyMigrationDeadline(`${day}d : ${hours}h : ${minutes}m : ${seconds}s`)
    }, 1)
  }, [earlyMigrationDeadlineTimeStamp, chainId])

  useEffect(() => {
    return autoRefresh(() => {
      const { diff, day, hours, seconds } = getRemainingTime(Number(lateMigrationDeadlineTimeStamp))
      setIsLateMigrationDeadlineFinished(diff === 0)
      setLateMigrationDeadline(`${day}d : ${hours}h : ${seconds}s`)
    }, 1)
  }, [lateMigrationDeadlineTimeStamp, chainId])

  const migrationInfo = useMigrationData()

  const totalMigratedData = useMemo(() => {
    const balanced = migrationInfo?.total_migrated_to_balanced
      ? toBN(+migrationInfo?.total_migrated_to_balanced * 1e-18).toFixed(3)
      : 'N/A'
    const deus = migrationInfo?.total_migrated_to_deus
      ? toBN(+migrationInfo?.total_migrated_to_deus * 1e-18).toFixed(3)
      : 'N/A'
    const symm = migrationInfo?.total_migrated_to_symm
      ? toBN(+migrationInfo?.total_migrated_to_symm * 1e-18).toFixed(3)
      : 'N/A'

    const totalValue = migrationInfo?.total_migrated_to_balanced
      ? toBN(
          +migrationInfo?.total_migrated_to_balanced * 1e-18 + +migrationInfo?.total_migrated_to_symm * 1e-18
        ).toFixed(2)
      : 'N/A'

    const actualDeusMigrated = migrationInfo?.total_migrated_to_deus_through_contract
      ? toBN(+migrationInfo?.total_migrated_to_deus_through_contract * 1e-18).toFixed(2)
      : 'N/A'

    return {
      balanced,
      deus,
      symm,
      totalValue,
      actualDeusMigrated,
    }
  }, [migrationInfo])

  const TopWrapItems = useMemo(
    () => [
      {
        name: 'Early Migrator Bonus:',
        value: migrationInfo?.early_migration_bonus
          ? toBN(migrationInfo?.early_migration_bonus).toFixed(2) + '%'
          : 'N/A',
        underline: true,
        logo: true,
        infoLogo: true,
      },
      {
        name: 'Total Migrated:',
        value: formatNumber(totalMigratedData.totalValue),
        tooltip: 'TotalMigrated',
        extension: 'DEUS',
        deusColor: true,
      },
      {
        name: 'SYMM per DEUS ratio:',
        value: migrationInfo?.vested_symm_per_deus
          ? toBN(Number(migrationInfo?.vested_symm_per_deus)).toFixed(2)
          : 'N/A',
        extension: 'SYMM per DEUS',
        tooltip: 'Ratio',
        ratioSubValue: {
          unvested: migrationInfo?.unvested_symm_per_deus
            ? toBN(migrationInfo?.unvested_symm_per_deus).toFixed(3)
            : 'N/A',
          vested: migrationInfo?.vested_symm_per_deus ? toBN(migrationInfo?.vested_symm_per_deus).toFixed(3) : 'N/A',
          unlockedCalc: toBN(Number(migrationInfo?.total_early_migrations_to_symm) * 1e-18)
            .toFixed(2)
            .toString(),
          lockedCalc: toBN(Number(migrationInfo?.total_migrations_to_symm) * 1e-18)
            .toFixed(2)
            .toString(),
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
        <ExternalLink href="https://docs.deus.finance/migration/migration-updates" style={{ textDecoration: 'none' }}>
          Learn more about the latest migration updates <ExternalLinkIconWhite />
        </ExternalLink>
      </SubTitleSpan>
      <DataBox>
        {TopWrapItems &&
          TopWrapItems.map((item, index) => (
            <Item key={index}>
              {item.infoLogo ? (
                <ExternalLink
                  href="https://lafayettetabor.medium.com/early-symm-migration-announcement-144e51baf36f"
                  style={{ textDecoration: 'none' }}
                >
                  <Name underline={item.underline}>
                    {item.name}
                    {item.infoLogo && <ExternalLinkIcon />}
                  </Name>
                </ExternalLink>
              ) : (
                <Name underline={item.underline}>{item.name}</Name>
              )}

              <ValueBox data-tooltip-id="my-tooltip-multiline" data-for="id">
                <span>{item.value}</span>

                {item.extension && <ExtensionSpan deusColor={item.deusColor}>{item.extension}</ExtensionSpan>}

                {item.tooltip === 'TotalMigrated' && (
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
                          DEUS remaining: {totalMigratedData.deus}
                          <DeusText> DEUS</DeusText>
                        </span>

                        <span>
                          Migrated to DEUS: {totalMigratedData.actualDeusMigrated}
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

                {item.tooltip === 'Ratio' && (
                  <React.Fragment>
                    <a data-tip data-for={'multiline-id2'}>
                      <InfoIcon size={12} />
                    </a>
                    <CustomTooltip2 id="multiline-id2" arrowColor={'#bea29c'}>
                      <ToolTipWrap>
                        {item.ratioSubValue && (
                          <span style={{ color: 'white' }}>
                            <p>
                              <SymmText>UNLOCKED:</SymmText>
                              <BlockSpan>
                                68,000,000 / Early_total_DEUS_migrated_to_SYMM ({item.ratioSubValue.unlockedCalc})
                              </BlockSpan>
                              <BlockSpan>= {item.ratioSubValue.unvested}</BlockSpan>
                            </p>
                            <p style={{ padding: '5px' }}></p>
                            <p>
                              <BlockSpan style={{ color: '#bea29c' }}>LOCKED:</BlockSpan>
                              <BlockSpan>
                                680,000,000 / Total_DEUS_migrated_to_SYMM ({item.ratioSubValue.lockedCalc})
                              </BlockSpan>
                              <BlockSpan>= {item.ratioSubValue.vested}</BlockSpan>
                            </p>
                          </span>
                        )}
                      </ToolTipWrap>
                    </CustomTooltip2>
                  </React.Fragment>
                )}

                {item.logo && (
                  <span style={{ paddingLeft: '4px' }}>
                    <Image alt="SymmLogo" width={getImageSize()} height={14} src={SymmLogo} />
                  </span>
                )}

                {item.ratioSubValue && (
                  <SubValue>
                    ({item.ratioSubValue.unvested} <SymmText>UNLOCKED</SymmText> / {item.ratioSubValue.vested} LOCKED)
                  </SubValue>
                )}
              </ValueBox>
            </Item>
          ))}
      </DataBox>
      <StickyTopWrap>
        <RowCenter>
          <TitleSpan>Early Migration{isEarlyMigrationDeadlineFinished ? ': ' : ' Ends in: '}</TitleSpan>
          <TimeSpan>{isEarlyMigrationDeadlineFinished ? 'Closed' : earlyMigrationDeadline}</TimeSpan>

          {isEarlyMigrationDeadlineFinished && !isLateMigrationDeadlineFinished && (
            <>
              <TitleSpan> / Late Migration Ends In: </TitleSpan>
              <TimeSpan style={{ color: 'red', fontWeight: 'bolder' }}> {lateMigrationDeadline} </TimeSpan>
            </>
          )}

          {isEarlyMigrationDeadlineFinished && isLateMigrationDeadlineFinished && (
            <>
              <TitleSpan> / Late Migration: Closed </TitleSpan>
              <TimeSpan>Closed</TimeSpan>
            </>
          )}
        </RowCenter>
      </StickyTopWrap>
    </TopWrap>
  )
}
