declare class Author {
    displayName?: string;
    address: string;

    constructor(props: any);

    toJSON(): {
        address: string;
        displayName: string;
    };
}

export default Author;
