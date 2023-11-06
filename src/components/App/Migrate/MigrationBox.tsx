import styled from 'styled-components'

import BigNumber from 'bignumber.js'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import { formatBalance, formatNumber } from 'utils/numbers'
import { IMigrationInfo } from './MigratedTable'
import { MigrationType } from './Table'

const Card = styled.div<{ active?: boolean; selected?: boolean }>`
  border-radius: 20px;
  padding: 16px;
  width: 100%;
  background: ${({ active, selected }) => (active ? '#1C2A2E' : selected ? '#373737' : '#1a1a1a')};
  border: ${({ theme, active, selected }) =>
    active ? '2px solid #F9F9F9' : selected ? `2px solid ${theme.gray}` : `2px solid ${theme.gray3}`};
  cursor: ${({ active, selected }) => (!active && !selected ? 'pointer' : 'default')};
`
const InnerRow = styled.div`
  display: flex;
  flex-direction: row nowrap;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
`
const CardTitle = styled.div`
  color: #fff;
  font-size: 12px;
  padding-bottom: 8px;
`
const ImageWrapper = styled.div`
  background-color: black;
  padding: 2px;
  border: 1px solid ${({ theme }) => theme.border1};
  margin-left: 8px;
  border-radius: 100%;
`
const AmountBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

function getImageSize() {
  return isMobile ? 20 : 20
}

export default function MigrationBox({
  id,
  migrationInfo,
  migratedToDEUS,
  migratedToSYMM,
  calculatedSymmPerDeus,
  active,
  selected,
  setSelected,
}: {
  id: number
  migrationInfo: IMigrationInfo
  migratedToDEUS: BigNumber
  migratedToSYMM: BigNumber
  calculatedSymmPerDeus: BigNumber
  active?: boolean
  selected?: boolean
  setSelected?: (value: any) => void
}) {
  const SYMM_logo = useCurrencyLogo('SYMM')
  const DEUS_logo = useCurrencyLogo('DEUS')
  const migrationPreference = migrationInfo?.migrationPreference

  function getTitle(isActive?: boolean) {
    const text = isActive ? 'Migrated to ' : 'Migrate to '
    if (migrationPreference === MigrationType.BALANCED) return text + 'SYMMxDEUS'
    else if (migrationPreference === MigrationType.DEUS) return text + 'DEUS'
    else if (migrationPreference === MigrationType.SYMM) return text + 'SYMM'
  }

  return (
    <Card active={active} selected={selected} onClick={() => (setSelected ? setSelected(id) : null)}>
      {active && <CardTitle>Current Plan</CardTitle>}
      <InnerRow>
        <span>{getTitle(active)}</span>
        <div>
          {migrationPreference !== MigrationType.DEUS && (
            <AmountBox>
              <span>{formatNumber(formatBalance(migratedToSYMM.toString(), 3))}</span>
              <ImageWrapper>
                <ImageWithFallback
                  src={SYMM_logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`SYMM Logo`}
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
                  alt={`DEUS Logo`}
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
