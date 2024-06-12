import { ArFSApi } from '../api'
import { EntityKey } from './EntityKey'
import { deriveDriveKey, deriveFileKey } from './utils/keys'

export class Crypto {
  api: ArFSApi

  constructor(api: ArFSApi) {
    this.api = api
  }

  async encryptEntity(data: Buffer, key: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encryptedEntityBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data)

    return {
      cipher: 'AES256-GCM',
      cipherIV: Buffer.from(iv).toString('base64'),
      data: encryptedEntityBuffer
    }
  }

  async decryptEntity(key: CryptoKey, iv: string, data: Buffer) {
    const cipherIV: Buffer = Buffer.from(iv, 'base64')

    const decryptedEntity = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: cipherIV }, key, data)

    return decryptedEntity
  }

  async getDriveKey(driveId: string) {
    return deriveDriveKey(this.api.wallet, driveId)
  }

  async getFileKey(driveKey: EntityKey, fileId: string) {
    return deriveFileKey(driveKey, fileId)
  }
}
