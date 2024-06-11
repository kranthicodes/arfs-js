import { ArFSApi } from '../api'
import { EntityKey } from './EntityKey'

export class Crypto {
  api: ArFSApi

  constructor(api: ArFSApi) {
    this.api = api
  }

  async encryptEntity(data: Buffer, entityKey: EntityKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encryptedEntityBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      entityKey.cryptoKey,
      data
    )

    return {
      cipher: 'AES256-GCM',
      cipherIV: Buffer.from(iv).toString('base64'),
      data: encryptedEntityBuffer
    }
  }

  async decryptEntity(entityKey: EntityKey, iv: string, data: Buffer) {
    const cipherIV: Buffer = Buffer.from(iv, 'base64')

    const decryptedEntity = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: cipherIV },
      entityKey.cryptoKey,
      data
    )

    return decryptedEntity
  }
}
