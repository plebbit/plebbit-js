class Author {
    constructor(props) {
        this.displayName = props["displayName"];
        this.ipnsName = props["ipnsName"];
    }

    toJSON() {
        return {"ipnsName": this.ipnsName, "displayName": this.displayName};
    }
}

export default Author;