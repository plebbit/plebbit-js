// NOTE: don't import plebbit-js directly to be able to replace the implementation

// @plebbit/plebbit-js imported from parent folder
import Plebbit from "../../../../index.js";

import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
const log = Logger("plebbit-react-hooks:plebbit-js");

const PlebbitJs = {
    Plebbit: Plebbit
};

/**
 * replace PlebbitJs with a different implementation, for
 * example to mock it during unit tests, to add mock content
 * for developing the front-end or to add a PlebbitJs with
 * desktop privileges in the Electron build.
 */
export function setPlebbitJs(_Plebbit: any) {
    assert(typeof _Plebbit === "function", `setPlebbitJs invalid Plebbit argument '${_Plebbit}' not a function`);
    PlebbitJs.Plebbit = _Plebbit;
    log("setPlebbitJs", _Plebbit?.constructor?.name);
}

export function restorePlebbitJs() {
    PlebbitJs.Plebbit = Plebbit;
    log("restorePlebbitJs");
}

export default PlebbitJs;
