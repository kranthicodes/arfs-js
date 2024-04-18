import { StatLike } from '../types/fs'
import { EEXIST, EISDIR, ENOENT, ENOTDIR, ENOTEMPTY } from './errors'
import path from './path'

const STAT = 0

export class CacheFS {
  _root: Map<string | number, Map<any, any>> | undefined
  constructor() {}
  _makeRoot(root = new Map()) {
    root.set(STAT, { mode: 0o777, type: 'dir', size: 0, ino: 0, mtimeMs: Date.now() })
    return root
  }
  activate(superblock: string | null | typeof this._root = null) {
    if (superblock === null) {
      this._root = new Map([['/', this._makeRoot()]])
    } else if (typeof superblock === 'string') {
      this._root = new Map([['/', this._makeRoot(this.parse(superblock))]])
    } else {
      this._root = superblock
    }
  }
  get activated() {
    return !!this._root
  }
  deactivate() {
    this._root = void 0
  }
  size() {
    // subtract 1 to ignore the root directory itself from the count.
    if (!this._root) return
    return this._countInodes(this._root.get('/')) - 1
  }
  _countInodes(map: Map<any, any> | undefined) {
    let count = 1
    if (!map) return count

    for (const [key, val] of map) {
      if (key === STAT) continue
      count += this._countInodes(val)
    }

    return count
  }
  autoinc() {
    if (!this._root) return

    const val = this._maxInode(this._root.get('/')) + 1
    return val
  }
  _maxInode(map: Map<any, any> | undefined) {
    if (!map) return 0

    let max = map.get(STAT).ino
    for (const [key, val] of map) {
      if (key === STAT) continue
      max = Math.max(max, this._maxInode(val))
    }
    return max
  }
  print(root: Map<any, any>) {
    if (!this._root) return
    root = root || this._root.get('/')
    let str = ''

    const printTree = (root: Map<any, any>, indent: number) => {
      for (const [file, node] of root) {
        if (file === 0) continue
        const stat = node.get(STAT)
        const mode = stat.mode.toString(8)
        str += `${'\t'.repeat(indent)}${file}\t${mode}`
        if (stat.type === 'file') {
          str += `\t${stat.size}\t${stat.mtimeMs}\n`
        } else {
          str += `\n`
          printTree(node, indent + 1)
        }
      }
    }
    printTree(root, 0)
    return str
  }
  parse(print: string) {
    let autoinc = 0

    function mk(stat: any) {
      const ino = ++autoinc
      // TODO: Use a better heuristic for determining whether file or dir
      const type = stat.length === 1 ? 'dir' : 'file'
      let [mode, size, mtimeMs] = stat
      mode = parseInt(mode, 8)
      size = size ? parseInt(size) : 0
      mtimeMs = mtimeMs ? parseInt(mtimeMs) : Date.now()
      return new Map([[STAT, { mode, type, size, mtimeMs, ino }]])
    }

    const lines = print.trim().split('\n')
    const _root = this._makeRoot()
    const stack = [
      { indent: -1, node: _root },
      { indent: 0, node: null }
    ]
    for (let line of lines) {
      const prefix = line.match(/^\t*/)![0]
      const indent = prefix.length
      line = line.slice(indent)
      const [filename, ...stat] = line.split('\t')
      const node = mk(stat)
      if (indent <= stack[stack.length - 1].indent) {
        while (indent <= stack[stack.length - 1].indent) {
          stack.pop()
        }
      }
      stack.push({ indent, node })
      const cd = stack[stack.length - 2].node
      cd!.set(filename, node)
    }
    return _root
  }
  _lookup(filepath: string, follow = true) {
    if (!this._root) return

    let dir: typeof this._root = this._root
    let partialPath = '/'
    const parts = path.split(filepath)
    for (let i = 0; i < parts.length; ++i) {
      const part = parts[i]
      dir = dir.get(part) as typeof this._root
      if (!dir) throw new ENOENT(filepath)
      // Follow symlinks
      if (follow || i < parts.length - 1) {
        const stat = dir.get(STAT) as unknown as StatLike
        if (!stat) throw new ENOENT(filepath)

        if (stat.type === 'symlink') {
          const target = path.resolve(partialPath, stat.target!)
          dir = this._lookup(target) as typeof this._root
        }
        if (!partialPath) {
          partialPath = part
        } else {
          partialPath = path.join(partialPath, part)
        }
      }
    }
    return dir
  }
  mkdir(filepath: string, { mode }: { mode: number }) {
    if (filepath === '/') throw new EEXIST()
    const dir = this._lookup(path.dirname(filepath)) as typeof this._root
    const basename = path.basename(filepath)
    if (dir!.has(basename)) {
      throw new EEXIST()
    }
    const entry = new Map()
    const stat = {
      mode,
      type: 'dir',
      size: 0,
      mtimeMs: Date.now(),
      ino: this.autoinc()
    }
    entry.set(STAT, stat)
    dir!.set(basename, entry)
  }
  rmdir(filepath: string) {
    const dir = this._lookup(filepath) as typeof this._root
    if ((dir!.get(STAT) as unknown as StatLike).type !== 'dir') throw new ENOTDIR()
    // check it's empty (size should be 1 for just StatSym)
    if (dir!.size > 1) throw new ENOTEMPTY()
    // remove from parent
    const parent = this._lookup(path.dirname(filepath))
    const basename = path.basename(filepath)
    parent!.delete(basename)
  }
  readdir(filepath: string) {
    const dir = this._lookup(filepath)
    if ((dir!.get(STAT) as unknown as StatLike).type !== 'dir') throw new ENOTDIR()
    return [...dir!.keys()].filter((key) => typeof key === 'string')
  }
  writeStat(filepath: string, size: number, { mode }: { mode: number }) {
    let ino
    let oldStat
    try {
      oldStat = this.stat(filepath) as unknown as StatLike
    } catch (err) {
      //
    }

    if (oldStat !== undefined) {
      if (oldStat.type === 'dir') {
        throw new EISDIR()
      }

      if (mode == null) {
        mode = oldStat.mode
      }
      ino = oldStat.ino
    }

    if (mode == null) {
      mode = 0o666
    }
    if (ino == null) {
      ino = this.autoinc()
    }
    const dir = this._lookup(path.dirname(filepath))
    const basename = path.basename(filepath)
    const stat = {
      mode,
      type: 'file',
      size,
      mtimeMs: Date.now(),
      ino
    }
    const entry = new Map()
    entry.set(STAT, stat)
    dir!.set(basename, entry)
    return stat
  }
  unlink(filepath: string) {
    // remove from parent
    const parent = this._lookup(path.dirname(filepath))
    const basename = path.basename(filepath)
    parent!.delete(basename)
  }
  rename(oldFilepath: string, newFilepath: string) {
    const basename = path.basename(newFilepath)
    // Note: do both lookups before making any changes
    // so if lookup throws, we don't lose data (issue #23)
    // grab references
    const entry = this._lookup(oldFilepath)
    const destDir = this._lookup(path.dirname(newFilepath))
    // insert into new parent directory
    destDir!.set(basename, entry!)
    // remove from old parent directory
    this.unlink(oldFilepath)
  }
  stat(filepath: string) {
    return this._lookup(filepath)!.get(STAT) as typeof this._root
  }
  lstat(filepath: string) {
    return this._lookup(filepath, false)!.get(STAT) as typeof this._root
  }
  readlink(filepath: string) {
    return (this._lookup(filepath, false)!.get(STAT) as unknown as StatLike).target
  }
  symlink(target: string, filepath: string) {
    let ino, mode
    try {
      const oldStat = this.stat(filepath) as unknown as StatLike
      if (mode === null) {
        mode = oldStat.mode
      }
      ino = oldStat.ino
    } catch (err) {
      //
    }
    if (mode == null) {
      mode = 0o120000
    }
    if (ino == null) {
      ino = this.autoinc()
    }
    const dir = this._lookup(path.dirname(filepath))
    const basename = path.basename(filepath)
    const stat = {
      mode,
      type: 'symlink',
      target,
      size: 0,
      mtimeMs: Date.now(),
      ino
    }
    const entry = new Map()
    entry.set(STAT, stat)
    dir!.set(basename, entry)
    return stat
  }
  _du(dir: typeof this._root) {
    let size = 0
    for (const [name, entry] of dir!.entries()) {
      if (name === STAT) {
        size += entry.size
      } else {
        size += this._du(entry)
      }
    }
    return size
  }
  du(filepath: string) {
    const dir = this._lookup(filepath)
    return this._du(dir)
  }
}
