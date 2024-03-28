import { Tag } from 'arweave/web/lib/transaction'
import { v4 as uuidv4 } from 'uuid'
import { createData } from 'warp-arbundles'

import { arweaveInstance } from '../utils/arweaveInstance'
import { toArweaveTags } from '../utils/arweaveTagsUtils'
import { getUnixTime } from '../utils/UnixTime'
import { BaseModel, BaseModelProps } from './Base.model'

export interface IFileProps extends BaseModelProps {
  fileId: string
  parentFolderId: string
  name: string // User defined folder name
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
}

export interface CreateFileProps {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId: string
  size: number
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
}

export type FileMetaData = {
  name: string // User defined file name
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
}

export class File extends BaseModel {
  arFS: string
  contentType: string
  driveId: string
  fileId: string
  parentFolderId: string
  entityType: 'file'
  unixTime: ReturnType<typeof getUnixTime>

  name: string
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string

  constructor({
    arFS,
    contentType,
    driveId,
    fileId,
    parentFolderId,
    unixTime,
    name,
    size,
    lastModifiedDate,
    dataTxId,
    dataContentType,
    pinnedDataOwner
  }: IFileProps) {
    super()

    this.arFS = arFS
    this.contentType = contentType
    this.driveId = driveId
    this.fileId = fileId
    this.parentFolderId = parentFolderId
    this.unixTime = unixTime
    this.entityType = 'file'

    this.name = name
    this.size = size
    this.lastModifiedDate = lastModifiedDate
    this.dataTxId = dataTxId
    this.dataContentType = dataContentType
    this.pinnedDataOwner = pinnedDataOwner
  }

  static create(options: CreateFileProps): File {
    const arFS = '0.13' // Assuming a fixed version for this example
    const contentType = 'application/json' // Default content type
    const fileId = uuidv4() // Generate a unique drive ID
    const unixTime = getUnixTime() // Current Unix time in seconds
    const lastModifiedDate = getUnixTime().valueOf() // Current Unix time in seconds

    return new File({
      arFS,
      contentType,
      unixTime,
      fileId,
      lastModifiedDate,
      ...options
    })
  }

  async toTransaction() {
    const tags = this.toArweaveTags() as Tag[]

    const tx = await arweaveInstance.createTransaction({
      data: JSON.stringify({
        name: this.name,
        size: this.size,
        lastModifiedDate: this.lastModifiedDate,
        dataTxId: this.dataTxId,
        dataContentType: this.dataContentType,
        pinnedDataOwner: this.pinnedDataOwner
      })
    })
    for (const tag of tags) tx.addTag(tag.name, tag.value)

    return tx
  }

  async toDataItem(signer: any) {
    const tags = this.toArweaveTags() as Tag[]

    return createData(JSON.stringify({ name: this.name }), signer, { tags })
  }

  toArweaveTags() {
    return toArweaveTags(this) as Tag[]
  }
}
