export var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS[STORAGE_KEYS["INTERNAL_SUBPLEBBIT"] = 0] = "INTERNAL_SUBPLEBBIT";
    STORAGE_KEYS[STORAGE_KEYS["PERSISTENT_DELETED_SUBPLEBBITS"] = 1] = "PERSISTENT_DELETED_SUBPLEBBITS"; // These are basically sub db files that we're unable to remove for some reason on windows
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
// Configs for LRU storage
export const postTimestampConfig = {
    cacheName: "plebbitjs_lrustorage_postTimestamp",
    maxItems: 500
};
export const commentPostUpdatesParentsPathConfig = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};
//# sourceMappingURL=constants.js.map