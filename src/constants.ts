import type { LRUStorageConstructor } from "./types.js";

export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS, // These are basically sub db files that we're unable to remove for some reason on windows
    COMMENTS_WITH_INVALID_SCHEMA // Comments in DB with invalid Comment Ipfs schema and have been moved away from comments
}

// Configs for LRU storage

export const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "plebbitjs_lrustorage_postTimestamp",
    maxItems: 500
};

export const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};
