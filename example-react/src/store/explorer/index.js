import { getArFSClient } from '../../utils/getArFSClient'

const initialExplorerState = {
  drives: [],
  selectedDrive: null,
  selectedFolder: null,
  folderEntities: [],
  pathEntities: [],
  isSyncing: false
}

const createExplorerSlice = (set, get) => ({
  explorerState: initialExplorerState,
  explorerActions: {
    syncAllUserDrives: async () => {
      const userAddress = get().authState.address
      const isSyncing = get().explorerState.isSyncing

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }

      const arfsClient = getArFSClient()

      try {
        console.log(arfsClient.api.ready)
        const drives = await arfsClient.drive.listAll()

        set((state) => {
          state.explorerState.drives = drives || []
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    syncAllEntitiesInSelectedFolder: async () => {
      const { selectedDrive, selectedFolder, isSyncing } = get().explorerState

      if (!selectedDrive || !selectedFolder) {
        // TODO: use toast maybe?
        return
      }

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }

      const arfsClient = getArFSClient()

      try {
        const entities = await arfsClient.folder.listAll(selectedFolder.folderId, selectedDrive.driveId)

        set((state) => {
          state.explorerState.folderEntities = entities || []
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    addToPathEntities: (entity) => {
      set((state) => {
        state.explorerState.pathEntities.push(entity)
      })
    },
    removeFromPathEntities: (uptoIdx) => {
      let updatedPathEntities = get().explorerState.pathEntities.slice(0, uptoIdx)
      let selectedFolder = null

      if (updatedPathEntities.length > 0) {
        const lastItem = updatedPathEntities[updatedPathEntities.length - 1]

        if (lastItem.entityType === 'folder') {
          selectedFolder = lastItem
        }

        if (lastItem.entityType === 'drive') {
          updatedPathEntities = []
        }
      }

      if (updatedPathEntities.length === 0) {
        set((state) => {
          state.explorerState.selectedDrive = null
        })
      }

      set((state) => {
        state.explorerState.pathEntities = updatedPathEntities
        state.explorerState.selectedFolder = selectedFolder
      })
    },
    setSelectedFolder: (folder) => {
      set((state) => {
        state.explorerState.selectedFolder = folder
        state.explorerState.pathEntities.push(folder)
      })
    },
    setSelectedDrive: async (drive) => {
      const { isSyncing } = get().explorerState

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }
      const arfsClient = getArFSClient()

      try {
        const folderInstance = await arfsClient.folder.get(drive.rootFolderId, drive.driveId)

        if (!folderInstance) {
          // TODO: use toast maybe?
          throw 'Failed to get root folder instance'
        }

        set((state) => {
          state.explorerState.selectedDrive = drive
          state.explorerState.selectedFolder = folderInstance

          state.explorerState.pathEntities.push(drive)
          state.explorerState.pathEntities.push(folderInstance)
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    setIsSyncing: (value) => {
      set((state) => {
        state.explorerState.isSyncing = value
      })
    }
  }
})

export default createExplorerSlice
