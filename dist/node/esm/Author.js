class Author {
  constructor(props) {
    this.displayName = props["displayName"];
    this.address = props["address"];
  }

  toJSON() {
    return {
      "address": this.address,
      "displayName": this.displayName
    };
  }

}

export default Author;