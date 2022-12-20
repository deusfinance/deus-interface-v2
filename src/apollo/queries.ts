import gql from 'graphql-tag'

export interface ClqdrChartData {
  timestamp: string
  clqdrRatio: string
  totalSupply: string
}

export interface ChartData {
  timestamp: string
  value: string
}

export const CLQDR_DATA = gql`
  query getCLQDRData($skip: Int!, $timestamp: Int!) {
    snapshots(first: 1000, skip: $skip, where: { timestamp_lt: $timestamp }, orderBy: timestamp, orderDirection: desc) {
      timestamp
      clqdrRatio
      totalSupply
    }

    hourlySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      clqdrRatio
      totalSupply
    }

    dailySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      clqdrRatio
      totalSupply
    }
  }
`

export const VDEUS_POOL_STATS = gql`
  query getPoolStats($skip: Int!, $timestamp: Int!) {
    vdeusPoolSnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      vDeusBalance
      deusBalance
      vDeusPerDeus
      deusPerVDeus
    }

    vdeusPoolHourlySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      vDeusBalance
      deusBalance
      vDeusPerDeus
      deusPerVDeus
    }

    vdeusPoolDailySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      vDeusBalance
      deusBalance
      vDeusPerDeus
      deusPerVDeus
    }
  }
`
