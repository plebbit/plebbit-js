export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS, // These are basically sub db files that we're unable to remove for some reason on windows
    LAST_IPNS_RECORD // The last published IPNS record of the sub, updated everytime we publish a new one
}

// Configs for LRU storage
