import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { File, FileMetaData, Folder, FolderMetaData, IFileProps, IFolderProps } from '../models'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { getEntityTypeFromTags } from '../utils/getEntityTypeFromTags'
import { getUniqueEntities } from '../utils/getUniqueEntities'

export class FolderService {
  api: ArFSApi
  constructor(api: ArFSApi) {
    this.api = api
  }

  async create(name: string, { parentFolderId, driveId }: CreateFolderOptions) {
    const folder = Folder.create({ name, driveId: driveId, parentFolderId })

    const folderDataItem = await folder.toTransaction()

    const response = await this.api.signAndSendAllTransactions([folderDataItem])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new folder.')
    }

    return folder
  }

  async listAll(folderId: string, driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: (File | Folder)[] = []

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_ALL_ENTITIES_IN_FOLDER', { folderId, driveId })

      for (const entityGql of entitiesGql) {
        const entityInstance = await this.#transactionToEntityInstance(entityGql.node.id, entityGql.node.tags as Tag[])

        if (!entityInstance) throw 'Failed to contruct entity instance'

        response.push(entityInstance)
      }
    } catch (error) {
      throw new Error('Failed to get user folders and files.')
    }

    response = getUniqueEntities(response)

    return response
  }

  async get(folderId: string, driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: Folder | null = null

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_FOLDER_BY_ID', { folderId, driveId })

      if (!entitiesGql.length) {
        return null
      }

      const folderInstance = await this.#transactionToEntityInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = folderInstance as Folder
    } catch (error) {
      throw new Error('Failed to get folder.')
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
}

export type CreateFolderOptions = {
  parentFolderId: string
  driveId: string
}