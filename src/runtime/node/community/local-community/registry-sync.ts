import Logger from "../../../../logger.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { STORAGE_KEYS } from "../../../../constants.js";
import { getCommunityChallengeFromCommunityChallengeSettings } from "../challenges/index.js";
import {
    computePageSortsFingerprint,
    derivePublicPageSorts,
    loadPageSortsForStartedCommunity,
    lookupPageSortFactories,
    type ResolvedPageSorts
} from "../page-sorts/index.js";
import type { LocalCommunity } from "../local-community.js";

// Challenge and page sort factories live in a registry a consumer can change while communities run: bitsocial-cli's
// `challenge install` / `page-sort install` re-import a package and replace its entry in PKC.challenges /
// PKC.pageSorts (issues #410, #411). Challenges are resolved per request so they already run the new code; what goes
// stale is everything derived once: the record's community.challenges, the resolved page sorts and the record's
// community.pageSorts. Each cycle re-derives them here before any CommentUpdate or page is generated.

const PAGE_SORTS_FINGERPRINT_KEY = STORAGE_KEYS[STORAGE_KEYS.PAGE_SORTS_FINGERPRINT];

// Install a freshly resolved settings.pages on the instance: the sorts, the factories they came from (for the
// per-cycle identity check), the record's projection, and the fingerprint a restart compares against.
export async function setResolvedPageSorts(community: LocalCommunity, resolved: ResolvedPageSorts): Promise<void> {
    const pagesSettings = community.settings?.pages;
    community._pageSorts = resolved;
    community._pageSortFactories = lookupPageSortFactories({ pagesSettings, pkc: community._pkc });
    community.pageSorts = derivePublicPageSorts({ pagesSettings, resolved });
    await community._dbHandler.keyvSet(
        PAGE_SORTS_FINGERPRINT_KEY,
        computePageSortsFingerprint({ pagesSettings, resolved, pkc: community._pkc })
    );
}

const sameFactories = (a: readonly unknown[] | undefined, b: readonly unknown[]): boolean =>
    a !== undefined && a.length === b.length && a.every((factory, i) => factory === b[i]);

// Re-resolve settings.pages when the registry no longer holds the factories it was resolved from. With nothing in
// memory (start, or a fresh process) the persisted fingerprint decides instead, so a package replaced while the node
// was down is caught too. A change is handled like a settings.pages edit: every CommentUpdate is regenerated (reply
// pages are only rebuilt for flagged comments) and the record is republished with the new community.pageSorts.
export async function syncPageSortsWithRegistry(community: LocalCommunity): Promise<void> {
    const log = Logger("pkc-js:local-community:registry-sync:page-sorts");
    await community._dbHandler.initDbIfNeeded();
    const pagesSettings = community.settings?.pages;
    const currentFactories = lookupPageSortFactories({ pagesSettings, pkc: community._pkc });
    const inMemory = community._pageSorts !== undefined && community._pageSortFactories !== undefined;
    if (inMemory && sameFactories(community._pageSortFactories, currentFactories)) return;

    const previousFingerprint = community._dbHandler.keyvGet<string>(PAGE_SORTS_FINGERPRINT_KEY);
    const previousPublicPageSorts = deterministicStringify(community.pageSorts ?? null);
    const resolved = await loadPageSortsForStartedCommunity(community); // reports each entry that no longer resolves
    const fingerprint = computePageSortsFingerprint({ pagesSettings, resolved, pkc: community._pkc });
    // In memory, === already proved the registry changed. From disk, a community that predates the fingerprint has
    // nothing to compare with and only takes the baseline, so upgrading pkc-js does not regenerate every board.
    const changed = inMemory || (previousFingerprint !== undefined && previousFingerprint !== fingerprint);
    await setResolvedPageSorts(community, resolved);
    if (changed) {
        log("Page sort factories changed in the registry, regenerating every CommentUpdate", community.address);
        community._dbHandler.forceUpdateOnAllComments();
        community._communityUpdateTrigger = true;
    } else if (deterministicStringify(community.pageSorts ?? null) !== previousPublicPageSorts) community._communityUpdateTrigger = true;
}

// Recompute the record's community.challenges from the registry and republish only if it changed. A challenge whose
// factory is gone keeps the previous record: challenge requests already fail and report it, and an unchanged record
// costs no IPNS publish.
export async function syncChallengesWithRegistry(community: LocalCommunity): Promise<void> {
    const log = Logger("pkc-js:local-community:registry-sync:challenges");
    const challengeSettings = community.settings?.challenges;
    if (!Array.isArray(challengeSettings)) return;
    let challenges: NonNullable<LocalCommunity["challenges"]>;
    try {
        challenges = await Promise.all(
            challengeSettings.map(
                async (cs) =>
                    (await getCommunityChallengeFromCommunityChallengeSettings({ communityChallengeSettings: cs, pkc: community._pkc }))
                        .communityChallenge
            )
        );
    } catch (e) {
        log.error("Could not recompute community.challenges from the registry, keeping the previous ones", community.address, e);
        return;
    }
    if (deterministicStringify(challenges) === deterministicStringify(community.challenges ?? null)) return;
    log("community.challenges changed in the registry, republishing", community.address);
    community.challenges = challenges;
    community._communityUpdateTrigger = true;
}

export async function syncWithRegistries(community: LocalCommunity): Promise<void> {
    await syncChallengesWithRegistry(community);
    await syncPageSortsWithRegistry(community);
}
