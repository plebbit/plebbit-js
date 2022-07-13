import { Nft } from "./types";
declare class Author {
    displayName?: string;
    avatar?: Nft;
    address?: string;
    constructor(props: Author);
    toJSON?(): {
        address: string;
        displayName: string;
        avatar: Nft;
    };
    toJSONForDb?(): {
        address: string;
    };
}
export default Author;
