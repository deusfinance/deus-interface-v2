import styled from 'styled-components'

import { Currency, Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import TokenBox from './TokenBox'

const MainModal = styled(Modal)`
  display: flex;
  font-family: Inter;
  width: 454px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
  `};
`

const FromWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 20px;
  gap: 15px;
  margin-top: 10px;
  margin-bottom: 20px;

  & > * {
    color: #f1f1f1;
    font-size: 14px;

    &:nth-child(1) {
      color: ${({ theme }) => theme.text5};
      font-size: 12px;
    }
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 0px 0px 28px 0px;
  /* width: 424px; */
  max-height: 433px;
  overflow: scroll;
  & > * {
    &:first-child {
      width: unset;
      margin: 0 9px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  /* border-top: 1px solid ${({ theme }) => theme.border1}; */
  padding: 1rem 9px;
  padding-bottom: 0;
`

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bg3};
`

export default function TokensModal({
  isOpen,
  toggleModal,
  selectedToken,
  setToken,
  tokens,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedToken: Token
  setToken: (currency: Currency) => void
  tokens: Token[]
}) {
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={'Select Token to Migrate'} border={false} />

      <Separator />
      <Wrapper>
        <TokenResultWrapper>
          {tokens.map((token, index) => {
            return (
              <TokenBox
                key={index}
                toggleModal={toggleModal}
                currency={token}
                setToken={setToken}
                disabled={token.address === selectedToken.address}
              />
            )
          })}
        </TokenResultWrapper>
      </Wrapper>
    </MainModal>
  )
}
