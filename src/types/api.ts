import { JWKInterface } from 'arweave/node/lib/wallet'

export type APIOptions = {
  gateway?: string
  wallet: Wallet
  appName?: string
}
export type Wallet = JWKInterface | 'use_wallet'
