import {loadIpfsFileAsJson} from "./Util.js";

export class Pages {
    constructor(props) {
        this.pages = props["pages"];
        this.pageCids = props["pageCids"];
        this.plebbit = props["plebbit"];
    }

    async getPage(pageCid) {
        return loadIpfsFileAsJson(pageCid, this.plebbit.ipfsClient);
    }

    toJSON() {
        return {"pages": this.pages, "pageCids": this.pageCids};
    }
}

export class Page {
    constructor(props) {
        this.comments = props["comments"];
        this.nextCid = props["nextCid"];
    }

}
