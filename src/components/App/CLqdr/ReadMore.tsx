import { ExternalLink } from 'components/Link'
import { RowBetween } from 'components/Row'
import Image from 'next/image'
import styled from 'styled-components'
import ExternalLinkImage from '/public/static/images/pages/common/down.svg'

const MainWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  background-color: ${({ theme }) => theme.bg2};
  background-image: url('/static/images/pages/clqdr/logo.svg');
  background-repeat: no-repeat;
  background-position: right;
  border-radius: 12px;
  padding: 12px 16px;
`
const RatioWrap = styled.div`
  display: flex;
  white-space: nowrap;
  font-size: 0.75rem;
  width: 100%;
  flex-direction: column;
  span {
    font-size: 16px;
  }
  a {
    font-size: 14px;
    color: ${({ theme }) => theme.text2};
    &:hover {
      color: ${({ theme }) => theme.text2};
      text-decoration: underline;
    }
  }
`
const ReadMore = () => {
  return (
    <MainWrapper>
      <RatioWrap>
        <RowBetween>
          <span>cLQDR</span>
          <ExternalLink href="https://docs.deus.finance/clqdr/what-is-clqdr">
            Read more <Image alt="read more" width={8} height={8} src={ExternalLinkImage} />
          </ExternalLink>
        </RowBetween>
        <p style={{ marginTop: 20 }}>...</p>
      </RatioWrap>
    </MainWrapper>
  )
}
export default ReadMore
