import { constructSameAddressMap } from 'utils/address'
import { MigrationChains, SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/* =====================================
                USDC ADDRESS
===================================== */
export const USDC_ADDRESS = {
  [SupportedChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [SupportedChainId.RINKEBY]: '0x49AC7cEDdb9464DA9274b164Cd6BA7129Da2C03E',
  [SupportedChainId.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
  [SupportedChainId.BSC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
}
/* =====================================
                DEI ADDRESS
===================================== */
export const DEI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

export const LEGACY_DEI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

export const BDEI_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8',
  [SupportedChainId.ARBITRUM]: '0x4a142eb454A1144c85D23e138A4571C697Ed2483',
}

/* =====================================
                DEUS ADDRESS
===================================== */
export const DEUS_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
  [SupportedChainId.OP]: '0x66846420bC2ce961FFd2E4042Bfde0A0E96Fb2c6',
}

/* =====================================
                xDEUS ADDRESS (ERC20 NEW)
===================================== */
export const XDEUS_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x953Cd009a490176FcEB3a26b9753e6F01645ff28', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
    SupportedChainId.BSC,
    SupportedChainId.ARBITRUM,
  ]),
}
/* =====================================
                veDEUS ADDRESS (ERC721)
===================================== */
export const veDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x8b42c6cb07c8dd5fe5db3ac03693867afd11353d',
}

// veDEUS Migrator ADDRESS
export const veDEUSMigrator: AddressMap = {
  [SupportedChainId.FANTOM]: '0x7d06331B4F4B43F444C0f0d4Ed593De126939Dd6',
}

/* =====================================
                PROTOCOL HOLDINGS ADDRESS
===================================== */
export const ProtocolHoldings1: AddressMap = {
  [SupportedChainId.FANTOM]: '0x0b99207afbb08ec101b5691e7d5c6faadd09a89b',
}

export const ProtocolHoldings2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x68c102aba11f5e086c999d99620c78f5bc30ecd8',
}

/* =====================================
                USDC RESERVES ADDRESS
===================================== */
export const USDCReserves1: AddressMap = {
  [SupportedChainId.FANTOM]: '0x083dee8e5ca1e100a9c9ec0744f461b3507e9376',
}

export const USDCReserves2: AddressMap = {
  [SupportedChainId.FANTOM]: '0xfd74e924dc96c72ba52439e28ce780908a630d13',
}

export const USDCReserves3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x37a7a2a5FCB0DF6B8138fec7730825E92f9D8207',
}

/* =====================================
                DAPP CONTRACTS ADDRESS
===================================== */

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.ARBITRUM]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.MAINNET]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.POLYGON]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.BSC]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.AVALANCHE]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [SupportedChainId.METIS]: '0x3CB9ae281E511759832a074A92634d2486E6a886',
  [SupportedChainId.KAVA]: '0x731e0A91Ec7F87868124D85d87D92Aa5cF058351',
  [SupportedChainId.BASE]: '0xD9a273Dd2723a14B63b575ED9e5ac8E1B76f5f12',
}

export const BaseV1Factory: AddressMap = {
  [SupportedChainId.FANTOM]: '0x3faab499b519fdc5819e3d7ed0c26111904cbc28',
}

export const BaseV1Voter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xdC819F5d05a6859D2faCbB4A44E5aB105762dbaE',
}

export const BaseV1Minter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xC4209c19b183e72A037b2D1Fb11fbe522054A90D',
}

export const LenderManager: AddressMap = {
  [SupportedChainId.FANTOM]: '0xc02f204bab0248c694516dbaf985d40718ed4f86',
}

export const SolidAddress: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const Locker: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const SolidexLpDepositor: AddressMap = {
  [SupportedChainId.FANTOM]: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
}

export const Reimburse: AddressMap = {
  [SupportedChainId.FANTOM]: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
}

export const veDist: AddressMap = {
  [SupportedChainId.FANTOM]: '0x09cE8C8E2704E84750E9c1a4F54A30eF60aF0073',
}

export const DeiBonder: AddressMap = {
  [SupportedChainId.FANTOM]: '0x958C24d5cDF94fAF47cF4d66400Af598Dedc6e62',
}

export const MintProxy: AddressMap = {
  [SupportedChainId.FANTOM]: '',
}

export const CollateralPool: AddressMap = {
  [SupportedChainId.FANTOM]: '0x6E0098A8c651F7A6A9510B270CD02c858C344D94',
}

export const Collateral: AddressMap = {
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
}

export const DeiBondRedeemNFT: AddressMap = {
  [SupportedChainId.FANTOM]: '0x44656b5f0454b3ddbc03471dc391056331f19476',
}

export const DeiBonderV3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x3360d56bcd109216214ef477728A0ED1b7d36A6F',
}

export const TwapOracle: AddressMap = {
  [SupportedChainId.FANTOM]: '0x733570cB9e76fD5293c028e124FC9F0a2234F07c',
}

export const AMO: AddressMap = {
  [SupportedChainId.FANTOM]: '0x521cde355a65144679d15e8aedb5f423778899c9',
}

export const escrow: AddressMap = {
  [SupportedChainId.FANTOM]: '0xFb05aedf0caC43C6ce291D2d1be1eab568D155B4',
}

export const StablePool_DEUS_vDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x54a5039C403fff8538fC582e0e3f07387B707381',
}

export const DEUS_VDEUS_LP_TOKEN_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0xECd9E18356bb8d72741c539e75CEAdB3C5869ea0',
}

export const XDEUS_DEUS_SOLIDLY_LP_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x4EF3fF9dadBa30cff48133f5Dc780A28fc48693F',
}

export const MasterChefV3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x62ad8dE6740314677F06723a7A07797aE5082Dbb',
}

export const MasterChefV2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x67932809213AFd6bac5ECD2e4e214Fe18209c419',
}

//xDEUS ERC20 Staking (proxy contract)
export const veDEUSMultiRewarderERC20: AddressMap = {
  [SupportedChainId.FANTOM]: '0x9909E6046A9Ca950Cd2a28071338BdcB7d33f9Cb',
}

export const SOLID_TOKEN_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x777172D858dC1599914a1C4c6c9fC48c99a60990',
}
/* =====================================
                LQDR Tokens ADDRESS
===================================== */
export const CLQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x814c66594a22404e101fecfecac1012d8d75c156',
}

export const LQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9',
}

export const Migrator: AddressMap = {
  ...constructSameAddressMap('0xe3b6CC7b76a7f67BBCcb66c010780bE0AF31Ff05', MigrationChains),
}

export const AxlGateway_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x714bCAF508c6e2e405EAA379BA54804EeD401add',
  [SupportedChainId.POLYGON]: '0x8878Eb7F44f969D0ed72c6010932791397628546',
  [SupportedChainId.BSC]: '0x38A0b1cf61581f290D14016b2D37807d28CfF57b',
  [SupportedChainId.AVALANCHE]: '0x44Fa47B1787Db408803ED688c5dC7Eb88199050a',
  [SupportedChainId.KAVA]: '0xC8c1073Bb5b83f28778E5844469604BD0c4E293d',
  [SupportedChainId.BASE]: '0x0013efdA0FE688894b85707B89d7F0fb1a39f354',
  [SupportedChainId.OP]: '0x33257c271cD2414B444a00346dDaE6f2BB757372',
  [SupportedChainId.FANTOM]: '0x33257c271cD2414B444a00346dDaE6f2BB757372',
}

// export const Bridge_ADDRESS: AddressMap = {
//   [SupportedChainId.MAINNET]: '0x033A57bA228eF012f1cED3861ca21eAD5e7fD534',
//   [SupportedChainId.POLYGON]: '0x98097553Af9EB8F17F4f668C8C8eB78712eE2c43',
//   [SupportedChainId.BSC]: '0x68FD40FB0713a35627C98ba9549c7cCed73827F9',
//   [SupportedChainId.AVALANCHE]: '0x8Ccbc812394fDF26c58F3837aB419fbc315656C3',
//   [SupportedChainId.KAVA]: '0x18347ae09114C30E9895b8fbbd129d9611B2DC1c',
// }

export const AxlWrappedDeus_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x69e557b926F4eEf6d9400e36DBBFEb9600Af2880',
  [SupportedChainId.POLYGON]: '0x12A80A285DfaBd23FC1DFe6c515F034A22d9cdCE',
  [SupportedChainId.BSC]: '0x912922e25ac79D524734d8eC0C882B035c5b356f',
  [SupportedChainId.AVALANCHE]: '0xf9617c66cD8a4193A4DE0a101e16D73B71828810',
  [SupportedChainId.KAVA]: '0xebD4A18034C78A415088DF8508f102421eD693b1',
  [SupportedChainId.FANTOM]: '0x912922e25ac79D524734d8eC0C882B035c5b356f',
  [SupportedChainId.ARBITRUM]: '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44',
  [SupportedChainId.BASE]: '0xebD4A18034C78A415088DF8508f102421eD693b1',
  [SupportedChainId.OP]: '0xebD4A18034C78A415088DF8508f102421eD693b1',
}

export const newDeus_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE55B113A27Cc0c5893CAa6Ee1C020b6B46650C0',
}

export const DeusConversion_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x6c9E3B6b6C528ffdF0b5248a2B47069fcEc9e835',
}

export const ClaimDeus_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0xBB901d8D3fAF0b675e443B2DE743d149bfe68353',
}
