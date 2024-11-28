import Plebbit from "../../dist/node";
import { expect } from "chai";
import { createSubWithNoChallenge } from "../../dist/node/test/test-util";

import tcpPortUsed from "tcp-port-used";

// TODO calling plebbit.destroy() should stop the address rewriter proxy
describe(`Testing HTTP router settings and address rewriter`, async () => {
    const nodeForHttpRouter = "http://localhost:15006/api/v0";
    // default list of http routers to use
    const httpRouterUrls = ["https://routing.lol", "https://peers.pleb.bot"];

    let plebbit;

    before(async () => {
        plebbit = await Plebbit({ ipfsHttpClientsOptions: [nodeForHttpRouter], httpRoutersOptions: httpRouterUrls });
    });

    it(`Plebbit({ipfsHttpClientOptions, httpRoutersOptions}) will change config of ipfs node`, async () => {
        plebbit.clients.ipfsClients[nodeForHttpRouter]._client.stop = () => {};
        expect(plebbit.httpRoutersOptions).to.deep.equal(httpRouterUrls);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        const ipfsClient = plebbit.clients.ipfsClients[nodeForHttpRouter]._client;
        const configValueType = await ipfsClient.config.get("Routing.Type");
        expect(configValueType).to.equal("custom");

        const configValueMethods = await ipfsClient.config.get("Routing.Methods");
        expect(configValueMethods?.["find-peers"]).to.be.a("object");

        const configValueRouters = await ipfsClient.config.get("Routing.Routers");
        expect(configValueRouters?.["HttpRouter1"]).to.be.a("object");
    });

    it(`Should start up address rewriter proxy`, async () => {
        const port = 19575; // should start a proxy at this port
        expect(await tcpPortUsed.check(port)).to.be.true;
        expect(await tcpPortUsed.check(port + 1)).to.be.true;
    });

    it(`Routing.Routers should be set to proxy`, async () => {
        const ipfsClient = plebbit.clients.ipfsClients[nodeForHttpRouter]._client;
        const configValueRouters = await ipfsClient.config.get("Routing.Routers");
        expect(configValueRouters.HttpRouter1.Parameters.Endpoint).to.equal("http://127.0.0.1:19575");
        expect(configValueRouters.HttpRouter2.Parameters.Endpoint).to.equal("http://127.0.0.1:19576");
    });

    it(`Can create another plebbit instance with same configs with no problem`, async () => {
        const anotherInstance = await Plebbit({ ipfsHttpClientsOptions: [nodeForHttpRouter], httpRoutersOptions: httpRouterUrls });
        const ipfsClient = anotherInstance.clients.ipfsClients[nodeForHttpRouter]._client;
        const configValueRouters = await ipfsClient.config.get("Routing.Routers");
        expect(configValueRouters.HttpRouter1.Parameters.Endpoint).to.equal("http://127.0.0.1:19575");
        expect(configValueRouters.HttpRouter2.Parameters.Endpoint).to.equal("http://127.0.0.1:19576");
    });

    it(`The proxy proxies requests to http router properly`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit); // an online sub

        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
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
    });

    it(`Calling plebbit.destroy() frees up the proxy`);
});
