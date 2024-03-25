import { ArFS } from '../../dist'

const arfs = new ArFS({ gateway: 'https://arweave.net' })
const res = arfs.drive.create()
console.log('hello world', res)
