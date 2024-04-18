import { decode, encode } from 'isomorphic-textencoder'
import debounce from 'just-debounce-it'

import { ArFS } from '../arfs'
import { Drive, File, Folder } from '../models'
import { BackendInitOptions, EncodingOpts, StatLike } from '../types/fs'
import { EntityMap } from '../types/model'
import { getUnixTime } from '../utils/UnixTime'
import { CacheFS } from './CacheFS'
import { ENOENT, ENOTEMPTY, ETIMEDOUT } from './errors'
import { IdbBackend } from './idb'
import { Mutex } from './Mutex'
import { Mutex as Mutex2 } from './Mutex2'
import path from './path'

export class Backend {
  selectedDrive: Drive
  arfs: ArFS
  saveSuperblock: () => void
  _name: string
  _idb: IdbBackend
  _mutex: Mutex2 | Mutex
  _cache: CacheFS
  _opts: { wipe: boolean | undefined }
  _needsWipe: boolean
  _lastSavedAt: number

  constructor(drive: Drive, arfs: ArFS) {
    this.selectedDrive = drive
    this.arfs = arfs
    this.saveSuperblock = debounce(() => {
      this.flush()
    }, 500)
  }

  async init(
    name: string,
    {
      wipe,
      fileDbName = name,
      fileStoreName = name + '_files',
      lockDbName = name + '_lock',
      lockStoreName = name + '_lock'
    }: BackendInitOptions = {}
  ) {
    this._name = name
    this._idb = new IdbBackend(fileDbName, fileStoreName)
    this._mutex = navigator.locks ? new Mutex2(name) : new Mutex(lockDbName, lockStoreName)
    this._cache = new CacheFS()
    this._opts = { wipe }
    this._needsWipe = !!wipe
  }
  async activate() {
    if (this._cache.activated) return
    // Wipe IDB if requested
    if (this._needsWipe) {
      this._needsWipe = false
      await this._idb.wipe()
      await this._mutex.release({ force: true })
    }
    if (!(await this._mutex.has())) await this._mutex.wait()
    // Attempt to load FS from IDB backend
    const root = (await this._idb.loadSuperblock()) as Map<string | number, Map<any, any>> | string
    if (root) {
      this._cache.activate(root)
    } else {
      // If there is no HTTP backend, start with an empty filesystem
      this._cache.activate()
    }
    if (await this._mutex.has()) {
      return
    } else {
      throw new ETIMEDOUT()
    }
  }
  async deactivate() {
    if (await this._mutex.has()) {
      await this._saveSuperblock()
    }
    this._cache.deactivate()
    try {
      await this._mutex.release()
    } catch (e) {
      console.log(e)
    }
    await this._idb.close()
  }
  async _saveSuperblock() {
    if (this._cache.activated) {
      this._lastSavedAt = Date.now()
      await this._idb.saveSuperblock(this._cache._root)
    }
  }
  async _saveDriveState(state: any) {
    await this._idb.saveDriveState(state)
  }
  _writeStat(filepath: string, size: number, opts: any) {
    const dirparts = path.split(path.dirname(filepath))
    let dir = dirparts.shift()
    for (const dirpart of dirparts) {
      dir = path.join(dir!, dirpart)
      try {
        this._cache.mkdir(dir, { mode: 0o777 })
      } catch (e) {
        //
      }
    }
    return this._cache.writeStat(filepath, size, opts)
  }
  async readFile(filepath: string, opts: EncodingOpts) {
    const encoding = typeof opts === 'string' ? opts : opts && opts.encoding
    if (encoding && encoding !== 'utf8') throw new Error('Only "utf8" encoding is supported in readFile')
    let data: Uint8Array | string | null = null,
      stat = null
    try {
      stat = this._cache.stat(filepath) as unknown as StatLike
      data = (await this._idb.readFile(stat.ino as number)) as Uint8Array
    } catch (e) {
      //
    }
    if (data) {
      if (!stat || stat.size != data.byteLength) {
        stat = await this._writeStat(filepath, data.byteLength, { mode: stat ? stat.mode : 0o666 })
        this.saveSuperblock() // debounced
      }
      if (encoding === 'utf8') {
        data = decode(data)
      } else {
        data.toString = () => decode(data)
      }
    }
    if (!stat) throw new ENOENT(filepath)
    return data
  }
  async writeFile(filepath: string, data: Uint8Array | string | null = null, opts: EncodingOpts) {
    const { mode, encoding = 'utf8', writeToArFS = true, dataTxId, dataContentType } = opts

    if (!data && !writeToArFS && dataTxId) {
      try {
        const res = await fetch(`${this.arfs.api.apiUrl}/${dataTxId}`)
        const dataArrBuf = await res.arrayBuffer()

        data = new Uint8Array(dataArrBuf)
      } catch (error) {
        throw new Error('Failed to fetch file from arweave.')
      }
    }

    if (typeof data === 'string') {
      if (encoding !== 'utf8') {
        throw new Error('Only "utf8" encoding is supported in writeFile')
      }
      data = encode(data) as Uint8Array
    }

    const stat = await this._cache.writeStat(filepath, (data as Uint8Array).byteLength, { mode: mode! })
    await this._idb.writeFile(stat.ino, data)

    if (data && writeToArFS) {
      const driveState = (await this._idb.loadDriveState()) as EntityMap
      const currentFileInstance = driveState[filepath] as File

      if (currentFileInstance) {
        //
        const fileDataArrayBuffer = data.buffer.slice(data.byteOffset, data.byteLength + data.byteOffset)
        const timeStamp = getUnixTime()
        const dataTx = await this.arfs.file.prepareFileTransaction(
          fileDataArrayBuffer,
          currentFileInstance.dataContentType,
          timeStamp.toString()
        )
        const { failedTxIndex: failedDataTxIndex, successTxIds: successDataTxIds } =
          await this.arfs.api.signAndSendAllTransactions([dataTx])

        if (failedDataTxIndex.length !== 0) {
          throw new Error('Failed to create file data tx.')
        }

        const [txid] = successDataTxIds

        if (!txid) {
          throw new Error('Failed to upload file to ArFS.')
        }

        currentFileInstance.dataTxId = txid
        currentFileInstance.lastModifiedDate = timeStamp.valueOf()

        const fileTransaction = await new File({ ...currentFileInstance }).toTransaction()

        const response = await this.arfs.api.signAndSendAllTransactions([fileTransaction])

        if (response.failedTxIndex.length !== 0) {
          throw new Error('Failed to update File instance on ArFS.')
        }

        return
      }

      const parts = filepath.split('/')

      if (parts.length < 2) {
        throw new Error('Invalid path.') // Corrected error message
      }

      const fileName = parts.pop() // Changed from parts[parts.length - 1]
      const parentFolderPath = parts.join('/')

      // Retrieve parent folder ID
      let parentFolderId = this.selectedDrive.rootFolderId as string
      if (parentFolderPath !== '' && driveState) {
        const parentFolder = driveState[parentFolderPath] as Folder
        parentFolderId = parentFolder.folderId
      }

      const fileDataArrayBuffer = data.buffer.slice(data.byteOffset, data.byteLength + data.byteOffset)
      const newFile = await this.arfs.file.create({
        file: fileDataArrayBuffer,
        dataContentType: dataContentType || 'application/octet-stream',
        driveId: this.selectedDrive.driveId,
        name: fileName!,
        parentFolderId,
        size: data.byteLength
      })

      // Update drive state
      const updatedDriveState: EntityMap = driveState ?? {}
      updatedDriveState[filepath] = newFile

      // Save updated drive state
      await this._saveDriveState(updatedDriveState)
    }
  }
  async unlink(filepath: string) {
    const stat = this._cache.lstat(filepath) as unknown as StatLike
    this._cache.unlink(filepath)
    if (stat!.type !== 'symlink') {
      await this._idb.unlink(stat.ino as number)
    }
  }
  readdir(filepath: string) {
    return this._cache.readdir(filepath)
  }
  async mkdir(filepath: string, opts: EncodingOpts) {
    const { mode = 0o777, writeToArFS = true } = opts
    this._cache.mkdir(filepath, { mode })

    if (writeToArFS) {
      const parts = filepath.split('/')

      if (parts.length < 2) {
        throw new Error('Invalid path.') // Corrected error message
      }

      const folderName = parts.pop() // Changed from parts[parts.length - 1]
      const parentFolderPath = parts.join('/')

      // Fetch drive state only if needed
      let driveState: EntityMap | undefined
      if (parentFolderPath !== '') {
        driveState = (await this._idb.loadDriveState()) as EntityMap
      }

      // Retrieve parent folder ID
      let parentFolderId = this.selectedDrive.rootFolderId as string
      if (parentFolderPath !== '' && driveState) {
        const parentFolder = driveState[parentFolderPath] as Folder
        parentFolderId = parentFolder.folderId
      }

      const newFolder = await this.arfs.folder.create(folderName!, {
        parentFolderId,
        driveId: this.selectedDrive.driveId
      })

      // Update drive state
      const updatedDriveState: EntityMap = driveState ?? {}
      updatedDriveState[filepath] = newFolder

      // Save updated drive state
      await this._saveDriveState(updatedDriveState)
    }
  }
  rmdir(filepath: string) {
    // Never allow deleting the root directory.
    if (filepath === '/') {
      throw new ENOTEMPTY()
    }
    this._cache.rmdir(filepath)
  }
  rename(oldFilepath: string, newFilepath: string) {
    this._cache.rename(oldFilepath, newFilepath)
  }
  stat(filepath: string) {
    return this._cache.stat(filepath) as unknown as StatLike
  }
  lstat(filepath: string) {
    return this._cache.lstat(filepath) as unknown as StatLike
  }
  readlink(filepath: string) {
    return this._cache.readlink(filepath) || ''
  }
  symlink(target: string, filepath: string) {
    this._cache.symlink(target, filepath)
  }

  du(filepath: string) {
    return this._cache.du(filepath)
  }
  flush() {
    return this._saveSuperblock()
  }
}
