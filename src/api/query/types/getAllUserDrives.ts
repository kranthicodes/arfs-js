export const GET_ALL_USER_DRIVES = `
query($cursor: String $address: String!) {
    transactions(        
      after: $cursor
      first: 100
      tags: [
        { name: "Entity-Type", values: "drive" }
        { name: "Drive-Privacy", values: ["public"] }
      ]
      owners: [$address]
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
            id
            owner {
              address
            }
            bundledIn {
              id
            }
            block {
              height
              timestamp
            }
            tags {
              name
              value
            }
        }
      }
    }
  }
`
