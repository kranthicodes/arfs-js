import { arGql } from 'ar-gql'

import { TypeIndex, typeIndex } from './types'

export type QueryBuilderOptions = {
  apiUrl: string
  address: string
}

export class QueryBuilder {
  public apiUrl: string
  public address: string
  public argql = arGql()

  constructor({ apiUrl, address }: QueryBuilderOptions) {
    this.apiUrl = apiUrl
    this.address = address
  }

  async query(type: TypeIndex, options: QueryOptions = {}) {
    const queryString = typeIndex[type]

    if (!options.address) {
      options.address = this.address
    }

    return this.argql.all(queryString, options)
  }
}

export type QueryOptions = Record<string, unknown>
