import { v4 as uuid } from 'uuid'

import { gqlTagNameRecord } from '../constants'
import { EID } from '../EID'
import { UnixTime } from '../UnixTime'

export class DriveBuilder {
  appName: string
  appVersion: string
  arFS: string
  contentType: string
  driveId: string
  drivePrivacy: string
  entityType: string
  name: string
  unixTime: string
  rootFolderId: string | null

  constructor(name: string, rootFolderId?: string) {
    this.arFS = '0.13'
    this.appName = 'ProtocolLand'
    this.appVersion = '0.1'
    this.contentType = 'application/json'
    this.driveId = EID(uuid()).toString()
    this.drivePrivacy = 'public'
    this.entityType = 'drive'
    this.name = name
    this.unixTime = new UnixTime(Math.round(Date.now() / 1000)).toString()
    this.rootFolderId = rootFolderId || null
  }

  toArweaveTags() {
    const tags: any = {}

    for (const key of Object.keys(this)) {
      const tagKey = gqlTagNameRecord[key as keyof typeof gqlTagNameRecord]
      if (tagKey) {
        tags[tagKey] = this[key as keyof typeof this]
      } else {
        tags[key] = this[key as keyof typeof this]
      }
    }
    return tags
  }

  setRootFolder(id: string) {
    this.rootFolderId = id
  }
}
