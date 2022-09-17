const Plebbit = require("../dist/node");

const setupNativeFunction = () => {
    const isElectron = globalThis["navigator"]?.userAgent?.includes("Electron");
    if (isElectron) {
        // If in electron env, set native functiosn
        console.log(window.plebbitJsNativeFunctions);
        console.log(`Detected Electron env. Will set native functions`);
        Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);
    } else {
        console.log(`Detected non native Electron env`);
    }
};

// Root Mocha hook.
exports.mochaHooks = {
    beforeEach(done) {
        setupNativeFunction();
        done();
    }
};
