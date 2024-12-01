import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import ActionSetter, { ActionTypes } from 'components/App/Migrate/ActionSetter'
import HeaderBox from 'components/App/Migrate/HeaderBox'
import { MigrationWrap } from 'context/Migration'
import MigratedTable from 'components/App/Migrate/MigratedTable'
import ClaimWrap from 'components/App/Migrate/ClaimWrap'
import { ExternalLink } from 'components/Link'

const BlurredOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(15, 15, 15, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  max-width: 600px;
  width: 90%;
  pointer-events: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`

const MessageText = styled.div`
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: justify;
`

const DiscordLink = styled.div`
  font-family: 'Inter', sans-serif;
  color: #00a8ff;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  margin-top: 1rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #0097e6;
    text-shadow: 0 0 8px rgba(0, 168, 255, 0.4);
  }
`

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  font-family: Inter;
  filter: blur(4px);
  pointer-events: none;
`

const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg2};
  margin: 0 auto;
  width: clamp(250px, 90%, 1168px);

  & > * {
    &:nth-child(4) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function Migrate() {
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.CLAIM)

  return (
    <>
      <Container>
        <MigrationWrap>
          <HeaderBox />
          <ActionSetter selected={selected} setSelected={setSelected} />

          <Wrapper>
            {selected === ActionTypes.CLAIM && <ClaimWrap />}
            {selected === ActionTypes.DASHBOARD && <MigratedTable setSelected={setSelected} />}
          </Wrapper>
        </MigrationWrap>
      </Container>
      <BlurredOverlay>
        <MessageText>
          All migrators have been shut down, transfers have been deactivated, and final balances have been snapshotted.
          Symmio is preparing for their upcoming TGE in the middle of December. Visit their Discord for more info. The
          full snapshot data will be released at the beginning of December.
        </MessageText>
        <ExternalLink href={'https://discord.gg/symmio'} style={{ textDecoration: 'none' }}>
          <DiscordLink>discord.gg/symmio</DiscordLink>
        </ExternalLink>
      </BlurredOverlay>
    </>
  )
}
