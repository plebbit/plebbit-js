import { expect } from "chai";
import Plebbit from "../../dist/node/index.js";
import { createSubWithNoChallenge, describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../dist/node/test/test-util.js";
import { MockHttpRouter } from "../../dist/node/runtime/node/test/mock-http-router.js";

import tcpPortUsed from "tcp-port-used";

// TODO this test should create a new http router instead of relying on existing routers that may fail

// TODO calling plebbit.destroy() should stop the address rewriter proxy
describeSkipIfRpc(`Testing HTTP router settings and address rewriter`, async () => {
    const kuboNodeForHttpRouter = "http://localhost:15006/api/v0";
    let mockHttpRouter;
    let httpRouterUrls = [];

    const startPort = 19575;

    let plebbit;

    // const waitForProvidersOnRouter = async (keys) => {
    //     const timeoutAt = Date.now() + 60_000;
    //     while (Date.now() < timeoutAt) {
    //         if (mockHttpRouter && keys.every((key) => mockHttpRouter.hasProvidersFor(key))) return;
    //         await new Promise((resolve) => setTimeout(resolve, 250));
    //     }
    //     const diagnosticInfo = mockHttpRouter
    //         ? {
    //               url: mockHttpRouter.url,
    //               requestCount: mockHttpRouter.requests.length,
    //               lastRequest: mockHttpRouter.requests.at(-1),
    //               recentRequests: mockHttpRouter.requests.slice(-5)
    //           }
    //         : null;
    //     const error = new Error(
    //         `Timed out waiting for mock HTTP router to record providers. Requests observed: ${JSON.stringify(diagnosticInfo, null, 2)}`
    //     );
    //     error.name = "ProvidersNotRecordedError";
    //     throw error;
    // };

    before(async () => {
        mockHttpRouter = new MockHttpRouter();
        await mockHttpRouter.start();
        httpRouterUrls = [mockHttpRouter.url];
    });

    after(async () => {
        try {
            await plebbit.destroy();
        } catch {}
        if (mockHttpRouter) {
            await mockHttpRouter.destroy();
        }
    });

    it(`address rewriter proxy should not be taken before we start plebbit`, async () => {
        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.false;
    });

    it(`Plebbit({kuboRpcClientsOptions, httpRoutersOptions}) will change config of ipfs node`, async () => {
        plebbit = await Plebbit({ kuboRpcClientsOptions: [kuboNodeForHttpRouter], httpRoutersOptions: httpRouterUrls });
        plebbit.on("error", (err) => {
            console.log("Received an error on Plebbit instance", err);
        });
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait unti plebbit is done changing config and restarting
        expect(plebbit.httpRoutersOptions).to.deep.equal(httpRouterUrls);
        const kuboRpcClient = plebbit.clients.kuboRpcClients[kuboNodeForHttpRouter]._client;
        const configValueType = await kuboRpcClient.config.get("Routing.Type");
        expect(configValueType).to.equal("custom");

        const configValueMethods = await kuboRpcClient.config.get("Routing.Methods");
        expect(configValueMethods?.["find-peers"]).to.be.a("object");

        const configValueRouters = await kuboRpcClient.config.get("Routing.Routers");
        expect(configValueRouters?.["HttpRouter1"]).to.be.a("object");
    });

    it(`Should start up address rewriter proxy`, async () => {
        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.true;
    });

    it(`Routing.Routers should be set to proxy`, async () => {
        const kuboRpcClient = plebbit.clients.kuboRpcClients[kuboNodeForHttpRouter]._client;
        const configValueRouters = await kuboRpcClient.config.get("Routing.Routers");
        for (let i = 0; i < httpRouterUrls.length; i++) {
            const endpoint = configValueRouters[`HttpRouter${i + 1}`].Parameters.Endpoint;
            expect(endpoint).to.equal(`http://127.0.0.1:${startPort + i}`);
        }
    });

    it(`Can create another plebbit instance with same configs with no problem`, async () => {
        const anotherInstance = await Plebbit({
            kuboRpcClientsOptions: [kuboNodeForHttpRouter],
            httpRoutersOptions: httpRouterUrls,
            dataPath: plebbit.dataPath
        });
        anotherInstance.on("error", (err) => {
            console.log("Received an error on Plebbit instance", err);
        });
        const kuboRpcClient = anotherInstance.clients.kuboRpcClients[kuboNodeForHttpRouter]._client;
        const configValueRouters = await kuboRpcClient.config.get("Routing.Routers");
        for (let i = 0; i < httpRouterUrls.length; i++) {
            const endpoint = configValueRouters[`HttpRouter${i + 1}`].Parameters.Endpoint;
            expect(endpoint).to.equal(`http://127.0.0.1:${startPort + i}`);
        }

        await anotherInstance.destroy();
    });

    it(`The proxy proxies requests to http router properly`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit); // an online sub

        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });

        expect(sub.updateCid).to.be.a("string");
        expect(sub.pubsubTopicRoutingCid).to.be.a("string");
        const provideToTestAgainst = [
            { label: "sub.updateCid", cid: sub.updateCid },
            { label: "sub.pubsubTopicRoutingCid", cid: sub.pubsubTopicRoutingCid }
        ];

        const providerStatuses = provideToTestAgainst.map(({ cid, label }) => ({
            label,
            cid,
            hasProviders: mockHttpRouter.hasProvidersFor(cid)
        }));
        expect(
            providerStatuses.every(({ hasProviders }) => hasProviders),
            providerStatuses.map(({ label, cid, hasProviders }) => `${label} (${cid}): ${hasProviders ? "provided" : "missing"}`).join(", ")
        ).to.be.true;

        for (const httpRouterUrl of httpRouterUrls) {
            // why does subplebbit.ipnsPubsubDhtKey fails here?
            for (const { cid: resourceToProvide } of provideToTestAgainst) {
                const providersUrl = `${httpRouterUrl}/routing/v1/providers/${resourceToProvide}`;
                const res = await fetch(providersUrl, { method: "GET" });
                expect(res.status).to.equal(
                    200,
                    "http router " + httpRouterUrl + " has responded with wrong status code, did it provide correctly?"
                );
                const resJson = await res.json();
                expect(resJson["Providers"]).to.be.a("array");
                expect(resJson["Providers"].length).to.be.at.least(1);
                for (const provider of resJson["Providers"]) {
                    expect(provider.Schema).to.equal("peer");
                    expect(provider.ID).to.be.a("string").and.to.have.length.greaterThan(0);
                    const providerAddrs = provider.Addrs;
                    expect(providerAddrs.length).to.be.at.least(1);
                    for (const providerAddr of providerAddrs) {
                        expect(providerAddr).to.be.a.string;
                        expect(providerAddr).to.not.include("0.0.0.0");
                    }
                    if (provider.Protocols) {
                        expect(provider.Protocols).to.be.an("array");
                    }
                }
            }
        }

        const hasPutRequest = mockHttpRouter.requests
            .filter((request) => request.method === "PUT")
            .some((request) => request.url.startsWith("/routing/v1/providers"));
        expect(hasPutRequest).to.be.true;

        await sub.delete();
    });

    it(`Calling plebbit.destroy() on original plebbit instance that started address rewriter proxy frees up the proxy server`, async () => {
        await plebbit.destroy();
        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.false;
    });

    it(`Creating a new plebbit instance will start a new proxy server after destroying the previous one`, async () => {
        const anotherInstance = await Plebbit({
            kuboRpcClientsOptions: [kuboNodeForHttpRouter],
            httpRoutersOptions: httpRouterUrls,
            dataPath: plebbit.dataPath
        });

        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait unti plebbit is done changing config and restarting
        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.true;

        await anotherInstance.destroy();

        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.false;
    });
});
