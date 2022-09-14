// Root hook.
exports.mochaHooks = {
    beforeEach(done) {
        // If in electron env, set native functiosn
        const isElectron = Boolean(process.versions["electron"]);
        if (isElectron) {
            console.log(`Detected Electron env. Will set native functions`);
            const { setNativeFunctions } = require("@plebbit/plebbit-js/dist/browser/plebbit");
            setNativeFunctions(window.plebbitJsNativeFunctions);
        } else {
            console.log(`Detected non native Electron env`);
        }
        done();
    }
};
