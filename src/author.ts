class Author {
    displayName?: string;
    address: string;

    constructor(props) {
        this.displayName = props["displayName"];
        this.address = props["address"];
    }

    toJSON() {
        return { address: this.address, displayName: this.displayName };
    }

    toJSONForDb() {
        return { address: this.address };
    }
}

export default Author;
