export const GET_ALL_ENTITIES_IN_FOLDER = `
query($cursor: String $address: String! $driveId: String! $folderId: String!) {
    transactions(        
      after: $cursor
      first: 100
      tags: [
        { name: "Drive-Id", values: [$driveId] }
        { name: "Parent-Folder-Id", values: [$folderId] }
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
