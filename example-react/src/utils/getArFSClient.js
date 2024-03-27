import { ArFS } from 'arfs-js'

export function getArFSClient() {
  const arfsClient = new ArFS({ wallet: 'use_wallet' })

  return arfsClient
}
