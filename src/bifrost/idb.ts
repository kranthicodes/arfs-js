import { clear, close, del, get, set, Store } from '@isomorphic-git/idb-keyval'

export class IdbBackend {
  _database: string
  _storename: string
  _store: Store

  constructor(dbname: string, storename: string) {
    this._database = dbname
    this._storename = storename

    this._store = new Store(this._database, this._storename)
  }
  saveSuperblock(superblock: any) {
    return set('!root', superblock, this._store)
  }
  loadSuperblock() {
    return get('!root', this._store)
  }
  saveDriveState(superblock: any) {
    return set('!drive', superblock, this._store)
  }
  loadDriveState() {
    return get('!drive', this._store)
  }
  readFile(inode: number) {
    return get(inode, this._store)
  }
  writeFile(inode: number, data: any) {
    return set(inode, data, this._store)
  }
  unlink(inode: number) {
    return del(inode, this._store)
  }
  wipe() {
    return clear(this._store)
  }
  close() {
    return close(this._store)
  }
}
