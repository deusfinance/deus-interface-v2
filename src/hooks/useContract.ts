import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { Web3Provider } from '@ethersproject/providers'

import useWeb3React from './useWeb3'

import ERC20_ABI from 'constants/abi/ERC20.json'
import ERC20_BYTES32_ABI from 'constants/abi/ERC20'
import MULTICALL2_ABI from 'constants/abi/MULTICALL2.json'
import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import VEDEUS_MIGRATOR_ABI from 'constants/abi/VEDEUS_MIGRATOR_ABI.json'
import VE_DIST_ABI from 'constants/abi/VE_DIST.json'
import SWAP_ABI from 'constants/abi/SWAP_ABI.json'
import MasterChefV2_ABI from 'constants/abi/MasterChefV2.json'
import VEDEUS_MULTI_REWARDER_ERC20_ABI from 'constants/abi/VEDEUS_MULTI_REWARDER_ERC20.json'
import MIGRATOR_ABI from 'constants/abi/MIGRATOR.json'
// import BRIDGE_ABI from 'constants/abi/BRIDGE.json'
import AXL_GATEWAY_ABI from 'constants/abi/AXL_GATEWAY.json'
import DeusConversion from 'constants/abi/DeusConversion.json'
import ClaimDeus_ABI from 'constants/abi/ClaimDeus.json'

import CLQDR_ABI from 'constants/abi/CLQDR_ABI.json'
import CLQDR_FULL_ABI from 'constants/abi/CLQDR_FULL_ABI.json'

import { Providers } from 'constants/providers'

import {
  Multicall2,
  ZERO_ADDRESS,
  veDEUS,
  veDist,
  CLQDR_ADDRESS,
  veDEUSMigrator,
  veDEUSMultiRewarderERC20,
  Migrator,
  // Bridge_ADDRESS,
  AxlGateway_ADDRESS,
  DeusConversion_ADDRESS,
  ClaimDeus_ADDRESS,
} from 'constants/addresses'
import { LiquidityType, StakingType } from 'constants/stakingPools'

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | null | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address || address === ZERO_ADDRESS) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function getProviderOrSigner(library: any, account?: string): any {
  return account ? getSigner(library, account) : library
}

export function getSigner(library: any, account: string): any {
  return library.getSigner(account).connectUnchecked()
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
  targetChainId?: number
): Contract | null {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`Invalid 'address' parameter '${address}'.`)
  }

  let providerOrSigner
  if (targetChainId) {
    providerOrSigner = getProviderOrSigner(Providers[targetChainId], account)
  } else {
    providerOrSigner = getProviderOrSigner(library, account)
  }

  return new Contract(address, ABI, providerOrSigner) as any
}

export function useERC20Contract(tokenAddress: string | null | undefined, withSignerIfPossible?: boolean) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useVeDeusContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUS[chainId] : undefined), [chainId])
  return useContract(address, VEDEUS_ABI)
}

export function useVeDeusMigratorContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUSMigrator[chainId] : undefined), [chainId])
  return useContract(address, VEDEUS_MIGRATOR_ABI)
}

export function useVeDistContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDist[chainId] : undefined), [chainId])
  return useContract(address, VE_DIST_ABI)
}

export function useMulticall2Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Multicall2[chainId] : undefined), [chainId])
  return useContract(address, MULTICALL2_ABI)
}

export function useCLQDRContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? CLQDR_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, CLQDR_ABI)
}

export function usePerpetualEscrowTokenReceiverContract() {
  const address = '0xcd3563cd8de2602701d5d9f960db30710fcc4053'
  return useContract(address, CLQDR_FULL_ABI)
}

export function useStablePoolContract(pool: LiquidityType) {
  const address = useMemo(() => (pool ? pool.contract : undefined), [pool])
  return useContract(address, SWAP_ABI)
}

export function useMasterChefContract(stakingPool: StakingType) {
  const address = useMemo(() => (stakingPool ? stakingPool.masterChef : undefined), [stakingPool])
  return useContract(address, MasterChefV2_ABI)
}

export function useVDeusMultiRewarderERC20Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUSMultiRewarderERC20[chainId] : undefined), [chainId])
  return useContract(address, VEDEUS_MULTI_REWARDER_ERC20_ABI)
}

export function useMigratorContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Migrator[chainId] : undefined), [chainId])
  return useContract(address, MIGRATOR_ABI)
}

export function useAxlGatewayContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? AxlGateway_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, AXL_GATEWAY_ABI)
}

export function useDeusConversionContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeusConversion_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, DeusConversion)
}

export function useClaimDeusContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? ClaimDeus_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, ClaimDeus_ABI)
}
