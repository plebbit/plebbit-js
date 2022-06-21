import { Nft } from "./types";

class Author {
    displayName?: string;
    avatar?: Nft;
    address: string;

    constructor(props) {
        this.displayName = props["displayName"];
        this.address = props["address"];
        this.avatar = props["avatar"];
    }

    toJSON() {
        return { address: this.address, displayName: this.displayName, avatar: this.avatar };
    }

    toJSONForDb() {
        return { address: this.address };
    }
}

export default Author;
