import Transaction, { Tag } from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

export interface IModel {
  toTransaction: () => Promise<Transaction>
  toDataItem: (signer: any) => Promise<DataItem>
  toArweaveTags: () => Tag[]
}
