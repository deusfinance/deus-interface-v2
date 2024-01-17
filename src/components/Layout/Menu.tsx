import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Z_INDEX } from 'theme'
import DEI_LOGO from '/public/static/images/DeiLogo.svg'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { Link as LinkIcon } from 'components/Icons'
import { NavToggle as NavToggleIcon } from 'components/Icons'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'
import { RowStart } from 'components/Row'
import Image from 'next/image'

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
`

const InlineModal = styled(Card)<{
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 220px;
  transform: translateX(-220px) translateY(15px);
  z-index: ${Z_INDEX.modal};
  gap: 12px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border3};
  border-radius: 10px;
`

const Row = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active, theme }) =>
    active &&
    ` color: ${theme.clqdrBlueColor};
      pointer-events: none;
  `};
`

const LegacyWrapper = styled.div`
  color: ${({ theme }) => theme.white};
`

const NavToggle = styled(NavToggleIcon)`
  &:hover,
  &:focus {
    filter: brightness(1.5);
    cursor: pointer;
  }
`

const Separator = styled.div`
  width: 225px;
  margin-left: -13px;
  height: 1px;
  background: ${({ theme }) => theme.bg3};
`

const ExternalLinkIcon = styled(LinkIcon)`
  margin-left: 4px;
  path {
    fill: ${({ theme }) => theme.text2};
  }
`
const ExternalItem = styled(RowStart)`
  &:hover {
    svg {
      path {
        fill: ${({ theme }) => theme.white};
      }
    }
  }
`

export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <Container ref={ref}>
      <NavToggle onClick={() => toggle()} />
      {/* <Image src={BURGER_ICON} alt="burger-icon" onClick={() => toggle()} /> */}
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href="/xdeus/swap" passHref>
            <Row active={router.route.includes('/xdeus/swap')} onClick={() => toggle()}>
              <div>Swap multiDEUS</div>
            </Row>
          </Link>
          <Link href="/xdeus/stake" passHref>
            <Row active={router.route.includes('/xdeus/stake')} onClick={() => toggle()}>
              <div>Unstake xmultiDEUS</div>
            </Row>
          </Link>
          <Link href="/migration" passHref>
            <Row active={router.route.includes('/migration')} onClick={() => toggle()}>
              <div>Migration</div>
            </Row>
          </Link>
          <Link href="/bridge" passHref>
            <Row onClick={() => toggle()}>
              <div>Bridge</div>
            </Row>
          </Link>
          <Link href="/convert" passHref>
            <Row onClick={() => toggle()}>
              <div>Convert</div>
            </Row>
          </Link>
          {/* <Link href="/clqdr" passHref>
            <Row active={router.route.includes('/clqdr')} onClick={() => toggle()}>
              <div>cLQDR</div>
            </Row>
          </Link> */}
          <ExternalLink href="https://app.firebird.finance/swap?inputCurrency=FTM&outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250">
            <Row onClick={() => toggle()}>
              <ExternalItem>
                <div>Buy $DEUS (firebird)</div>
                <ExternalLinkIcon />
              </ExternalItem>
            </Row>
          </ExternalLink>

          {/* <ExternalLink href="https://app.multichain.org/#/router">
            <Row onClick={() => toggle()}>
              <ExternalItem>
                <div>Bridge (multichain)</div>
                <ExternalLinkIcon />
              </ExternalItem>
            </Row>
          </ExternalLink> */}
          <ExternalLink href="https://snapshot.org/#/dea.eth">
            <Row onClick={() => toggle()}>
              <ExternalItem>
                <div>Vote</div>
                <ExternalLinkIcon />
              </ExternalItem>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://docs.deus.finance/contracts/disclaimer">
            <Row onClick={() => toggle()}>
              <ExternalItem>
                <div>Terms</div>
                <ExternalLinkIcon />
              </ExternalItem>
            </Row>
          </ExternalLink>
          <Separator />

          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://discord.gg/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Discord</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://t.me/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Telegram</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://docs.deus.finance/">
            <Row onClick={() => toggle()}>
              <div>GitBook</div>
            </Row>
          </ExternalLink>
          <Separator />

          <ExternalLink href="https://app.dei.finance/">
            <Row onClick={() => toggle()}>
              <LegacyWrapper>
                DEI App
                <LinkIcon style={{ marginLeft: '4px' }} />
              </LegacyWrapper>
              <Image src={DEI_LOGO} width={'20px'} height={'15px'} alt={'dei-logo'} />
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
