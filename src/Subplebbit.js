class Subplebbit {
    constructor(props) {
        this.title = props["title"];
        this.description = props["description"];
        this.moderatorsIpnsNames = props["moderatorsIpnsNames"];
        this.latestPostCid = props["latestPostCid"];
        this.preloadedPosts = props["preloadedPosts"].map(post => new Post(post));
        this.pubsubTopic = props["pubsubTopic"];
    }
}
export default Subplebbit;