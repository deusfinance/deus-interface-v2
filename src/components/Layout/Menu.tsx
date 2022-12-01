import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
// import Image from 'next/image'
import { Z_INDEX } from 'theme'

// import LEGACY_DEI_LOGO from '/public/static/images/LegacyDeusLogo.svg'
import { Link as LinkIcon } from 'components/Icons'
import useOnOutsideClick from 'hooks/useOnOutsideClick'

import { NavToggle as NavToggleIcon, IconWrapper, VeDeus as VeDeusIcon } from 'components/Icons'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'

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
    ` color: ${theme.blueClqdrColor};
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
  background: ${({ theme }) => theme.bg4};
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
          <Link href="/vest" passHref>
            <Row active={router.route.includes('/vest')}>
              <div>veDEUS</div>
              <IconWrapper>
                <VeDeusIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/clqdr" passHref>
            <Row active={router.route.includes('/clqdr')}>
              <div>cLQDR</div>
              {/* <IconWrapper>
                <VeDeusIcon size={20} />
              </IconWrapper> */}
            </Row>
          </Link>
          <ExternalLink href="https://app.firebird.finance/swap?inputCurrency=FTM&outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250">
            <Row onClick={() => toggle()}>
              <div>Swap</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://app.multichain.org/#/router">
            <Row onClick={() => toggle()}>
              <div>Bridge</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://snapshot.org/#/dea.eth">
            <Row onClick={() => toggle()}>
              <div>Vote</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://legacy.deus.finance/migrator">
            <Row onClick={() => toggle()}>
              <div>V2 Migrator</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://docs.deus.finance/contracts/disclaimer">
            <Row onClick={() => toggle()}>
              <div>Terms</div>
            </Row>
          </ExternalLink>
          <Separator />

          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://discord.gg/xTTaBBAMgG">
            <Row onClick={() => toggle()}>
              <div>Discord</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://legacy.deus.finance/">
            <Row onClick={() => toggle()}>
              <LegacyWrapper>
                Legacy App
                <LinkIcon style={{ marginLeft: '4px' }} />
              </LegacyWrapper>
              {/* <Image src={LEGACY_DEI_LOGO} width={'20px'} height={'15px'} alt={'dei-logo'} /> */}
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
