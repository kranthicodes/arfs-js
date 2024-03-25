import Transaction from 'arweave/web/lib/transaction'
import { JSDOM } from 'jsdom'

const _Window = (new JSDOM() as any).window as Window

Object.defineProperty(_Window, 'arweaveWallet', {
  value: {
    getActivePublicKey: jest.fn(() => 'test'),
    dispatch: jest.fn((tx: Transaction) => Promise.resolve(tx.id))
  }
})

export { _Window }
