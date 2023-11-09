import { ModelInit, MutableModel, __modelMeta__, CustomIdentifier, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerSong = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Song, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly fileUrl: string;
  readonly fileKey: string;
  readonly listens?: (string | null)[] | null;
  readonly trendingListens?: (string | null)[] | null;
  readonly listOfUidDownVotes?: (string | null)[] | null;
  readonly listOfUidUpVotes?: (string | null)[] | null;
  readonly name: string;
  readonly partOf?: string | null;
  readonly selectedCategory: string;
  readonly selectedCreator?: string | null;
  readonly thumbnail: string;
  readonly thumbnailKey: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySong = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Song, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly fileUrl: string;
  readonly fileKey: string;
  readonly listens?: (string | null)[] | null;
  readonly trendingListens?: (string | null)[] | null;
  readonly listOfUidDownVotes?: (string | null)[] | null;
  readonly listOfUidUpVotes?: (string | null)[] | null;
  readonly name: string;
  readonly partOf?: string | null;
  readonly selectedCategory: string;
  readonly selectedCreator?: string | null;
  readonly thumbnail: string;
  readonly thumbnailKey: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Song = LazyLoading extends LazyLoadingDisabled ? EagerSong : LazySong

export declare const Song: (new (init: ModelInit<Song>) => Song) & {
  copyOf(source: Song, mutator: (draft: MutableModel<Song>) => MutableModel<Song> | void): Song;
}

type EagerCreator = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Creator, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly desc?: string | null;
  readonly facebook?: string | null;
  readonly instagram?: string | null;
  readonly name: string;
  readonly thumbnail?: string | null;
  readonly thumbnailKey?: string | null;
  readonly twitter?: string | null;
  readonly youtube?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCreator = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Creator, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly desc?: string | null;
  readonly facebook?: string | null;
  readonly instagram?: string | null;
  readonly name: string;
  readonly thumbnail?: string | null;
  readonly thumbnailKey?: string | null;
  readonly twitter?: string | null;
  readonly youtube?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Creator = LazyLoading extends LazyLoadingDisabled ? EagerCreator : LazyCreator

export declare const Creator: (new (init: ModelInit<Creator>) => Creator) & {
  copyOf(source: Creator, mutator: (draft: MutableModel<Creator>) => MutableModel<Creator> | void): Creator;
}

type EagerCategory = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Category, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCategory = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Category, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Category = LazyLoading extends LazyLoadingDisabled ? EagerCategory : LazyCategory

export declare const Category: (new (init: ModelInit<Category>) => Category) & {
  copyOf(source: Category, mutator: (draft: MutableModel<Category>) => MutableModel<Category> | void): Category;
}

type EagerAlbum = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Album, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly name: string;
  readonly thumbnail?: string | null;
  readonly thumbnailKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyAlbum = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Album, 'key'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly key: string;
  readonly name: string;
  readonly thumbnail?: string | null;
  readonly thumbnailKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Album = LazyLoading extends LazyLoadingDisabled ? EagerAlbum : LazyAlbum

export declare const Album: (new (init: ModelInit<Album>) => Album) & {
  copyOf(source: Album, mutator: (draft: MutableModel<Album>) => MutableModel<Album> | void): Album;
}

type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone_number?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone_number?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}