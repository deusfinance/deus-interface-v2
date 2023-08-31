import { AllChainId } from './chains'

interface Info {
  chainId: string
  chainName: string
  label: string
  logoUrl: StaticImageData
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string
  blockExplorerUrl: string
}

export const ChainInfo: { [chainId: number]: Info } = {
  [AllChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    label: 'Ethereum',
    logoUrl: require('/public/static/images/networks/mainnet.svg'),
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
  },
  [AllChainId.ROPSTEN]: {
    chainId: '0x3',
    chainName: 'Ropsten Testnet',
    label: 'Ropsten',
    logoUrl: require('/public/static/images/networks/mainnet.svg'),
    nativeCurrency: {
      name: 'Ropsten Ether',
      symbol: 'ropETH',
      decimals: 18,
    },
    rpcUrl: 'https://ropsten.infura.io/v3/',
    blockExplorerUrl: 'https://ropsten.etherscan.io',
  },
  [AllChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby Testnet',
    label: 'Rinkeby',
    logoUrl: require('/public/static/images/networks/mainnet.svg'),
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://rinkeby.infura.io/v3/',
    blockExplorerUrl: 'https://rinkeby.etherscan.io',
  },
  [AllChainId.GOERLI]: {
    chainId: '0x5',
    chainName: 'Görli Testnet',
    label: 'Görli',
    logoUrl: require('/public/static/images/networks/mainnet.svg'),
    nativeCurrency: {
      name: 'Görli Ether',
      symbol: 'görETH',
      decimals: 18,
    },
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorerUrl: 'https://goerli.etherscan.io',
  },
  [AllChainId.KOVAN]: {
    chainId: '0x29',
    chainName: 'Kovan Testnet',
    label: 'Kovan',
    logoUrl: require('/public/static/images/networks/mainnet.svg'),
    nativeCurrency: {
      name: 'Kovan Ether',
      symbol: 'kovETH',
      decimals: 18,
    },
    rpcUrl: 'https://kovan.infura.io/v3/',
    blockExplorerUrl: 'https://kovan.etherscan.io',
  },
  [AllChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain Mainnet',
    label: 'BSC',
    logoUrl: require('/public/static/images/networks/binance.svg'),
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
  },
  [AllChainId.XDAI]: {
    chainId: '0x64',
    chainName: 'xDAI Chain',
    label: 'xDAI',
    logoUrl: require('/public/static/images/networks/xdai.svg'),
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.xdaichain.com',
    blockExplorerUrl: 'https://blockscout.com/poa/xdai',
  },
  [AllChainId.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony',
    label: 'Harmony',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrl: 'https://api.harmony.one',
    blockExplorerUrl: 'https://explorer.harmony.one',
  },
  [AllChainId.HECO]: {
    chainId: '0x80',
    chainName: 'Huobi ECO Chain Mainnet',
    label: 'HECO',
    logoUrl: require('/public/static/images/networks/heco.svg'),
    nativeCurrency: {
      name: 'HT',
      symbol: 'HT',
      decimals: 18,
    },
    rpcUrl: 'https://http-mainnet.hecochain.com',
    blockExplorerUrl: 'https://hecoinfo.com',
  },
  [AllChainId.POLYGON]: {
    chainId: '0x89',
    chainName: 'Matic Mainnet',
    label: 'Polygon',
    logoUrl: require('/public/static/images/networks/polygon.svg'),
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'Matic',
      decimals: 18,
    },
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
  },
  [AllChainId.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom Opera',
    label: 'Fantom',
    logoUrl: require('/public/static/images/networks/fantom.svg'),
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.ftm.tools',
    blockExplorerUrl: 'https://ftmscan.com',
  },
  [AllChainId.AVALANCHE]: {
    chainId: '0xA86A',
    chainName: 'Avalanche Mainnet C-Chain',
    label: 'Avalanche',
    logoUrl: require('/public/static/images/networks/avalanche.svg'),
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://snowtrace.io',
  },
  [AllChainId.OKEX]: {
    chainId: '0x42',
    chainName: 'OKEx',
    label: 'OKEx',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'OKEx Token',
      symbol: 'OKT',
      decimals: 18,
    },
    rpcUrl: 'https://exchainrpc.okex.org',
    blockExplorerUrl: 'https://www.oklink.com/okexchain',
  },
  [AllChainId.ARBITRUM]: {
    chainId: '0xA4B1',
    chainName: 'Arbitrum',
    label: 'Arbitrum',
    logoUrl: require('/public/static/images/networks/arbitrum.svg'),
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
  },
  [AllChainId.CELO]: {
    chainId: '0xA4EC',
    chainName: 'Celo',
    label: 'Celo',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrl: 'https://forno.celo.org',
    blockExplorerUrl: 'https://explorer.celo.org',
  },
  [AllChainId.MOONRIVER]: {
    chainId: '0x505',
    chainName: 'Moonriver',
    label: 'Moonriver',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.moonriver.moonbeam.network',
    blockExplorerUrl: 'https://moonriver.moonscan.io',
  },
  [AllChainId.FUSE]: {
    chainId: '0x7A',
    chainName: 'Fuse',
    label: 'Fuse',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'Fuse',
      symbol: 'FUSE',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.fuse.io',
    blockExplorerUrl: 'https://explorer.fuse.io',
  },
  [AllChainId.TELOS]: {
    chainId: '0x28',
    chainName: 'Telos',
    label: 'Telos',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'Telos',
      symbol: 'TLOS',
      decimals: 18,
    },
    rpcUrl: 'https://mainnet.telos.net/evm',
    blockExplorerUrl: 'https://rpc1.us.telos.net/v2/explore',
  },
  [AllChainId.PALM]: {
    chainId: '0x2A15C308D',
    chainName: 'Palm',
    label: 'Palm',
    logoUrl: require('/public/static/images/fallback/not_found.png'),
    nativeCurrency: {
      name: 'Palm',
      symbol: 'PALM',
      decimals: 18,
    },
    rpcUrl: 'https://palm-mainnet.infura.io/v3/da5fbfafcca14b109e2665290681e267',
    blockExplorerUrl: 'https://explorer.palm.io',
  },
  [AllChainId.METIS]: {
    chainId: '0x440',
    chainName: 'Metis Andromeda Mainnet',
    label: 'Metis',
    logoUrl: require('/public/static/images/networks/metis.svg'),
    nativeCurrency: {
      name: 'MetisDAO',
      symbol: 'METIS',
      decimals: 18,
    },
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    blockExplorerUrl: 'https://andromeda-explorer.metis.io/',
  },
  [AllChainId.KAVA]: {
    chainId: '0x8ae',
    chainName: 'Kava EVM',
    label: 'Kava',
    logoUrl: require('/public/static/images/networks/kava.svg'),
    nativeCurrency: {
      name: 'KAVA',
      symbol: 'KAVA',
      decimals: 18,
    },
    rpcUrl: 'https://evm.kava.io',
    blockExplorerUrl: 'https://explorer.kava.io/',
  },
}

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns ChainInfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return ChainInfo[chainId] ?? undefined
  }
  return undefined
}
