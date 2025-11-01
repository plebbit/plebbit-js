import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

interface RunDestroyInChildProcessOptions {
    configCode: string;
    timeoutMs: number;
}

const runnerPath = fileURLToPath(new URL("./destroy-runner.js", import.meta.url));

export async function runDestroyInChildProcess({
    configCode,
    timeoutMs
}: RunDestroyInChildProcessOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const env = { ...process.env, PLEBBIT_CONFIGS: configCode };
        const child = spawn(process.execPath, [runnerPath], {
            env,
            stdio: ["ignore", "pipe", "pipe"]
        });

        let stdout = "";
        let stderr = "";
        let settled = false;

        child.stdout?.on("data", (data: unknown) => {
            stdout += String(data);
        });

        child.stderr?.on("data", (data: unknown) => {
            stderr += String(data);
        });

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            child.kill("SIGKILL");
            const message = [
                `destroy-runner timed out after ${timeoutMs}ms`,
                stdout.trim() ? `stdout:\n${stdout.trim()}` : "",
                stderr.trim() ? `stderr:\n${stderr.trim()}` : ""
            ]
                .filter(Boolean)
                .join("\n\n");
            reject(new Error(message));
        }, timeoutMs);

        child.once("error", (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            reject(error);
        });

        child.once("exit", (code, signal) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            if (code === 0) {
                resolve();
                return;
            }

            const message = [
                `destroy-runner exited with code ${code ?? "null"}${signal ? ` (signal ${signal})` : ""}`,
                stdout.trim() ? `stdout:\n${stdout.trim()}` : "",
                stderr.trim() ? `stderr:\n${stderr.trim()}` : ""
            ]
                .filter(Boolean)
                .join("\n\n");
            reject(new Error(message));
        });
    });
}
