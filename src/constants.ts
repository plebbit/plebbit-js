export enum STORAGE_KEYS {
    INTERNAL_COMMUNITY, // InternalCommunityType
    PERSISTENT_DELETED_COMMUNITIES, // These are basically community db files that we're unable to remove for some reason on windows
    LAST_IPNS_RECORD, // The last published IPNS record of the community, updated everytime we publish a new one
    COMBINED_HASH_OF_PENDING_COMMENTS, // hash of all cids of pending comments. This is used to decide to publish a new mod queue or not
    EXPORTS, // CommunityExportRecord[] — backups of this community produced by community.export(); persisted so they survive process restart
    // The anchor record An -> Mn of a delegated community, signed by the owner's As and handed to us
    // through publishAnchorRecord. Deliberately NOT LAST_IPNS_RECORD: that one holds this node's own
    // minter record, a different name with an independent sequence space. See docs/protocol/delegated-ipns.md.
    ANCHOR_IPNS_RECORD,
    // Highest anchor sequence this node has ever accepted. Kept separately from the record above so a
    // rollback is refused even if the record itself is missing, and because kubo reports success for a
    // put it discards, which makes anti-rollback ours to enforce.
    HIGHEST_ACCEPTED_ANCHOR_SEQUENCE
}

// Configs for LRU storage

// The largest CommentUpdate a client will accept off a gateway. It lives here rather than beside the
// comment clients manager that enforces it because the node runtime reads it too, and importing a clients
// manager for one number put a class-extends cycle on the eager import path: base-client-manager pulls in
// the node util, which pulled in the comment clients manager, which reaches PKCClientsManager extending
// BaseClientsManager before that module has finished evaluating.
export const MAX_FILE_SIZE_BYTES_FOR_COMMENT_UPDATE = 1024 * 1024;
