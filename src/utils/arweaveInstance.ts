import Arweave from 'arweave/web'

export const arweaveInstance = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})
