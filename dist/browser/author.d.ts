import { Nft } from "./types";
declare class Author {
    displayName?: string;
    avatar?: Nft;
    address: string;
    constructor(props: any);
    toJSON(): {
        address: string;
        displayName: string;
        avatar: Nft;
    };
    toJSONForDb(): {
        address: string;
    };
}
export default Author;
