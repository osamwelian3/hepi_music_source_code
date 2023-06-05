/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSong = /* GraphQL */ `
  subscription OnCreateSong($filter: ModelSubscriptionSongFilterInput) {
    onCreateSong(filter: $filter) {
      key
      fileUrl
      fileKey
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
export const onUpdateSong = /* GraphQL */ `
  subscription OnUpdateSong($filter: ModelSubscriptionSongFilterInput) {
    onUpdateSong(filter: $filter) {
      key
      fileUrl
      fileKey
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
export const onDeleteSong = /* GraphQL */ `
  subscription OnDeleteSong($filter: ModelSubscriptionSongFilterInput) {
    onDeleteSong(filter: $filter) {
      key
      fileUrl
      fileKey
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
export const onCreateCreator = /* GraphQL */ `
  subscription OnCreateCreator($filter: ModelSubscriptionCreatorFilterInput) {
    onCreateCreator(filter: $filter) {
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
export const onUpdateCreator = /* GraphQL */ `
  subscription OnUpdateCreator($filter: ModelSubscriptionCreatorFilterInput) {
    onUpdateCreator(filter: $filter) {
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
export const onDeleteCreator = /* GraphQL */ `
  subscription OnDeleteCreator($filter: ModelSubscriptionCreatorFilterInput) {
    onDeleteCreator(filter: $filter) {
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
export const onCreateCategory = /* GraphQL */ `
  subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onCreateCategory(filter: $filter) {
      key
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateCategory = /* GraphQL */ `
  subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onUpdateCategory(filter: $filter) {
      key
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteCategory = /* GraphQL */ `
  subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onDeleteCategory(filter: $filter) {
      key
      name
      createdAt
      updatedAt
    }
  }
`;
export const onCreateAlbum = /* GraphQL */ `
  subscription OnCreateAlbum($filter: ModelSubscriptionAlbumFilterInput) {
    onCreateAlbum(filter: $filter) {
      key
      name
      thumbnail
      thumbnailKey
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateAlbum = /* GraphQL */ `
  subscription OnUpdateAlbum($filter: ModelSubscriptionAlbumFilterInput) {
    onUpdateAlbum(filter: $filter) {
      key
      name
      thumbnail
      thumbnailKey
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteAlbum = /* GraphQL */ `
  subscription OnDeleteAlbum($filter: ModelSubscriptionAlbumFilterInput) {
    onDeleteAlbum(filter: $filter) {
      key
      name
      thumbnail
      thumbnailKey
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
      name
      email
      phone_number
      id
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
      name
      email
      phone_number
      id
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
      name
      email
      phone_number
      id
      createdAt
      updatedAt
    }
  }
`;
