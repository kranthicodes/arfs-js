import { Tag } from 'arweave/web/lib/transaction'
import { v4 as uuidv4 } from 'uuid'
import { createData } from 'warp-arbundles'

import { arweaveInstance } from '../utils/arweaveInstance'
import { toArweaveTags } from '../utils/arweaveTagsUtils'
import { getUnixTime, UnixTime } from '../utils/UnixTime'
import { BaseModel, BaseModelProps } from './Base.model'

export interface DriveOptions extends BaseModelProps {
  drivePrivacy?: 'public'
  name: string // User defined drive name
  rootFolderId?: string // UUID of the drive root folder
}

export type DriveMetaData = {
  name: string // User defined drive name
  rootFolderId: string // UUID of the drive root folder
}

export class Drive extends BaseModel {
  arFS: string
  contentType: string
  driveId: string
  drivePrivacy: 'public'
  entityType: 'drive'
  unixTime: UnixTime
  name: string
  rootFolderId?: string

  constructor({ arFS, contentType, driveId, unixTime, name, rootFolderId }: DriveOptions) {
    super()

    this.arFS = arFS
    this.contentType = contentType
    this.driveId = driveId
    this.drivePrivacy = 'public'
    this.unixTime = unixTime
    this.entityType = 'drive'

    this.name = name
    this.rootFolderId = rootFolderId
  }

  static create(name: string, rootFolderId?: string): Drive {
    const arFS = '0.13' // Assuming a fixed version for this example
    const contentType = 'application/json' // Default content type
    const driveId = uuidv4() // Generate a unique drive ID
    const unixTime = getUnixTime() // Current Unix time in seconds

    return new Drive({
      arFS,
      contentType,
      driveId,
      unixTime,
      name,
      rootFolderId
    })
  }

  async toTransaction() {
    const tags = this.toArweaveTags() as Tag[]

    const tx = await arweaveInstance.createTransaction({
      data: JSON.stringify({ name: this.name, rootFolderId: this.rootFolderId })
    })
    for (const tag of tags) tx.addTag(tag.name, tag.value)

    return tx
  }

  async toDataItem(signer: any) {
    const tags = this.toArweaveTags() as Tag[]

    return createData(JSON.stringify({ name: this.name, rootFolderId: this.rootFolderId }), signer, { tags })
  }

  toArweaveTags() {
    return toArweaveTags(this) as Tag[]
  }

  getMetaData() {
    const { name, rootFolderId } = this

    return {
      name,
      rootFolderId
    }
  }

  // Additional methods for drive management
}
