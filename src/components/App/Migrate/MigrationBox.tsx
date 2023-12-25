import styled from 'styled-components'

import BigNumber from 'bignumber.js'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import { formatBalance, formatNumber } from 'utils/numbers'
import { MigrationType } from './Table'

export const Card = styled.div<{ active?: boolean; selected?: boolean }>`
  border-radius: 20px;
  padding: 16px;
  width: 100%;
  background: ${({ active, selected }) => (active ? '#1C2A2E' : selected ? '#373737' : '#1a1a1a')};
  border: ${({ theme, active, selected }) =>
    active ? '2px solid #F9F9F9' : selected ? `2px solid ${theme.gray}` : `2px solid ${theme.gray3}`};
  cursor: ${({ active, selected }) => (!active && !selected ? 'pointer' : 'default')};
`
export const InnerRow = styled.div`
  display: flex;
  flex-direction: row nowrap;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
`
export const CardTitle = styled.div`
  color: #fff;
  font-size: 12px;
  padding-bottom: 8px;
`
export const ImageWrapper = styled.div`
  background-color: black;
  padding: 2px;
  border: 1px solid ${({ theme }) => theme.border1};
  margin-left: 8px;
  border-radius: 100%;
`
export const AmountBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export function getImageSize() {
  return isMobile ? 20 : 20
}

export default function MigrationBox({
  migrationPreference,
  migratedToDEUS,
  // migratedToSYMM,
  calculatedSymmPerDeus,
}: {
  migrationPreference: MigrationType
  migratedToDEUS: BigNumber
  // migratedToSYMM: BigNumber
  calculatedSymmPerDeus: BigNumber
}) {
  const SYMM_logo = useCurrencyLogo('SYMM')
  const DEUS_logo = useCurrencyLogo('DEUS')

  function getTitle() {
    const text = 'Migrated to '
    if (migrationPreference === MigrationType.BALANCED) return text + 'SYMMxDEUS'
    else if (migrationPreference === MigrationType.DEUS) return text + 'DEUS'
    else if (migrationPreference === MigrationType.SYMM) return text + 'SYMM'
  }

  return (
    <Card active>
      <CardTitle>Current Plan</CardTitle>
      <InnerRow>
        <span>{getTitle()}</span>
        <div>
          {migrationPreference !== MigrationType.DEUS && (
            <AmountBox>
              <span>{formatNumber(formatBalance(calculatedSymmPerDeus.toString(), 3))}</span>
              <ImageWrapper>
                <ImageWithFallback
                  src={SYMM_logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={'SYMM Logo'}
                  round
                />
              </ImageWrapper>
            </AmountBox>
          )}
          {migrationPreference !== MigrationType.SYMM && (
            <AmountBox>
              <span>{formatNumber(formatBalance(migratedToDEUS.toString(), 3))}</span>
              <ImageWrapper>
                <ImageWithFallback
                  src={DEUS_logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={'DEUS Logo'}
                  round
                />
              </ImageWrapper>
            </AmountBox>
          )}
        </div>
      </InnerRow>
    </Card>
  )
}
