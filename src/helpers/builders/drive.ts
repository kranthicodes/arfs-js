import { v4 as uuid } from 'uuid'

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
  rootFolderId: string

  constructor(name: string, rootFolderId: string) {
    this.arFS = '0.13'
    this.appName = 'ProtocolLand'
    this.appVersion = '0.1'
    this.contentType = 'application/json'
    this.driveId = EID(uuid()).toString()
    this.drivePrivacy = 'public'
    this.entityType = 'drive'
    this.name = name
    this.unixTime = new UnixTime(Math.round(Date.now() / 1000)).toString()
    this.rootFolderId = rootFolderId
  }
}
