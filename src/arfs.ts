import { ArFSApi } from './api'
import { ArFSOptions } from './types/arfs'

export class ArFS {
  public api: ArFSApi

  constructor({ gateway }: ArFSOptions) {
    this.api = new ArFSApi(gateway)
  }
}
