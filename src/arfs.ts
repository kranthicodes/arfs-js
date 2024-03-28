import { ArFSApi } from './api'
import { DriveService } from './services/drive.service'
import { FileService } from './services/file.service'
import { FolderService } from './services/folder.service'
import { APIOptions } from './types/api'

export class ArFS {
  public api: ArFSApi
  public drive: DriveService
  public folder: FolderService
  public file: FileService

  constructor({ gateway, wallet }: APIOptions) {
    this.api = new ArFSApi({ gateway, wallet })
    this.drive = new DriveService(this.api)
    this.folder = new FolderService(this.api)
    this.file = new FileService(this.api)
  }
}
