import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

import routes from 'constants/files/routes.json'
import { Z_INDEX } from 'theme'

import { sendEvent } from 'components/analytics'
import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import RiskNotification from 'components/InfoHeader'
import Menu from './Menu'
import NavLogo from './NavLogo'
import { ChevronDown, Link as LinkIcon } from 'components/Icons'
import { RowStart } from 'components/Row'
import { ExternalLink } from 'components/Link'

const Wrapper = styled.div`
  padding: 0px 2rem;
  height: 55px;
  align-items: center;
  background: ${({ theme }) => theme.bg0};
  gap: 5px;
  z-index: ${Z_INDEX.fixed};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
`

const DefaultWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 19px;
  & > * {
    &:first-child {
      flex: 1;
    }
    &:last-child {
      flex: 1;
    }
  }
`

const MobileWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`

const Routes = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 4px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      &:nth-child(2) {
        display: none;
      }
    }
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
      &:nth-child(1),
      &:nth-child(3),
      &:nth-child(4)
     {
        display: none;
      }
    }
  `};
`

export const NavbarContentWrap = styled.div`
  list-style: none;
  margin: auto;
  margin-left: 15px;
  margin-right: 15px;
  cursor: pointer;
  padding: 10px 0;
  position: relative;

  &:hover {
    display: block;
    & > ul {
      display: block;
    }
  }
`

export const SubNavbarContentWrap = styled.ul`
  display: none;
  padding: 12px 0 12px 0px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  list-style: none;
  position: absolute;
  top: 50px;
  margin-top: -14px;
  left: 50%;
  transform: translateX(-50%);

  & > li > div {
    border-radius: 0;
    padding: 0.45rem 1rem;
    min-width: 150px;
  }
`

const SimpleLinkWrapper = styled.div`
  margin-top: 6px;
`

const Items = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      gap: 5px;
  `};
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  ${({ active }) =>
    active &&
    `
    background: -webkit-linear-gradient(1deg, #0badf4 -10.26%, #30efe4 90%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
`};

  &:hover {
    cursor: default;
    ${({ active, theme }) =>
      !active &&
      `
      cursor: pointer;
      color: ${theme.clqdrBlueColor};
  `};
  }
`

const ExternalLinkIcon = styled(LinkIcon)`
  margin-left: 6px;
`
const ExternalItem = styled(RowStart)`
  padding: 0 1rem;
  div {
    padding-left: 0;
    padding-right: 0;
  }
  a:hover + svg {
    path {
      fill: ${({ theme }) => theme.clqdrBlueColor};
    }
  }
`

const TitleSpan = styled.span<{ active: boolean }>`
  padding: 0.25rem 1rem;
  ${({ active, theme }) =>
    active &&
    `
    font-weight: 900;
    color: ${theme.clqdrBlueColor};
`};
`

function getExternalNavBar(title: string, link: string): JSX.Element {
  return (
    <>
      <SimpleLinkWrapper>
        <ExternalItem>
          <ExternalLink href={link}>
            <NavLink active={false}>{title}</NavLink>
          </ExternalLink>
          <ExternalLinkIcon />
        </ExternalItem>
      </SimpleLinkWrapper>
    </>
  )
}

export default function NavBar() {
  const router = useRouter()

  const showBanner = localStorage.getItem('risk_warning') === 'true' ? false : true
  const [showTopBanner, setShowTopBanner] = useState(showBanner)
  const [showTopBanner2, setShowTopBanner2] = useState(false)
  const bannerText = 'Users interacting with this software do so entirely at their own risk'
  const bannerText2 =
    'Conversion contract is currently being upgraded; CLAIM newDeus from what you already converted. wait 2 hours before converting again so you can do everything through the ui'

  const [showTopBanner3, setShowTopBanner3] = useState(false)
  const bannerText3 =
    'You will claim all DEUS from your bDEI, DEI, DEUS and xDEUS migrated to either DEUS or to the balanced option \n (bDEI and legacy DEI up to the June 7 snapshot)'

  function setShowBanner(inp: boolean) {
    if (!inp) {
      localStorage.setItem('risk_warning', 'true')
      setShowTopBanner(false)
      sendEvent('click', { click_type: 'close_notification', click_action: 'risk_warning' })
    }
  }

  function setShowBanner2(inp: boolean) {
    if (!inp) setShowTopBanner2(false)
  }

  function getMobileContent() {
    return (
      <>
        <MobileWrapper>
          <NavLogo />
          <Web3Network />
          <Web3Status />
          <Menu />
        </MobileWrapper>
        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
        {showTopBanner2 && router.route.includes('/convert') && (
          <RiskNotification onClose={setShowBanner2} bg={'red'} hasInfoIcon={true} text={bannerText2} />
        )}
        {showTopBanner3 && router.route.includes('/migration') && (
          <RiskNotification onClose={setShowTopBanner3} bg={'#FF8F00'} hasInfoIcon={true} text={bannerText3} />
        )}
      </>
    )
  }

  function isSubItemChosen(item: Array<any>) {
    for (let i = 0; i < item.length; i++) {
      if (item[i].path === router.route) return true
    }
    return false
  }

  function getDefaultContent() {
    return (
      <>
        <DefaultWrapper>
          <NavLogo />
          <Routes>
            {routes.map((item) => {
              return item.children ? (
                <NavbarContentWrap key={item.id}>
                  <TitleSpan active={isSubItemChosen(item.children)}>
                    {item.text}{' '}
                    <ChevronDown
                      color={isSubItemChosen(item.children) ? '#0ACBEB' : 'white'}
                      disabled
                      style={{ position: 'absolute' }}
                    />
                  </TitleSpan>
                  <SubNavbarContentWrap>
                    {item.children.map((subItem) => (
                      <li key={subItem.id}>
                        <Link href={subItem.path} passHref>
                          <NavLink active={router.route === subItem.path}>{subItem.text}</NavLink>
                        </Link>
                      </li>
                    ))}
                  </SubNavbarContentWrap>
                </NavbarContentWrap>
              ) : (
                <SimpleLinkWrapper key={item.id}>
                  <Link href={item.path} passHref>
                    <NavLink active={router.route.includes(item.path)}>{item.text}</NavLink>
                  </Link>
                </SimpleLinkWrapper>
              )
            })}
            {/* {getExternalNavBar('Bridge', ' https://v2.app.squidrouter.com')} */}
            {getExternalNavBar(
              'Buy $DEUS',
              'https://swap.defillama.com/?chain=bsc&from=0x0000000000000000000000000000000000000000&to=0xde5ed76e7c05ec5e4572cfc88d1acea165109e44'
            )}
            {/* {getExternalNavBar('Bridge $DEUS', 'https://app.multichain.org/#/router')} */}
            {getExternalNavBar('Terms', 'https://docs.deus.finance/contracts/disclaimer')}
          </Routes>
          <Items>
            <Web3Network />
            <Web3Status />
            <Menu />
          </Items>
        </DefaultWrapper>
        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
        {showTopBanner2 && router.route.includes('/convert') && (
          <RiskNotification onClose={setShowBanner2} bg={'red'} hasInfoIcon={true} text={bannerText2} />
        )}
        {showTopBanner3 && router.route.includes('/migration') && (
          <RiskNotification onClose={setShowTopBanner3} bg={'#FF8F00'} hasInfoIcon={true} text={bannerText3} />
        )}
      </>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
