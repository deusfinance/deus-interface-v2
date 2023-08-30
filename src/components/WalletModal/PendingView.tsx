import styled from 'styled-components'
import { Connector } from '@web3-react/types'

import { Loader } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import { ColumnCenter } from 'components/Column'
import { RowCenter, RowStart } from 'components/Row'
import { ThemedText } from 'components/Text'
// import WarningRamses from 'components/Icons/WarningRamses'
// import { LottieLoading } from 'components/Icons'

const PendingSection = styled(RowCenter)`
  flex-flow: column nowrap;
  & > * {
    width: 100%;
  }
`

const LoadingMessage = styled(RowStart)<{
  error?: boolean
}>`
  flex-flow: row nowrap;
  border-radius: 12px;
  margin-bottom: 20px;
  color: ${({ error, theme }) => (error ? theme.red3 : 'inherit')};
  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled(RowStart)`
  flex-flow: column nowrap;
  color: ${({ theme }) => theme.red1};
`

const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
`

const LoaderContainer = styled(RowCenter)`
  width: unset;
  flex-wrap: nowrap;
  margin: 16px 0;
`

const Title = styled.div`
  font-size: 16px;
  margin: 20px 0px 12px 0px;
  color: ${({ theme }) => theme.warning};
`

// const ConnectingText = styled.div`
//   font-size: 16px;
//   color: ${({ theme }) => theme.text0};
// `

const Description = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 100px;
`

const Text = styled.div`
  font-size: 14px;
  padding-top: 18px;
  color: ${({ theme }) => theme.text1};
`

export default function PendingView({
  connector,
  error = false,
  tryActivation,
}: {
  connector: Connector
  error?: boolean
  tryActivation: (connector: Connector) => void
  openOptions: () => void
}) {
  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              {/* <WarningRamses /> */}

              <Title>Error connecting</Title>
              <Description>
                The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
              </Description>
              <PrimaryButton
                // height={'48px'}
                onClick={() => {
                  tryActivation(connector)
                }}
                style={{ marginLeft: 'auto' }}
              >
                Try Again
              </PrimaryButton>
              {/* <ButtonEmpty width="fit-content" padding="0" marginTop={10}>
                <div onClick={openOptions}>
                  <p>Back to wallet selection</p>
                </div>
              </ButtonEmpty> */}
            </ErrorGroup>
          ) : (
            <>
              <ColumnCenter style={{ margin: '0px auto' }}>
                <LoaderContainer style={{ padding: '16px 0px' }}>
                  <Loader size="20" />
                </LoaderContainer>
                <ThemedText.MediumHeader>{/* <LottieLoading width={60} height={100} /> */}</ThemedText.MediumHeader>
                <ThemedText.MediumHeader>
                  <Text>Confirm this connection in your wallet</Text>
                </ThemedText.MediumHeader>
              </ColumnCenter>
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  )
}
