// Issue #401: a publication created with only a named community's key is re-signed at publish() with the community's
// name. Through an RPC client the client still signs (the server only relays the signed request), so the re-signing has
// to happen client-side before the request is sent. Runs its own in-process RPC server so the mock name resolver that
// maps the community's .bso name to its key is under the test's control.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { v4 as uuidV4 } from "uuid";
import PKC from "../../../dist/node/index.js";
import { createInProcessRpcServer, uniqueTmpDataPath, type PKCWsServerType } from "../../helpers/rpc-server-harness.js";
import {
    createMockNameResolver,
    mockRpcServerPKC,
    mockRpcServerForTests,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import type { PKC as PKCType } from "../../../dist/node/pkc/pkc.js";
import type { Comment } from "../../../dist/node/publications/comment/comment.js";
import type { RpcLocalCommunity } from "../../../dist/node/community/rpc-local-community.js";

describe("RPC client: publications created by key to a named community are re-signed with its name (#401)", () => {
    const records = new Map<string, string | undefined>();
    let rpcServer: PKCWsServerType;
    let serverPKC: PKCType;
    let clientPKC: PKCType;
    let community: RpcLocalCommunity;
    let name: string;
    let targetPost: Comment;

    beforeAll(async () => {
        serverPKC = await mockRpcServerPKC({
            dataPath: uniqueTmpDataPath("resign-by-key-rpc"),
            nameResolvers: [createMockNameResolver({ includeDefaultRecords: true, records })]
        });
        let rpcUrl: string;
        ({ rpcServer, rpcUrl } = await createInProcessRpcServer({ serverPKC, authKey: "resign-by-key" }));
        mockRpcServerForTests(rpcServer);
        clientPKC = await PKC({ pkcRpcClientsOptions: [rpcUrl], dataPath: undefined, httpRoutersOptions: [] });
        clientPKC.on("error", () => {});

        community = (await clientPKC.createCommunity({})) as RpcLocalCommunity;
        name = `resign-by-key-${uuidV4()}.bso`;
        records.set(name, community.signer!.address);
        await community.edit({ address: name, settings: { challenges: [] } });
        await community.start();
        await resolveWhenConditionIsTrue({
            toUpdate: community,
            predicate: async () => typeof community.updatedAt === "number" && community.name === name
        });
        targetPost = await publishRandomPost({ communityAddress: name, pkc: clientPKC });
    });

    afterAll(async () => {
        await community?.delete().catch(() => {});
        await clientPKC?.destroy();
        await rpcServer?.destroy();
        // rpcServer.destroy() also destroys the injected serverPKC
    });

    it("a comment created with only the community's key gets challenge success", async () => {
        const comment = await clientPKC.createComment({
            communityAddress: community.signer!.address,
            title: `Created by key over RPC ${Date.now()}`,
            content: `Content ${Date.now()}`,
            signer: await clientPKC.createSigner()
        });
        expect(comment.raw.pubsubMessageToPublish?.communityName).to.be.undefined;
        await publishWithExpectedResult({ publication: comment, expectedChallengeSuccess: true });
        expect(comment.raw.pubsubMessageToPublish?.communityName).to.equal(name);
    });

    it("a vote created with only the community's key gets challenge success", async () => {
        const vote = await clientPKC.createVote({
            commentCid: targetPost.cid!,
            vote: 1,
            communityAddress: community.signer!.address,
            signer: await clientPKC.createSigner()
        });
        expect(vote.raw.pubsubMessageToPublish?.communityName).to.be.undefined;
        await publishWithExpectedResult({ publication: vote, expectedChallengeSuccess: true });
        expect(vote.raw.pubsubMessageToPublish?.communityName).to.equal(name);
    });
});
