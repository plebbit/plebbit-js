import { shortifyAddress } from "../util.js";
import Logger from "@plebbit/plebbit-logger";
const authorLog = Logger("plebbit-js:publication:author");
class Author {
    constructor(props) {
        this.address = props.address;
        this.previousCommentCid = props.previousCommentCid;
        this.displayName = props.displayName;
        this.wallets = props.wallets;
        this.avatar = props.avatar;
        this.flair = props.flair;
        this.subplebbit = "subplebbit" in props ? props.subplebbit : undefined;
        this.shortAddress = shortifyAddress(this.address);
    }
    toJSON() {
        return {
            ...(this.subplebbit ? this.toJSONIpfsWithCommentUpdate() : this.toJSONIpfs()),
            shortAddress: this.shortAddress
        };
    }
    toJSONIpfs() {
        return {
            address: this.address,
            previousCommentCid: this.previousCommentCid,
            displayName: this.displayName,
            wallets: this.wallets,
            avatar: this.avatar,
            flair: this.flair // TODO need to make sure it's from the author, not mod
        };
    }
    toJSONAfterChallengeVerification() {
        if (!this.subplebbit)
            throw Error("Calling author.toJSONAfterChallengeVerification() without defining author.subplebbit");
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
    toJSONIpfsWithCommentUpdate() {
        if (!this.subplebbit)
            authorLog("Warning: calling author.toJSONIpfsWithCommentUpdate without author.subplebbit defined");
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
}
export default Author;
//# sourceMappingURL=author.js.map