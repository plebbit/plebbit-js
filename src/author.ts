import { Nft } from "./types";

class Author {
    displayName?: string;
    avatar?: Nft;
    address?: string;

    constructor(props: Author) {
        Object.assign(this, props);
    }

    toJSON?() {
        return { address: this.address, displayName: this.displayName, avatar: this.avatar };
    }

    toJSONForDb?() {
        return { address: this.address };
    }
}

export default Author;
