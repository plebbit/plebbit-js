// Pure string helpers for author/community addresses. This module MUST stay dependency-free:
// it is imported by zod schema modules (e.g. src/community/schema.ts), and pulling in
// src/util.ts from a schema module creates an evaluation-order cycle
// (community/schema -> util -> pubsub-messages/schema -> community-edit/schema -> community/schema)
// that throws at import time. See config/verify-module-import-order.js.

export function isStringDomain(x: string | undefined) {
    return typeof x === "string" && x.includes(".");
}

export function isEthAliasDomain(address: string): boolean {
    const lower = address.toLowerCase();
    return lower.endsWith(".eth") || lower.endsWith(".bso");
}

export function normalizeEthAliasDomain(address: string): string {
    return address.endsWith(".bso") ? address.slice(0, -4) + ".eth" : address;
}

// Do two names refer to the same name? `.bso` is the protocol's spelling of an ENS `.eth` name, and ENS names
// are case-insensitive, so `x.bso`, `x.eth` and `X.BSO` are one name. Any other name must match exactly: we do
// not know that its resolver ignores case. Issue #424.
export function areEquivalentNames(nameA: string, nameB: string): boolean {
    if (nameA === nameB) return true;
    if (!isEthAliasDomain(nameA) || !isEthAliasDomain(nameB)) return false;
    return normalizeEthAliasDomain(nameA.toLowerCase()) === normalizeEthAliasDomain(nameB.toLowerCase());
}
