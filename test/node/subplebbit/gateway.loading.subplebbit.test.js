import {
    describeSkipIfRpc,
    mockGatewayPlebbit,
    mockPlebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { describe, beforeAll, afterAll } from "vitest";

const getGatewayBaseUrl = (gatewayPlebbit) => {
    const [gatewayUrl] = gatewayPlebbit.ipfsGatewayUrls || [];
    if (!gatewayUrl) throw new Error("Gateway Plebbit has no ipfsGatewayUrls configured");
    return gatewayUrl;
};

const buildGatewayIpnsUrl = (gatewayPlebbit, subplebbit) => {
    return new URL(`/ipns/${subplebbit.address}`, getGatewayBaseUrl(gatewayPlebbit)).toString();
};

const buildGatewayIpfsUrl = (gatewayPlebbit, cid) => {
    return new URL(`/ipfs/${cid}`, getGatewayBaseUrl(gatewayPlebbit)).toString();
};

const fetchGatewayJson = async (url, context) => {
    console.log(`${context} attempt to ${url}`);
    let res;
    try {
        res = await fetch(url, { cache: "no-store" });
    } catch (error) {
        console.error(`${context} request threw before receiving a response`, {
            url,
            errorName: error?.name,
            errorMessage: error?.message,
            errorStack: error?.stack,
            errorCause: error?.cause,
            errorCode: error?.code,
            errorErrno: error?.errno,
            errorSyscall: error?.syscall,
            errorAddress: error?.address,
            errorPort: error?.port
        });
        throw error;
    }
    const bodyText = await res.text();
    if (!res.ok) {
        const headers = Object.fromEntries(res.headers.entries());
        const failureDetails = {
            url,
            status: res.status,
            statusText: res.statusText,
            headers,
            bodyPreview: bodyText.slice(0, 2000),
            bodyLength: bodyText.length,
            redirect: res.redirected,
            type: res.type
        };
        console.error(`${context} received non-OK response`, failureDetails);
        const error = new Error(`${context} failed with status ${res.status}`);
        //@ts-ignore - augment error for easier debugging
        error.responseBody = bodyText;
        //@ts-ignore
        error.status = res.status;
        //@ts-ignore
        error.statusText = res.statusText;
        //@ts-ignore
        error.responseHeaders = headers;
        //@ts-ignore
        error.responseType = res.type;
        //@ts-ignore
        error.redirected = res.redirected;
        //@ts-ignore
        error.url = url;
        throw error;
    }
    try {
        return JSON.parse(bodyText);
    } catch (error) {
        console.error(`Failed to parse ${context} response`, {
            url,
            status: res.status,
            statusText: res.statusText,
            bodyPreview: bodyText.slice(0, 2000),
            bodyLength: bodyText.length,
            parseErrorName: error?.name,
            parseErrorMessage: error?.message,
            parseErrorStack: error?.stack
        });
        //@ts-ignore
        error.url = url;
        //@ts-ignore
        error.responseBody = bodyText;
        throw error;
    }
};

const fetchIpnsRecordDirectly = async (gatewayPlebbit, subplebbit) => {
    const ipnsUrl = buildGatewayIpnsUrl(gatewayPlebbit, subplebbit);
    return fetchGatewayJson(ipnsUrl, "Direct IPNS fetch");
};

const fetchCidRecordDirectly = async (gatewayPlebbit, cid) => {
    const ipfsUrl = buildGatewayIpfsUrl(gatewayPlebbit, cid);
    return fetchGatewayJson(ipfsUrl, "Direct CID fetch");
};

describeSkipIfRpc.concurrent("Gateway loading of local subplebbit IPNS", async () => {
    let plebbit, subplebbit;
    let gatewayPlebbit;
    let kuboPlebbit;
    let latestUpdateCid;

    beforeAll(async () => {
        plebbit = await mockPlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
        gatewayPlebbit.on("error", (err) => console.error("gatewayPlebbit error event", err));
        console.log("Gateway URLs:", gatewayPlebbit.ipfsGatewayUrls);
        try {
            const probeRes = await fetch("http://localhost:18080", { method: "HEAD" });
            console.log("Gateway HEAD status:", probeRes.status);
        } catch (error) {
            console.error("Gateway HEAD probe failed", error);
        }

        kuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await plebbit.createSubplebbit();

        await subplebbit.start();

        const modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] },
            roles: {
                [modSigner.address]: { role: "moderator" }
            }
        });

        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updateCid === "string" });
        latestUpdateCid = subplebbit.updateCid;
    });

    afterAll(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await gatewayPlebbit.destroy();
        await kuboPlebbit.destroy();
    });

    it("Can fetch the IPNS record directly from gateway without plebbit instance", async () => {
        console.log("Starting test: Direct IPNS fetch without plebbit instance");
        const record = await fetchIpnsRecordDirectly(gatewayPlebbit, subplebbit);
        expect(record.updatedAt).to.equal(subplebbit.updatedAt);
    });

    it("Can fetch the CID directly from gateway without plebbit instance", async () => {
        console.log("Starting test: Direct CID fetch without plebbit instance");
        const record = await fetchCidRecordDirectly(gatewayPlebbit, latestUpdateCid);
        expect(record.updatedAt).to.equal(subplebbit.updatedAt);
    });

    it("Can load the CID using gatewayPlebbit.fetchCid after it's published", async () => {
        console.log("Starting test: Can load the CID using gatewayPlebbit.fetchCid after it's published");
        const rawRecord = await gatewayPlebbit.fetchCid({ cid: latestUpdateCid });
        const record = JSON.parse(rawRecord);
        expect(record.updatedAt).to.equal(subplebbit.updatedAt);
    });

    it("Can load the IPNS record from gateway Plebbit after it's published", async () => {
        console.log("Starting test: Can load the IPNS record from gateway after it's published");
        const remoteSub = await gatewayPlebbit.getSubplebbit({ address: subplebbit.address });
        expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
    });

    it("Can load the IPNS record from kubo after it's published", async () => {
        console.log("Starting test: Can load the IPNS record from kubo after it's published");
        const remoteSub = await kuboPlebbit.getSubplebbit({ address: subplebbit.address });
        expect(remoteSub.updatedAt).to.equal(subplebbit.updatedAt);
    });
});
