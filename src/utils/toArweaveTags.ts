import { Drive, Folder } from '../models'

export function toArweaveTags(model: Drive | Folder): { name: string; value: string }[] {
  const tags: { name: string; value: string }[] = [
    { name: 'ArFS', value: model.arFS },
    { name: 'Content-Type', value: model.contentType },
    { name: 'Drive-Id', value: model.driveId },
    { name: 'Entity-Type', value: model.entityType },
    { name: 'Unix-Time', value: model.unixTime.toString() }
  ]

  if (model instanceof Drive) {
    // Handle Drive model
    tags.push({ name: 'Drive-Privacy', value: model.drivePrivacy })
  } else if (model instanceof Folder) {
    // Handle Folder model
    tags.push({ name: 'Folder-Id', value: model.folderId })

    if (model.parentFolderId) {
      tags.push({ name: 'Parent-Folder-Id', value: model.parentFolderId })
    }
  }

  return tags
}
