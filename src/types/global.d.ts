declare module 'warp-contracts-plugin-signature' {
  const InjectedArweaveSigner: any
}

declare module globalThis {
  // eslint-disable-next-line no-var
  var arweaveWallet: any
}
