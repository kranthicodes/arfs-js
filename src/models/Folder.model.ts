import { Tag } from 'arweave/web/lib/transaction'
import { v4 as uuidv4 } from 'uuid'
import { createData } from 'warp-arbundles'

import { arweaveInstance } from '../utils/arweaveInstance'
import { toArweaveTags } from '../utils/toArweaveTags'
import { getUnixTime } from '../utils/UnixTime'
import { BaseModel, BaseModelProps } from './Base.model'

export interface IFolderProps extends BaseModelProps {
  folderId: string
  parentFolderId?: string
  name: string // User defined folder name
}

export interface CreateFolderProps {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId?: string
}

export class Folder extends BaseModel {
  arFS: string
  contentType: string
  driveId: string
  folderId: string
  parentFolderId?: string
  entityType: 'folder'
  unixTime: ReturnType<typeof getUnixTime>
  name: string

  constructor({ arFS, contentType, driveId, folderId, parentFolderId, unixTime, name }: IFolderProps) {
    super()

    this.arFS = arFS
    this.contentType = contentType
    this.driveId = driveId
    this.folderId = folderId
    this.parentFolderId = parentFolderId
    this.unixTime = unixTime
    this.entityType = 'folder'

    this.name = name
  }

  static create({ name, driveId, parentFolderId }: CreateFolderProps): Folder {
    const arFS = '0.13' // Assuming a fixed version for this example
    const contentType = 'application/json' // Default content type
    const folderId = uuidv4() // Generate a unique drive ID
    const unixTime = getUnixTime() // Current Unix time in seconds

    return new Folder({
      arFS,
      contentType,
      driveId,
      unixTime,
      name,
      folderId,
      parentFolderId
    })
  }

  async toTransaction() {
    const tags = this.toArweaveTags() as Tag[]

    return await arweaveInstance.createTransaction({
      data: JSON.stringify({ name: this.name }),
      tags: tags
    })
  }

  async toDataItem(signer: any) {
    const tags = this.toArweaveTags() as Tag[]

    return createData(JSON.stringify({ name: this.name }), signer, { tags })
  }

  toArweaveTags() {
    return toArweaveTags(this) as Tag[]
  }
}
