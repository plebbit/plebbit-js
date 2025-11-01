import { getAvailablePlebbitConfigsToTestAgainst } from "../../../../test/test-util.js";

const WAIT_TIMEOUT_MS = Number(process.env.DESTROY_RUNNER_WAIT ?? 1000);
const WAIT_POLL_MS = Number(process.env.DESTROY_RUNNER_POLL ?? 25);
const nodeProcess = process as NodeJS.Process & {
    _getActiveHandles: () => unknown[];
    _getActiveRequests: () => unknown[];
};

async function run(): Promise<void> {
    try {
        const configs = getAvailablePlebbitConfigsToTestAgainst();
        if (!configs.length) {
            throw new Error("destroy-runner: no plebbit configs available");
        }

        const { plebbitInstancePromise } = configs[0];
        const plebbit = await plebbitInstancePromise();

        try {
            console.error(
                JSON.stringify(
                    {
                        message: "plebbit clients summary",
                        kuboRpcClients: Object.keys(plebbit.clients?.kuboRpcClients ?? {}),
                        pubsubKuboRpcClients: Object.keys(plebbit.clients?.pubsubKuboRpcClients ?? {}),
                        ipfsGateways: Object.keys(plebbit.clients?.ipfsGateways ?? {}),
                        libp2pJsClients: Object.keys(plebbit.clients?.libp2pJsClients ?? {}),
                        httpRoutersOptions: plebbit.httpRoutersOptions,
                        dataPath: plebbit.dataPath
                    },
                    null,
                    2
                )
            );
        } catch {
            // ignore logging errors
        }
        await plebbit.destroy();

        const report = await waitForCleanup();
        const hasRemainingHandles = report.remainingHandles > 0;
        const hasRemainingRequests = report.remainingRequests > 0;

        if (hasRemainingHandles || hasRemainingRequests) {
            console.error(JSON.stringify(report, null, 2));
            nodeProcess.exitCode = 1;
        } else {
            console.error(JSON.stringify(report, null, 2));
        }
    } catch (error) {
        console.error("destroy-runner failure:", error);
        process.exitCode = 1;
    }
}

await run();
process.exit();

function collectActiveResources() {
    const isStandardStream = (handle: unknown) => handle === process.stdout || handle === process.stderr || handle === process.stdin;

    const describeHandle = (handle: unknown) => {
        const name = (handle as any)?.constructor?.name;
        if (name === "Timeout") {
            return {
                type: name,
                _idleTimeout: (handle as any)?._idleTimeout,
                _repeat: (handle as any)?._repeat
            };
        }
        if (name === "Socket" || name === "TLSSocket" || name === "Pipe") {
            let addressInfo: Record<string, unknown> | undefined;
            try {
                const address = (handle as any)?.address?.();
                if (address && typeof address === "object") {
                    addressInfo = address;
                }
            } catch {
                // ignore
            }
            const peer = (handle as any)?._peername;
            const fd = (handle as any)?.fd ?? (handle as any)?._handle?.fd;
            const base = {
                type: name,
                destroyed: (handle as any)?.destroyed,
                localAddress: (handle as any)?.localAddress,
                localPort: (handle as any)?.localPort,
                remoteAddress: (handle as any)?.remoteAddress,
                remotePort: (handle as any)?.remotePort,
                peer,
                addressInfo,
                readyState: (handle as any)?.readyState,
                connecting: (handle as any)?.connecting,
                fd
            };
            if (name === "WriteStream" || name === "ReadStream" || name === "Pipe") {
                return { ...base, path: (handle as any)?.path };
            }
            return base;
        }
        return { type: name ?? typeof handle };
    };

    const describeRequest = (request: any) => {
        const name = request?.constructor?.name ?? typeof request;
        if (name === "GetAddrInfoReqWrap") {
            return {
                type: name,
                hostname: request?.hostname,
                family: request?.family
            };
        }
        if (name === "FileHandleCloseReq") {
            return {
                type: name,
                path: request?.path
            };
        }
        return { type: name };
    };

    const nodeProcess = process as NodeJS.Process & {
        _getActiveHandles: () => unknown[];
        _getActiveRequests: () => unknown[];
    };

    const activeHandlesRaw = nodeProcess._getActiveHandles();
    const activeRequestsRaw = nodeProcess._getActiveRequests();

    const filteredHandles = activeHandlesRaw.filter((handle: any) => {
        if (isStandardStream(handle)) return false;
        const name = handle?.constructor?.name;
        const fd = handle?.fd ?? handle?._handle?.fd;
        if ((name === "Socket" || name === "Pipe" || name === "WriteStream" || name === "ReadStream") && (fd === 0 || fd === 1 || fd === 2))
            return false;
        return true;
    });

    const filteredRequests = activeRequestsRaw.filter((request) => {
        const name = request?.constructor?.name ?? typeof request;
        return name !== "GetAddrInfoReqWrap" && name !== "FileHandleCloseReq";
    });

    return {
        message: "Active resources after plebbit.destroy()",
        handles: activeHandlesRaw.map(describeHandle),
        requests: activeRequestsRaw.map(describeRequest),
        remainingHandles: filteredHandles.length,
        remainingRequests: filteredRequests.length
    };
}

async function waitForCleanup() {
    const deadline = Date.now() + WAIT_TIMEOUT_MS;
    let report = collectActiveResources();
    while ((report.remainingHandles || report.remainingRequests) && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, WAIT_POLL_MS));
        report = collectActiveResources();
    }
    return report;
}
