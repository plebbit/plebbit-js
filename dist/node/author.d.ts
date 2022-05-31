declare class Author {
    displayName?: string;
    address: string;
    constructor(props: any);
    toJSON(): {
        address: string;
        displayName: string;
    };
    toJSONForDb(): {
        address: string;
    };
}
export default Author;
