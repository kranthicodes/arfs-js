import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { Drive, DriveMetaData, DriveOptions, Folder } from '../models'
import { toModelObject } from '../utils/arweaveTagsUtils'

export class DriveService {
  api: ArFSApi
  constructor(api: ArFSApi) {
    this.api = api
  }

  async create(name: string) {
    const drive = Drive.create(name)
    const rootFolder = Folder.create({ name, driveId: drive.driveId })
    drive.rootFolderId = rootFolder.folderId

    const signer = await this.api.getSigner()

    const driveDataItem = await drive.toDataItem(signer)
    const rootFolderDataItem = await rootFolder.toDataItem(signer)

    const response = await this.api.signAndSendAllTransactions([driveDataItem, rootFolderDataItem])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new drive.')
    }

    return drive
  }

  async listAll() {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: Drive[] = []

    try {
      const drivesGql = await this.api.queryEngine.query('GET_ALL_USER_DRIVES')

      for (const driveGql of drivesGql) {
        const driveInstance = await this.#transactionToDriveInstance(driveGql.node.id, driveGql.node.tags as Tag[])

        response.push(driveInstance)
      }
    } catch (error) {
      throw new Error('Failed to get user drives.')
    }

    response = response.filter((v, i, a) => a.findIndex((v2) => v2.driveId === v.driveId) === i)

    return response
  }

  async #transactionToDriveInstance(txId: string, tags: Tag[]): Promise<Drive> {
    try {
      const txRes = await fetch(`https://arweave.net/${txId}`)
      const data = (await txRes.json()) as DriveMetaData

      const modelObject = toModelObject<DriveOptions>(tags)

      return new Drive({ ...modelObject, name: data.name, rootFolderId: data.rootFolderId })
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }
}
