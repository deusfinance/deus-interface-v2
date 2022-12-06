import styled from 'styled-components'

import CLQDR_LOGO from '/public/static/images/tokens/clqdr.svg'

import { ItemWrapper, Item } from '.'
import Dropdown from 'components/App/CLqdr/Dropdown'

const XLQDR = styled.span`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-decoration-line: underline;
  background: ${({ theme }) => theme.lqdrColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const LQDRText = styled.p`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-indent: -15px;
  width: 100%;
`

const ClqdrItem = styled(Item)`
  height: unset;
  flex-direction: column;
`

function getCLqdrData(): JSX.Element {
  return (
    <ItemWrapper>
      <ClqdrItem>
        <LQDRText>
          cLQDR is a wrapped token derivative built on top of <XLQDR>xLQDR</XLQDR> that has several benefits. cLQDR:
        </LQDRText>
        <LQDRText>1.Allows users to sell their position in secondary markets.</LQDRText>
        <LQDRText>
          2.Compounds all the rewards (cLQDR increases vs. LQDR overtime). This increases long-term returns and makes
          cLQDR easier to integrate with borrow markets, LPs, and other protocols. This also simplifies holding because
          users {`don't`} need to claim rewards, since rewards are automatically compounded into the {`holder's`}
          position.
        </LQDRText>
        <LQDRText>
          3.Holders profit from the rewards and the bribes that xLQDR holders receive, and also from the performance
          fees collected through strategies.
        </LQDRText>
        <LQDRText>
          4.Creates constant buy pressure for LQDR and perpetually locks a large portion of {`LQDR's`} supply.
        </LQDRText>
        <LQDRText>
          5.Allows users to leverage their cLQDR position to borrow our overcollateralized stablecoin, MOR. Holders can
          then use that MOR to earn more yield.
        </LQDRText>
      </ClqdrItem>
    </ItemWrapper>
  )
}

export default function DataDropdown() {
  return <Dropdown content={getCLqdrData()} logo={CLQDR_LOGO} text={'What is cLQDR?'} />
}
