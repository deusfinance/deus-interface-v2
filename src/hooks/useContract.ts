import { useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useContract } from 'lib/hooks/contract'
import { useWeb3React } from '@web3-react/core'

import {
  Multicall2,
  veDEUS,
  veDist,
  CLQDR_ADDRESS,
  veDEUSMigrator,
  veDEUSMultiRewarderERC20,
  Migrator,
  MULTICALL3_ADDRESS,
} from 'constants/addresses'
import { LiquidityType, StakingType } from 'constants/stakingPools'
import {
  CLQDR_ABI,
  CLQDR_FULL_ABI,
  ERC20_ABI,
  ERC20_BYTES32_ABI,
  MIGRATOR_ABI,
  MULTICALL2_ABI,
  MULTICALL3_ABI,
  MasterChefV2_ABI,
  SWAP_ABI,
  VEDEUS_ABI,
  VEDEUS_MIGRATOR_ABI,
  VEDEUS_MULTI_REWARDER_ERC20_ABI,
  VE_DIST_ABI,
} from 'constants/abi'

/* ###################################
                      HELPER
################################### */

export function useERC20Contract(tokenAddress: string | null | undefined, withSignerIfPossible?: boolean) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMultiCall3Contract() {
  return useContract(MULTICALL3_ADDRESS, MULTICALL3_ABI, false)
}

/* ###################################
                              DEUS 
################################### */

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
  return useContract('0xcd3563cd8de2602701d5d9f960db30710fcc4053', CLQDR_FULL_ABI)
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
