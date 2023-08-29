import React, { useEffect, useState } from 'react'

import { Container as MainContainer } from 'components/App/StableCoin'
import { ColumnCenter } from 'components/Column'
import ImageWithFallback from 'components/ImageWithFallback'
import styled from 'styled-components'
import ThenaLogo from '/public/static/images/pages/airdrop/logo.svg'
import { InputField } from 'components/Input'
import { RowBetween } from 'components/Row'
import { BaseButton } from 'components/Button'

import ThenaAirdrop from 'constants/files/5vDEUSthreshold_uThenaAirdrop.json'
import { AddressZero } from '@ethersproject/constants'
import { isAddress } from 'utils/address'
import { useWeb3React } from '@web3-react/core'

const Container = styled(MainContainer)`
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &:before {
    position: absolute;
    width: 720px;
    height: 510px;
    content: '';
    background: linear-gradient(90deg, #0badf4 0%, #30efe4 53.12%, #ff9af5 99.99%);
    opacity: 0.1;
    filter: blur(120px);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`
const FormContainer = styled(ColumnCenter)`
  width: 720px;
  height: 510px;
  /* background-color: #eee; */
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 400px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 340px;
  `}
`
const FormHeader = styled.h2`
  font-weight: 500;
  font-size: 2rem;
  color: ${({ theme }) => theme.text1};
  margin-top: 2px;
  font-family: 'Space Grotesk';
`
const WalletAddressInputContainer = styled(RowBetween)`
  margin-block: 34px;
  min-height: 60px;
  padding: 8px;
  background-color: #101010;
  border-radius: 12px;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 45px;
    height: 45px;
  `}
`
const Button = styled(BaseButton)`
  height: 100%;
  background-image: linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  border-radius: 8px;
  width: 100px;
  font-size: 1rem;
  font-weight: 600;
  &:hover {
    outline-offset: 2px;
    outline: 2px #0badf4 solid;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem !important;
  `}
`
const Input = styled(InputField)`
  font-size: 1rem;
  font-family: 'Noto Sans Mono';
  color: #777a7e;
  &::placeholder {
    color: #777a7e;
    font-size: 1rem;
    font-family: 'Noto Sans Mono';
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem !important;
  `}
`

enum RESULT {
  ELIGIBLE = 'ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
}
const Notification = styled.p<{ type: RESULT }>`
  background: ${({ type }) =>
    type === RESULT.ELIGIBLE ? 'linear-gradient(90deg, #0BADF4 0%, #30EFE4 93.4%)' : '#F367E2'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`
const NotificationContainer = styled.p`
  text-align: center;
  font-size: 2rem;
  font-weight: medium;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1rem;
    margin-top: -15px;
  `}
`
type TNotification = Record<'content' | 'emoji', string>

const Index = () => {
  const { account } = useWeb3React()
  const [result, setResult] = useState<RESULT | undefined>(undefined)
  const [walletAddress, setWalletAddress] = useState<string>('')

  const eligibleContent: TNotification = { content: 'Eligible for Thena Airdrop', emoji: ' 🥳' }
  const notEligibleContent: TNotification = { content: 'Not eligible for Thena Airdrop', emoji: ' 😖' }

  useEffect(() => {
    if (account) {
      setWalletAddress(account)
      setEligibility(account)
    }
  }, [account])

  useEffect(() => {
    if (!isAddress(walletAddress) || walletAddress === AddressZero) {
      setResult(undefined)
    }
  }, [walletAddress])

  function setEligibility(walletAddress: string) {
    if (isAddress(walletAddress) && walletAddress !== AddressZero) {
      for (let i = 0; i < ThenaAirdrop.length; i++) {
        if (ThenaAirdrop[i].address.toLowerCase() === walletAddress.toLowerCase()) {
          setResult(RESULT.ELIGIBLE)
          return
        }
      }
      setResult(RESULT.NOT_ELIGIBLE)
    } else {
      setResult(undefined)
    }
  }

  return (
    <Container>
      <FormContainer>
        <ImageWithFallback alt="Thena" width={164} height={34} src={ThenaLogo} />
        <FormHeader>Airdrop</FormHeader>
        <WalletAddressInputContainer>
          <Input
            value={walletAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(event.target.value)}
            placeholder="Enter wallet address"
          />
          <Button
            onClick={() => {
              setEligibility(walletAddress)
            }}
          >
            Check
          </Button>
        </WalletAddressInputContainer>
        {result === RESULT.ELIGIBLE ? (
          <NotificationContainer>
            <Notification type={RESULT.ELIGIBLE}>{eligibleContent.content}</Notification>
            {eligibleContent.emoji}
          </NotificationContainer>
        ) : result === RESULT.NOT_ELIGIBLE ? (
          <NotificationContainer>
            <Notification type={RESULT.NOT_ELIGIBLE}>{notEligibleContent.content}</Notification>
            {notEligibleContent.emoji}
          </NotificationContainer>
        ) : null}
      </FormContainer>
    </Container>
  )
}

export default Index
