import { expect } from "chai";
import { describe, it, afterEach, beforeAll, vi } from "vitest";
import * as util from "../../../dist/node/util.js";
import * as pagesUtil from "../../../dist/node/pages/util.js";
import * as signatures from "../../../dist/node/signer/signatures.js";

vi.mock("../../../dist/node/runtime/node/util.js", () => ({
    nativeFunctions: { fetch: vi.fn() },
    calculateExpectedSignatureSize: vi.fn(() => 0),
    calculateInlineRepliesBudget: vi.fn(() => 0),
    deriveCommentIpfsFromCommentTableRow: vi.fn((row) => row),
    getThumbnailPropsOfLink: vi.fn(),
    importSignerIntoKuboNode: vi.fn(),
    moveSubplebbitDbToDeletedDirectory: vi.fn()
}));

let LocalSubplebbit;

const VALID_CID_A = "QmYwAPJzv5CZsnAzt8auVTLcAckU4iigFsMNBvYHiYAv5k";
const VALID_CID_B = "QmZtrqcSJR25CzAJhDigw1VE3DybMTDfjQX5nGoK2cHpik";

function createStubKuboClient() {
    const removedBlocks = [];
    const pinRmCalls = [];
    const blockRm = vi.fn(async function* (cids) {
        for (const cid of cids) {
            removedBlocks.push(cid);
            yield { cid };
        }
    });

    const kuboClient = {
        _client: {
            block: { rm: blockRm },
            pin: {
                rm: vi.fn(async (cid) => {
                    pinRmCalls.push(cid);
                })
            },
            files: {
                stat: vi.fn(),
                flush: vi.fn(),
                write: vi.fn(),
                rm: vi.fn()
            },
            name: {
                publish: vi.fn(async (path) => ({ name: "stub-key", value: path }))
            }
        },
        url: "kubo-url",
        removedBlocks,
        pinRmCalls
    };

    return kuboClient;
}

function createTestSubplebbit(overrides = {}) {
    const kuboClient = createStubKuboClient();

    const subplebbit = Object.assign(Object.create(LocalSubplebbit.prototype), {
        address: overrides.address || "test-address",
        _cidsToUnPin: new Set(),
        _mfsPathsToRemove: new Set(),
        _blocksToRm: [],
        _pendingEditProps: [],
        _subplebbitUpdateTrigger: true,
        _firstUpdateAfterStart: false,
        _plebbit: { publishInterval: 20, _timeouts: { "page-ipfs": 1000 } },
        raw: { subplebbitIpfs: {} },
        modQueue: { resetPages: vi.fn() },
        settings: { challenges: [] },
        lastPostCid: undefined,
        lastCommentCid: undefined,
        _clientsManager: {
            getDefaultKuboRpcClient: vi.fn(() => kuboClient),
            updateKuboRpcState: vi.fn(),
            updateKuboRpcPubsubState: vi.fn()
        },
        _dbHandler: {
            createTransaction: vi.fn(),
            queryLatestPostCid: vi.fn().mockReturnValue(undefined),
            queryLatestCommentCid: vi.fn().mockReturnValue(undefined),
            commitTransaction: vi.fn(),
            querySubplebbitStats: vi.fn().mockReturnValue({})
        },
        _pageGenerator: {
            generateModQueuePages: vi.fn().mockResolvedValue(undefined),
            generateSubplebbitPosts: vi.fn().mockResolvedValue(undefined)
        },
        signer: {
            ipnsKeyName: "test-key",
            address: "12D3KooStubAddress",
            publicKey: "stub-public-key",
            privateKey: "stub-private-key",
            shortAddress: "stub-short",
            type: "ed25519"
        },
        _calculateLatestUpdateTrigger: vi.fn(function () {
            this._subplebbitUpdateTrigger = true;
        })
    });

    subplebbit._toJSONIpfsBaseNoPosts = vi.fn(() => ({
        address: subplebbit.address,
        createdAt: 0,
        updatedAt: 0,
        title: "test title",
        description: "test description",
        rules: [],
        features: {},
        roles: {},
        suggested: [],
        settings: subplebbit.settings,
        protocolVersion: "1"
    }));
    subplebbit._updateDbInternalState = vi.fn();
    subplebbit._updateIpnsPubsubPropsIfNeeded = vi.fn();
    subplebbit._validateSubSizeSchemaAndSignatureBeforePublishing = vi.fn();
    subplebbit.initSubplebbitIpfsPropsNoMerge = vi.fn();
    subplebbit._resolveIpnsAndLogIfPotentialProblematicSequence = vi.fn();
    subplebbit._calculateNewPostUpdates = vi.fn().mockResolvedValue(undefined);
    subplebbit._changeStateEmitEventEmitStateChangeEvent = vi.fn();

    return { subplebbit, kuboClient };
}

describe("local subplebbit garbage collection", () => {
    beforeAll(async () => {
        ({ LocalSubplebbit } = await import("../../../dist/node/runtime/node/subplebbit/local-subplebbit.js"));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("collects purged comment tree cids, mfs paths, and blocks for cleanup", async () => {
        const { subplebbit } = createTestSubplebbit();
        const purgeCid = VALID_CID_A;
        const replyCids = [VALID_CID_B, "QmReplyExtraCid11111111111111111111111111111111111"];
        const iterateSpy = vi.spyOn(pagesUtil, "iterateOverPageCidsToFindAllCids").mockResolvedValue(replyCids);

        await subplebbit._addAllCidsUnderPurgedCommentToBeRemoved({
            commentTableRow: { cid: purgeCid },
            commentUpdateTableRow: {
                postUpdatesBucket: 86400,
                replies: { pageCids: { best: "QmRepliesPage" } }
            }
        });

        expect(Array.from(subplebbit._cidsToUnPin)).to.include.members([purgeCid, ...replyCids]);
        expect(subplebbit._blocksToRm).to.include.members([purgeCid, ...replyCids]);
        expect(subplebbit._mfsPathsToRemove.has(`/${subplebbit.address}/postUpdates/86400/${purgeCid}/update`)).to.equal(true);
        expect(iterateSpy.mock.calls.length).to.equal(1);
    });

    it("unpins stale cids and clears the queue even when pins are already removed", async () => {
        const { subplebbit, kuboClient } = createTestSubplebbit();
        const cidsToUnpin = [VALID_CID_A, VALID_CID_B];
        subplebbit._cidsToUnPin = new Set(cidsToUnpin);

        kuboClient._client.pin.rm = vi.fn(async (cid) => {
            if (cid === VALID_CID_B) {
                const error = new Error("not pinned: already removed");
                throw error;
            }
        });

        await subplebbit._unpinStaleCids();

        expect(kuboClient._client.pin.rm.mock.calls.length).to.equal(2);
        expect(subplebbit._cidsToUnPin.size).to.equal(0);
    });

    it("removes queued MFS paths and keeps pending ones when files are missing", async () => {
        const { subplebbit, kuboClient } = createTestSubplebbit();
        const toDelete = ["/sub/remove/first", "/sub/remove/second"];
        subplebbit._mfsPathsToRemove = new Set(toDelete);

        const removeSpy = vi.spyOn(util, "removeMfsFilesSafely").mockResolvedValue();
        const removed = await subplebbit._rmUnneededMfsPaths();

        expect(removeSpy.mock.calls[0][0].paths).to.deep.equal(toDelete);
        expect(removed).to.have.members(toDelete);
        expect(subplebbit._mfsPathsToRemove.size).to.equal(0);

        const missingError = new Error("file does not exist");
        removeSpy.mockRejectedValueOnce(missingError);
        subplebbit._mfsPathsToRemove = new Set(toDelete);

        const missingResult = await subplebbit._rmUnneededMfsPaths();

        expect(missingResult).to.have.members(toDelete);
        expect(removeSpy.mock.calls.length).to.equal(2);
        expect(subplebbit._mfsPathsToRemove.size).to.equal(toDelete.length);
        expect(kuboClient._client.files.rm.mock.calls.length).to.equal(0);
    });

    it("clears block removal queue during an IPNS update", async () => {
        const { subplebbit } = createTestSubplebbit();
        subplebbit._blocksToRm = [VALID_CID_A, VALID_CID_B];

        const retrySpy = vi.spyOn(util, "retryKuboIpfsAddAndProvide");
        retrySpy.mockResolvedValueOnce({ path: "QmStatsCid0000000000000000000000000000000000", size: 5 });
        retrySpy.mockResolvedValueOnce({ path: "QmNewUpdateCid000000000000000000000000000000", size: 5 });

        vi.spyOn(signatures, "signSubplebbit").mockResolvedValue({
            signature: "sig",
            publicKey: "pk",
            signedPropertyNames: [],
            type: "ed25519"
        });

        const removeBlocksSpy = vi.spyOn(util, "removeBlocksFromKuboNode");

        await subplebbit.updateSubplebbitIpnsIfNeeded([]);

        expect(removeBlocksSpy.mock.calls.length).to.equal(1);
        expect(subplebbit._blocksToRm).to.deep.equal([]);
        expect(subplebbit.updateCid).to.equal("QmNewUpdateCid000000000000000000000000000000");
        expect(subplebbit._subplebbitUpdateTrigger).to.equal(false);
    });

    it("delete() unpins all tracked cids and removes the subplebbit MFS path", async () => {
        const pinRmCalls = [];
        const kuboClient = {
            _client: {
                pin: { rm: vi.fn(async (cid) => pinRmCalls.push(cid)) },
                key: { rm: vi.fn(async () => {}) },
                files: { rm: vi.fn(async () => {}) }
            },
            url: "mock-kubo"
        };

        const removeMfsSpy = vi.spyOn(util, "removeMfsFilesSafely").mockResolvedValue();
        const runtimeNodeUtil = await import("../../../dist/node/runtime/node/util.js");
        const moveDbSpy = runtimeNodeUtil.moveSubplebbitDbToDeletedDirectory;

        const subplebbit = Object.assign(Object.create(LocalSubplebbit.prototype), {
            address: "test-sub-delete",
            state: "stopped",
            signer: { ipnsKeyName: "key-name", address: "12D3KooMock" },
            _plebbit: { _startedSubplebbits: {}, _updatingSubplebbits: {} },
            _clientsManager: { getDefaultKuboRpcClient: vi.fn(() => kuboClient) },
            _cidsToUnPin: new Set(),
            _mfsPathsToRemove: new Set(),
            _blocksToRm: [],
            raw: { subplebbitIpfs: { posts: { pageCids: { hot: "QmPostsPage" }, pages: {} } } },
            statsCid: "QmStatsCid",
            updateCid: "QmUpdateCid",
            stop: vi.fn(),
            _updateDbInternalState: vi.fn(),
            initDbHandlerIfNeeded: vi.fn(),
            _dbHandler: {
                initDbIfNeeded: vi.fn(),
                queryAllCommentCidsAndTheirReplies: vi.fn().mockReturnValue([
                    { cid: "QmComment1", replies: { pageCids: { best: "QmReplyPage" } } },
                    { cid: "QmComment2", replies: undefined }
                ]),
                destoryConnection: vi.fn()
            },
            _addOldPageCidsToCidsToUnpin: vi.fn(async function (pages) {
                if (pages?.pageCids) Object.values(pages.pageCids).forEach((cid) => this._cidsToUnPin.add(cid));
            }),
            _setState: vi.fn()
        });

        await subplebbit.delete();

        const expectedCids = ["QmPostsPage", "QmReplyPage", "QmComment1", "QmComment2", "QmUpdateCid", "QmStatsCid"];
        expect(new Set(pinRmCalls)).to.deep.equal(new Set(expectedCids));
        expect(subplebbit._cidsToUnPin.size).to.equal(0);
        expect(removeMfsSpy.mock.calls[0][0].paths).to.deep.equal([`/${subplebbit.address}`]);
        expect(moveDbSpy.mock.calls.length).to.equal(1);
    });
});
