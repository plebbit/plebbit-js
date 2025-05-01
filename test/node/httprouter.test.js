import { expect } from "chai";
import Plebbit from "../../dist/node/index.js";
import { createSubWithNoChallenge, describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../dist/node/test/test-util.js";

import tcpPortUsed from "tcp-port-used";

// TODO calling plebbit.destroy() should stop the address rewriter proxy
describeSkipIfRpc(`Testing HTTP router settings and address rewriter`, async () => {
    const nodeForHttpRouter = "http://localhost:15006/api/v0";
    // default list of http routers to use
    const httpRouterUrls = ["https://routing.lol", "https://peers.pleb.bot"];

    const startPort = 19575;

    let plebbit;

    before(async () => {
        plebbit = await Plebbit({ kuboRpcClientsOptions: [nodeForHttpRouter] });
    });

    after(async () => {
        try {
            await plebbit.destroy();
        } catch {}
    });

    it(`Plebbit({kuboRpcClientsOptions}) sets correct default http routers`, async () => {
        expect(plebbit.httpRoutersOptions).to.deep.equal([
            "https://peers.pleb.bot",
            "https://routing.lol",
            "https://peers.forumindex.com",
            "https://peers.plebpubsub.xyz"
        ]);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait unti plebbit is done changing config and restarting
    });

    it(`Plebbit({kuboRpcClientsOptions, httpRoutersOptions}) will change config of ipfs node`, async () => {
        const kuboRpcClient = plebbit.clients.kuboRpcClients[nodeForHttpRouter]._client;
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
        const kuboRpcClient = plebbit.clients.kuboRpcClients[nodeForHttpRouter]._client;
        const configValueRouters = await kuboRpcClient.config.get("Routing.Routers");
        expect(configValueRouters.HttpRouter1.Parameters.Endpoint.startsWith("http://127.0.0.1:")).to.be.true;
        expect(configValueRouters.HttpRouter2.Parameters.Endpoint.startsWith("http://127.0.0.1:")).to.be.true;
    });

    it(`Can create another plebbit instance with same configs with no problem`, async () => {
        const anotherInstance = await Plebbit({ kuboRpcClientsOptions: [nodeForHttpRouter], httpRoutersOptions: httpRouterUrls });
        const kuboRpcClient = anotherInstance.clients.kuboRpcClients[nodeForHttpRouter]._client;
        const configValueRouters = await kuboRpcClient.config.get("Routing.Routers");
        expect(configValueRouters.HttpRouter1.Parameters.Endpoint.startsWith("http://127.0.0.1:19575")).to.be.true;
        expect(configValueRouters.HttpRouter2.Parameters.Endpoint.startsWith("http://127.0.0.1:19576")).to.be.true;
        await anotherInstance.destroy();
    });

    it(`The proxy proxies requests to http router properly`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit); // an online sub

        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait till it's propgated on the http router

        for (const httpRouterUrl of httpRouterUrls) {
            const providersUrl = `${httpRouterUrl}/routing/v1/providers/${sub.updateCid}`;
            const res = await fetch(providersUrl, { method: "GET" });
            expect(res.status).to.equal(200);
            const resJson = await res.json();
            expect(resJson["Providers"]).to.be.a("array");
            expect(resJson["Providers"].length).to.be.at.least(1);
            for (const provider of resJson["Providers"]) {
                for (const providerAddr of provider.Addrs) {
                    expect(providerAddr).to.be.a.string;
                    expect(providerAddr).to.not.include("0.0.0.0");
                }
            }
        }

        await sub.delete();
    });

    it(`Calling plebbit.destroy() on original plebbit instance that started address rewriter proxy frees up the proxy server`, async () => {
        await plebbit.destroy();
        for (let i = 0; i < httpRouterUrls.length; i++) expect(await tcpPortUsed.check(startPort + i)).to.be.false;
    });
});
