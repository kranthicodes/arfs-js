import { Tag } from 'arweave/web/lib/transaction'

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
  public appName: string | null = null
  public baseTags: Tag[] = []

  constructor({ gateway, wallet, appName }: APIOptions) {
    if (appName) {
      this.baseTags.push({ name: 'App-Name', value: appName } as Tag)
      this.appName = appName
    }

    this.api = new ArFSApi({ gateway, wallet })
    this.drive = new DriveService(this.api, this.baseTags)
    this.folder = new FolderService(this.api, this.baseTags)
    this.file = new FileService(this.api, this.baseTags)
  }
}
