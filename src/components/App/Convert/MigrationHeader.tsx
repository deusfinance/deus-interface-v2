import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

const ConnectedChain = styled.div`
  font-family: IBM Plex Mono;
  display: flex;
  align-items: center;
  color: #ebebec;
  padding-bottom: 30px;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px;
    padding-left: 0;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    padding: 5px;
  `};
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function ConvertBoxHeader() {
  return <ConnectedChain>Migrate to DEUS</ConnectedChain>
}
