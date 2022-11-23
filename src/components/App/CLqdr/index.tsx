import styled from 'styled-components'

export const Wrapper = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  padding: 12px;
  height: 88px;
  position: relative;
  overflow: hidden;
`

export const BuyButtonWrapper = styled.div`
  padding: 2px;
  width: 452px;
  height: 56px;
  background: ${({ theme }) => theme.lqdrColor};
  border-radius: 12px;
`

export const BuyButton = styled.div`
  width: 100%;
  height: 100%;
  font-family: 'Noto Sans';

  background: ${({ theme }) => theme.bg0};

  border-radius: 12px;

  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;

  text-align: center;
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;

  color: ${({ theme }) => theme.lqdrColor};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `}
`
export const ButtonText = styled.span`
  font-family: 'Noto Sans';
  background: ${({ theme }) => theme.lqdrColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`
