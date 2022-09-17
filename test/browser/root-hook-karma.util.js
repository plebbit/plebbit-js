import Plebbit from "../../dist/browser";

const setupNativeFunction = () => {
    const isElectron = navigator?.userAgent?.includes("Electron");
    if (isElectron) {
        // If in electron env, set native functiosn
        console.log(`Detected Electron env. Will set native functions`);
        console.log(window.plebbitJsNativeFunctions);
        Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);
    } else {
        console.log(`Detected non native Electron env`);
    }
};

(function () {
    setupNativeFunction();
})();
