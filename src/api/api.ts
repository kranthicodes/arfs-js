import { arGql } from 'ar-gql'
import Transaction from 'arweave/web/lib/transaction'
import { ArweaveSigner, DataItem } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { APIOptions, Wallet } from '../types/api'
import { arweaveInstance } from '../utils/arweaveInstance'
import { arConnectUpload, arweaveUpload, turboUpload } from '../utils/uploaders'
import { apiConfig } from './config'

export class ArFSApi {
  public apiUrl: string
  public wallet: Wallet
  public argql = arGql()
  constructor({ gateway, wallet }: APIOptions) {
    this.apiUrl = gateway ? gateway : apiConfig['default'].url
    this.wallet = wallet
  }

  async getSigner() {
    if (this.wallet === 'use_wallet') {
      const userSigner = new InjectedArweaveSigner(window.arweaveWallet)

      await userSigner.setPublicKey()

      return userSigner
    }

    return new ArweaveSigner(this.wallet)
  }

  async signAndSendAllTransactions(txList: (Transaction | DataItem)[]) {
    const txIds: string[] = []
    const failedTxIndex: number[] = []

    const signer = await this.getSigner()

    for (let i = 0; i < txList.length; i++) {
      const tx = txList[i]

      try {
        if (this.wallet === 'use_wallet') {
          const txId = await arConnectUpload(tx)
          txIds.push(txId)

          continue
        }
        if (tx instanceof Transaction) {
          await arweaveInstance.transactions.sign(tx, this.wallet)

          const txId = await arweaveUpload(tx)
          txIds.push(txId)
        }
        if (tx instanceof DataItem) {
          await tx.sign(signer)

          const txId = await turboUpload(tx)
          txIds.push(txId)
        }
      } catch (_) {
        failedTxIndex.push(i)
      }
    }

    return { successTxIds: txIds, failedTxIndex }
  }

  
}
