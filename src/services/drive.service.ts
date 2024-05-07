import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { Drive, DriveMetaData, DriveOptions, Folder } from '../models'
import { toModelObject } from '../utils/arweaveTagsUtils'

export class DriveService {
  api: ArFSApi
  tags: Tag[] = []
  constructor(api: ArFSApi, tags: Tag[] = []) {
    this.api = api
    this.tags = tags
  }

  async create(name: string) {
    const drive = Drive.create(name)
    const rootFolder = Folder.create({ name, driveId: drive.driveId })
    drive.rootFolderId = rootFolder.folderId

    const driveDataItem = await drive.toTransaction(this.tags)
    const rootFolderDataItem = await rootFolder.toTransaction(this.tags)

    const response = await this.api.signAndSendAllTransactions([driveDataItem, rootFolderDataItem])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new drive.')
    }

    drive.setId(response.successTxIds[0])

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

  async get(driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: Drive | null = null

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_USER_DRIVE_BY_ID', { driveId })

      if (!entitiesGql.length) {
        return null
      }

      const driveInstance = await this.#transactionToDriveInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = driveInstance as Drive
    } catch (error) {
      throw new Error('Failed to get folder.')
    }

    return response
  }

  async #transactionToDriveInstance(txId: string, tags: Tag[]): Promise<Drive> {
    try {
      const txRes = await fetch(`https://arweave.net/${txId}`)
      const data = (await txRes.json()) as DriveMetaData

      const modelObject = toModelObject<DriveOptions>(tags)

      const instance = new Drive({ ...modelObject, name: data.name, rootFolderId: data.rootFolderId })
      instance.setId(txId)

      return instance
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }
}
