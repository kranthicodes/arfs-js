import { ArFSApi } from './api'
import { DriveService } from './services/drive.service'
import { APIOptions } from './types/api'

export class ArFS {
  public api: ArFSApi
  public drive: DriveService

  constructor({ gateway, wallet }: APIOptions) {
    this.api = new ArFSApi({ gateway, wallet })
    this.drive = new DriveService(this.api)
  }
}
