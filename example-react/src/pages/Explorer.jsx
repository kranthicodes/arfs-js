import React from 'react'
import { useArFS } from '../lib/arfs/arfs-context'
import Drive from './components/Drive'
import useWallet from '../lib/wallet-provider/useWallet'
import Folder from './components/Folder'
import File from './components/File'

export default function ExplorerPage() {
  const [drives, setDrives] = React.useState([])
  const [selectedDrive, setSelectedDrive] = React.useState(null)
  const [selectedFolderId, setSelectedFolderId] = React.useState(null)
  const [folderEntities, setFolderEntities] = React.useState([])
  const { arfsClient } = useArFS()
  const { connected } = useWallet()

  React.useEffect(() => {
    if (connected) {
      fetchAllDrives()
    }
  }, [connected])

  React.useEffect(() => {
    if (selectedDrive && selectedFolderId) {
      fetchAllEntitiesInFolder()
    }
  }, [selectedDrive, selectedFolderId])

  async function fetchAllDrives() {
    try {
      const drives = await arfsClient.drive.listAll()
      console.log({ drives })
      setDrives(drives || [])
    } catch (error) {
      console.log({ error })
    }
  }

  async function fetchAllEntitiesInFolder() {
    try {
      const entities = await arfsClient.folder.listAll(selectedFolderId, selectedDrive.driveId)
      console.log({ entities })
      setFolderEntities(entities || [])
    } catch (error) {
      console.log({ error })
    }
  }

  async function handleDriveClick(drive) {
    const rootFolderId = drive.rootFolderId

    setSelectedFolderId(rootFolderId)
    setSelectedDrive(drive)
  }

  async function handleFolderClick(folder) {
    setSelectedFolderId(folder.folderId)
  }

  async function handleFileClick(file) {
    const dataTxId = file.dataTxId

    window.open(`https://arweave.net/${dataTxId}`, '_blank')
  }

  return (
    <div className="w-full">
      <div className="m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
        <div className="flex py-2 px-2">
          {!selectedDrive && <h1 className="text-xl">Explorer</h1>}
          {selectedDrive && <h1 className="text-xl">Drive: {selectedDrive.name}</h1>}
        </div>
      </div>
      {!selectedFolderId && (
        <div className="p-4 min-h-[400px] gap-6 flex justify-start items-start m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
          {drives.map((drive, idx) => (
            <Drive handleDriveClick={handleDriveClick} key={idx} instance={drive} />
          ))}
        </div>
      )}
      {selectedFolderId && (
        <div className="p-4 min-h-[400px] gap-6 flex justify-start items-start m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
          {folderEntities.map((entity, idx) =>
            entity.entityType === 'folder' ? (
              <Folder handleFolderClick={handleFolderClick} key={idx} instance={entity} />
            ) : entity.entityType === 'file' ? (
              <File handleFileClick={handleFileClick} key={idx} instance={entity} />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
