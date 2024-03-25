import Transaction from 'arweave/web/lib/transaction'
import { JSDOM } from 'jsdom'

const _Window = (new JSDOM() as any).window as Window

const arweaveWallet = {
  getActiveAddress: jest.fn(() => 'test'),
  getActivePublicKey: jest.fn(() => 'test'),
  dispatch: jest.fn((tx: Transaction) => Promise.resolve(tx.id))
}

Object.defineProperty(_Window, 'arweaveWallet', {
  value: arweaveWallet
})

export { _Window, arweaveWallet }
