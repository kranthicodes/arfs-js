export const GET_ALL_ENTITIES_IN_DRIVE = `
query($cursor: String $address: String! $driveId: String!) {
    transactions(        
      after: $cursor
      first: 100
      tags: [
        { name: "Drive-Id", values: [$driveId] }
        { name: "Entity-Type", values: ["folder", "file"] }
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
