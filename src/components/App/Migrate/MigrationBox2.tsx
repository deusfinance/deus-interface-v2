import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { formatBalance, formatNumber, toBN } from 'utils/numbers'
import { MigrationType } from './Table'
import { AmountBox, Card, ImageWrapper, InnerRow, getImageSize } from './MigrationBox'
import { useBalancedRatio } from 'hooks/useMigratePage'
import { getMigratedAmounts } from './MigratedTable'
import { Token } from '@sushiswap/core-sdk'
import { useMemo } from 'react'
import { useMigrationData } from 'context/Migration'

export default function MigrationBox2({
  id,
  migrationPreference,
  token,
  amount,
  selected,
  setSelected,
}: {
  id: number
  migrationPreference: MigrationType
  token: Token
  amount: number
  selected?: boolean
  setSelected?: (value: any) => void
}) {
  const SYMM_logo = useCurrencyLogo('SYMM')
  const DEUS_logo = useCurrencyLogo('DEUS')

  function getTitle() {
    const text = 'Migrate to '
    if (migrationPreference === MigrationType.BALANCED) return text + 'SYMMxDEUS'
    else if (migrationPreference === MigrationType.DEUS) return text + 'DEUS'
    else if (migrationPreference === MigrationType.SYMM) return text + 'SYMM'
  }

  const balancedRatio = useBalancedRatio()
  const tokenChain = token?.chainId

  const [totalMigratedToDEUS, totalMigratedToSYMM] = getMigratedAmounts(
    balancedRatio,
    tokenChain,
    token,
    amount,
    migrationPreference
  )

  const migrationContextData = useMigrationData()
  const calculatedSymmPerDeus = useMemo(
    () =>
      toBN(
        Number(migrationContextData?.unvested_symm_per_deus) + Number(migrationContextData?.vested_symm_per_deus)
      ).multipliedBy(totalMigratedToSYMM),
    [migrationContextData, totalMigratedToSYMM]
  )

  return (
    <Card selected={selected} onClick={() => (setSelected ? setSelected(id) : null)}>
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
              <span>{formatNumber(formatBalance(totalMigratedToDEUS.toString(), 3))}</span>
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
