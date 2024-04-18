// import 'fake-indexeddb/auto'

// import { _Window, arweaveWallet } from '../../mocks/windowArWallet'
// import { Drive, Folder } from '../../models'
// import { BiFrost } from '..'

// globalThis.window = _Window as Window & typeof globalThis
// globalThis.arweaveWallet = arweaveWallet
// globalThis.navigator = _Window.navigator
// jest.mock('../../utils/arweaveInstance', () => {
//   const originalModule = jest.requireActual('../../utils/arweaveInstance')

//   originalModule.arweaveInstance.transactions.sign = jest.fn((tx, _) => tx)
//   originalModule.arweaveInstance.transactions.post = jest.fn((_) => ({ status: 200, statusText: 'mocked ar tx post' }))

//   return originalModule
// })

// describe('FS with ArConnect', () => {
//   // Some time later...

//   // Some time later...
//   // const arfsApi = new ArFSApi({ wallet: 'use_wallet' })

//   test('It should read the directory at given path in a drive.', async () => {
//     const drive = Drive.create('test')
//     const rootFolder = Folder.create({ name: 'test', driveId: drive.driveId })
//     drive.rootFolderId = rootFolder.folderId

//     const fs = new BiFrost(drive).fs

//     await fs.promises.writeFile('/test.md', `# test md file`)
//     const res = await fs.promises.readdir('/')

//     console.log({ res })
//   })
// })
