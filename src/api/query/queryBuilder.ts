import { arGql } from 'ar-gql'

export class QueryBuilder{
    public argql = arGql()

    constructor({ gateway, wallet }: APIOptions) {
        this.apiUrl = gateway ? gateway : apiConfig['default'].url
        this.wallet = wallet
      }
}