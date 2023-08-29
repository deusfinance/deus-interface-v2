declare module '@siddomains/sidjs' {
  class SID {
    constructor({ provider, sidAddress, networkId }: { provider: any; sidAddress: any; networkId?: any })
    name: (name: any) => ISidName
    getName: (name: any) => ISidName
  }

  interface ISidName {
    getAddress: () => Promise<string>
    name: string | undefined
  }

  export function getSidAddress(chainId: any): any
  export default SID
}
