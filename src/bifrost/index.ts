import FS from '@isomorphic-git/lightning-fs'

import { ArFS } from '../arfs'
import { Drive, Folder } from '../models'
import { Entity, EntityMap } from '../types/model'
import { getUniqueEntities } from '../utils/getUniqueEntities'
import { Backend } from './Backend'

export class BiFrost {
  selectedDrive: Drive
  backend: Backend
  fs: FS
  arfs: ArFS
  driveState: EntityMap | null = null

  constructor(drive: Drive, arfs: ArFS) {
    this.arfs = arfs
    this.selectedDrive = drive

    this.fs = new FS()
    this.backend = new Backend(drive, arfs)
    //@ts-expect-error ignore backend
    this.fs.init(drive.name, { backend: this.backend })
  }

  async syncDrive() {
    if (!this.driveState) {
      throw new Error('Drive state not found. Please build the drive state first.')
    }

    for (const path in this.driveState) {
      const instance = this.driveState[path]

      if (instance.entityType === 'folder') {
        try {
          //@ts-expect-error types
          await this.fs.promises.mkdir(path, { writeToArFS: false })
        } catch (error: any) {
          if (error.code === 'EEXIST') {
            // ignore
          } else {
            throw new Error(error)
          }
        }
      } else if (instance.entityType === 'file') {
        //@ts-expect-error types
        await this.fs.promises.writeFile(path, null, { writeToArFS: false, dataTxId: instance.dataTxId })
      }
    }
  }

  async buildDriveState() {
    const rootFolderId = this.selectedDrive.rootFolderId as string
    let entityMap: EntityMap = {}

    try {
      let rootEntities = await this.arfs.folder.listAll(rootFolderId, this.selectedDrive.driveId)
      rootEntities = getUniqueEntities(rootEntities || [])

      entityMap = await this.#buildEntityPaths(rootEntities || [])
    } catch (error) {
      //
      throw new Error('Failed to build drive state.')
    }

    await this.backend._saveDriveState(entityMap)

    this.driveState = entityMap

    return entityMap
  }

  async #buildEntityPaths(entities: Entity[], currentPath: string = '/') {
    const entityMap: EntityMap = {}

    for (const entity of entities) {
      if (entity.entityType === 'drive') continue

      const fullPath = `${currentPath}${entity.name}`
      entityMap[fullPath] = entity

      if (entity.entityType === 'folder') {
        const folder = entity as Folder // Assuming FolderEntity is your folder type
        const subEntities = await this.arfs.folder.listAll(folder.folderId, this.selectedDrive.driveId)

        const subEntityMap = await this.#buildEntityPaths(subEntities || [], `${fullPath}/`)
        Object.assign(entityMap, subEntityMap)
      }
    }

    return entityMap
  }
}
