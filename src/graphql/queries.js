/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSong = /* GraphQL */ `
  query GetSong($key: String!) {
    getSong(key: $key) {
      key
      fileUrl
      fileKey
      listens
      trendingListens
      listOfUidDownVotes
      listOfUidUpVotes
      name
      partOf
      selectedCategory
      selectedCreator
      thumbnail
      thumbnailKey
      createdAt
      updatedAt
    }
  }
`;
export const listSongs = /* GraphQL */ `
  query ListSongs(
    $key: String
    $filter: ModelSongFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSongs(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        key
        fileUrl
        fileKey
        listens
        trendingListens
        listOfUidDownVotes
        listOfUidUpVotes
        name
        partOf
        selectedCategory
        selectedCreator
        thumbnail
        thumbnailKey
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncSongs = /* GraphQL */ `
  query SyncSongs(
    $filter: ModelSongFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncSongs(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        key
        fileUrl
        fileKey
        listens
        trendingListens
        listOfUidDownVotes
        listOfUidUpVotes
        name
        partOf
        selectedCategory
        selectedCreator
        thumbnail
        thumbnailKey
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getCreator = /* GraphQL */ `
  query GetCreator($key: String!) {
    getCreator(key: $key) {
      key
      desc
      facebook
      instagram
      name
      thumbnail
      thumbnailKey
      twitter
      youtube
      createdAt
      updatedAt
    }
  }
`;
export const listCreators = /* GraphQL */ `
  query ListCreators(
    $key: String
    $filter: ModelCreatorFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCreators(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        key
        desc
        facebook
        instagram
        name
        thumbnail
        thumbnailKey
        twitter
        youtube
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncCreators = /* GraphQL */ `
  query SyncCreators(
    $filter: ModelCreatorFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncCreators(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        key
        desc
        facebook
        instagram
        name
        thumbnail
        thumbnailKey
        twitter
        youtube
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($key: String!) {
    getCategory(key: $key) {
      key
      name
      createdAt
      updatedAt
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $key: String
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCategories(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        key
        name
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncCategories = /* GraphQL */ `
  query SyncCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncCategories(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        key
        name
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getAlbum = /* GraphQL */ `
  query GetAlbum($key: String!) {
    getAlbum(key: $key) {
      key
      name
      thumbnail
      thumbnailKey
      createdAt
      updatedAt
    }
  }
`;
export const listAlbums = /* GraphQL */ `
  query ListAlbums(
    $key: String
    $filter: ModelAlbumFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAlbums(
      key: $key
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        key
        name
        thumbnail
        thumbnailKey
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncAlbums = /* GraphQL */ `
  query SyncAlbums(
    $filter: ModelAlbumFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncAlbums(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        key
        name
        thumbnail
        thumbnailKey
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      name
      email
      phone_number
      id
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        name
        email
        phone_number
        id
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        name
        email
        phone_number
        id
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
