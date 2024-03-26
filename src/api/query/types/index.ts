import { GET_ALL_ENTITIES_IN_DRIVE } from './getAllEntitiesInDrive'
import { GET_ALL_SNAPSHOTS_OF_DRIVE } from './getAllSnapshotsOfDrive'
import { GET_ALL_USER_DRIVES } from './getAllUserDrives'
import { GET_USER_DRIVE_BY_ID } from './getUserDriveById'

export const typeIndex = {
  GET_ALL_USER_DRIVES: GET_ALL_USER_DRIVES,
  GET_USER_DRIVE_BY_ID: GET_USER_DRIVE_BY_ID,
  GET_ALL_ENTITIES_IN_DRIVE: GET_ALL_ENTITIES_IN_DRIVE,
  GET_ALL_SNAPSHOTS_OF_DRIVE: GET_ALL_SNAPSHOTS_OF_DRIVE
}

export type TypeIndex = keyof typeof typeIndex
