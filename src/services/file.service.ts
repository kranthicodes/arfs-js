import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { File, FileMetaData, Folder, FolderMetaData, IFileProps, IFolderProps } from '../models'
import { arweaveInstance } from '../utils/arweaveInstance'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { getEntityTypeFromTags } from '../utils/getEntityTypeFromTags'
import { getUnixTime } from '../utils/UnixTime'

export class FileService {
  api: ArFSApi
  constructor(api: ArFSApi) {
    this.api = api
  }

  async create({ file, ...rest }: CreateFileOptions) {
    let dataTxId = ''
    let pinnedDataOwner

    if (file instanceof ArrayBuffer) {
      // handle self upload and set the dataTxId
      const timeStamp = getUnixTime().toString()
      const dataTx = await this.#prepareFileTransaction(file, rest.dataContentType, timeStamp)
      const { failedTxIndex: failedDataTxIndex, successTxIds: successDataTxIds } =
        await this.api.signAndSendAllTransactions([dataTx])

      if (failedDataTxIndex.length !== 0) {
        throw new Error('Failed to create file data tx.')
      }

      const [txid] = successDataTxIds

      if (!txid) {
        throw new Error('Failed to create a new file.')
      }

      dataTxId = txid
    }

    if (typeof file === 'object' && Object.hasOwn(file, 'dataTxId')) {
      dataTxId = (file as FileData).dataTxId
      pinnedDataOwner = (file as FileData).pinnedDataOwner
    }

    const fileInstance = File.create({ ...rest, dataTxId, pinnedDataOwner })

    const fileTransaction = await fileInstance.toTransaction()

    const response = await this.api.signAndSendAllTransactions([fileTransaction])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new file.')
    }

    return fileInstance
  }

  async get(fileId: string, driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: File | null = null

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_FILE_BY_ID', { fileId, driveId })

      if (!entitiesGql.length) {
        return null
      }

      const fileInstance = await this.#transactionToEntityInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = fileInstance as File
    } catch (error) {
      throw new Error('Failed to get file.')
    }

    return response
  }

  async #transactionToEntityInstance(txId: string, tags: Tag[]): Promise<Folder | File | null> {
    try {
      const txRes = await fetch(`https://arweave.net/${txId}`)
      const data = (await txRes.json()) as FolderMetaData | FileMetaData

      const entityType = getEntityTypeFromTags(tags)

      if (!entityType) throw 'Failed to find entity.'

      if (entityType === 'folder') {
        const modelObject = toModelObject<IFolderProps>(tags)

        return new Folder({ ...modelObject, name: data.name })
      }

      if (entityType === 'file') {
        const modelObject = toModelObject<IFileProps>(tags)

        return new File({ ...modelObject, ...data })
      }

      return null
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }

  async #prepareFileTransaction(file: ArrayBuffer, contentType: string, timestamp: string) {
    const transaction = await arweaveInstance.createTransaction({
      data: file
    })

    transaction.addTag('Unix-Time', timestamp)
    transaction.addTag('Content-Type', contentType)

    return transaction
  }
}

export type CreateFileOptions = {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId: string
  size: number
  dataContentType: string
  file: ArrayBuffer | FileData
}

export type FileData = {
  dataTxId: string
  pinnedDataOwner?: string
}
