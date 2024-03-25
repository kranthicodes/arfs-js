import { ArFSApi } from '../api'
import { Drive, Folder } from '../models'

export class DriveService {
  api: ArFSApi
  constructor(api: ArFSApi) {
    this.api = api
  }

  async create() {
    const drive = Drive.create('testDrive')
    const rootFolder = Folder.create({ name: 'testFolder', driveId: drive.driveId })
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

  async listAll(){
    
  }
}
