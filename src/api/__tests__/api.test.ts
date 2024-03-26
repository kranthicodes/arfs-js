import { JWKInterface } from 'arweave/node/lib/wallet'
import Transaction from 'arweave/web/lib/transaction'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { _Window, arweaveWallet } from '../../mocks/windowArWallet'
import { arweaveInstance } from '../../utils/arweaveInstance'
import { ArFSApi } from '../api'
import { apiConfig } from '../config'

globalThis.window = _Window as Window & typeof globalThis
globalThis.arweaveWallet = arweaveWallet

describe('ArFSApi with ArConnect', () => {
  const arfsApi = new ArFSApi({ wallet: 'use_wallet' })

  test('should have default apiUrl', () => {
    expect(arfsApi.apiUrl).toBe(apiConfig['default'].url)
  })

  test('should have use_wallet for wallet', () => {
    expect(arfsApi.wallet).toBe('use_wallet')
  })

  test('should have user address set', async () => {
    expect(arfsApi.address).toBe('owtC4zvNF_S2C42-Rb-PC1vuuF6bzcqIUlmQvd-Bo50')
  })

  test('should return injected arwewave signer', async () => {
    const signer = await arfsApi.getSigner()

    expect(signer instanceof InjectedArweaveSigner).toBe(true)
    expect(window.arweaveWallet.getActivePublicKey).toHaveBeenCalledTimes(1)
  })

  test('should signAndSendAllTransactions', async () => {
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(1)
    expect(response.failedTxIndex.length).toBe(0)

    expect(window.arweaveWallet.dispatch).toHaveBeenCalledTimes(1)
    expect(window.arweaveWallet.dispatch).toHaveBeenCalledWith(arTx)
  })
})

describe('ArFSApi with JWK', () => {
  let arWallet: JWKInterface
  let arfsApi: ArFSApi

  beforeEach(async () => {
    arWallet = await arweaveInstance.wallets.generate()

    arfsApi = new ArFSApi({ wallet: arWallet })
  })

  test('should have JWK for wallet', () => {
    expect(typeof arfsApi.wallet).toBe('object')
  })

  test('should have user address set', async () => {
    const address = await arweaveInstance.wallets.getAddress(arWallet)

    expect(arfsApi.address).toBe(address)
  })

  test('should return arwewave signer', async () => {
    const signer = await arfsApi.getSigner()

    expect(signer instanceof ArweaveSigner).toBe(true)
  })

  test('should signAndSendAllTransactions', async () => {
    arweaveInstance.transactions.post = jest.fn(
      (tx: Transaction) => Promise.resolve({ id: tx.id, status: 200, statusText: 'success' }) as any
    )
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(1)
    expect(response.failedTxIndex.length).toBe(0)

    expect(arweaveInstance.transactions.post).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.post).toHaveBeenCalledWith(arTx)
  })

  test('should fail signAndSendAllTransactions', async () => {
    arweaveInstance.transactions.post = jest.fn(
      (tx: Transaction) => Promise.resolve({ id: tx.id, status: 400, statusText: 'failed' }) as any
    )
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(0)
    expect(response.failedTxIndex.length).toBe(1)

    expect(arweaveInstance.transactions.post).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.post).toHaveBeenCalledWith(arTx)
  })
})
