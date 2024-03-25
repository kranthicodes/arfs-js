import { v4 as uuid } from 'uuid'

import { gqlTagNameRecord } from '../constants'
import { EID } from '../EID'
import { UnixTime } from '../UnixTime'

export class FolderBuilder {
  appName: string
  appVersion: string
  arFS: string
  contentType: string
  driveId: string | null
  entityType: string
  name: string
  unixTime: string
  folderId: string
  parentFolderId: string | null

  constructor(name: string, driveId?: string, parentFolderId?: string) {
    this.arFS = '0.13'
    this.appName = 'ProtocolLand'
    this.appVersion = '0.1'
    this.contentType = 'application/json'
    this.driveId = driveId || null
    this.entityType = 'folder'
    this.name = name
    this.unixTime = new UnixTime(Math.round(Date.now() / 1000)).toString()
    this.parentFolderId = parentFolderId || null
    this.folderId = EID(uuid()).toString()
  }

  toArweaveTags() {
    const tags: any = {}

    for (const key of Object.keys(this)) {
      const tagKey = gqlTagNameRecord[key as keyof typeof gqlTagNameRecord]
      if (tagKey) {
        if (this[key as keyof typeof this]) {
          tags[tagKey] = this[key as keyof typeof this]
        }
      } else {
        if (this[key as keyof typeof this]) {
          tags[key] = this[key as keyof typeof this]
        }
      }
    }

    return tags
  }

  setDrive(id: string) {
    this.driveId = id
  }
}
