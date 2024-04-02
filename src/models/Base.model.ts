import Transaction, { Tag } from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

import { UnixTime } from '../utils/UnixTime'

export abstract class BaseModel {
  id?: string
  abstract arFS: string
  abstract contentType: string
  abstract driveId: string
  abstract unixTime: UnixTime
  abstract entityType?: 'drive' | 'folder' | 'file' | 'snapshot'

  abstract toTransaction(): Promise<Transaction>
  abstract toDataItem(signer: any): Promise<DataItem>
  abstract toArweaveTags(): Tag[]

  setId(id: string) {
    this.id = id
  }
}

export interface BaseModelProps {
  arFS: string
  contentType: string
  driveId: string
  unixTime: UnixTime
  entityType?: EntityType
}

export type EntityType = 'drive' | 'folder' | 'file' | 'snapshot'
