import { shortifyAddress } from "../util.js";
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
            flair: this.flair
        };
    }
    toJSONIpfsWithCommentUpdate() {
        if (!this.subplebbit)
            throw Error("Calling author.toJSONIpfsWithCommentUpdate() without defining author.subplebbit");
        return { ...this.toJSONIpfs(), subplebbit: this.subplebbit };
    }
}
export default Author;
//# sourceMappingURL=author.js.map