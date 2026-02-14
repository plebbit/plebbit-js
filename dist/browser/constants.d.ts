export declare enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT = 0,// InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS = 1,// These are basically sub db files that we're unable to remove for some reason on windows
    LAST_IPNS_RECORD = 2,// The last published IPNS record of the sub, updated everytime we publish a new one
    COMBINED_HASH_OF_PENDING_COMMENTS = 3
}
