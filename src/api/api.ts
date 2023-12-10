import { apiConfig } from './config'

export class ArFSApi {
  public apiUrl: string

  constructor(gateway?: string) {
    this.apiUrl = gateway ? gateway : apiConfig['default'].url
  }
}
