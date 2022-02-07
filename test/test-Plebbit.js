import Plebbit from "../src/Plebbit.js";
import Post from "../src/Post.js";
import Author from "../src/Author.js";
import Comment from "../src/Comment.js";
import Subplebbit from "../src/Subplebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

describe("Test Plebbit", async () => {
    it("getPostOrComment fetches a post correctly", async () => {
        const postCid = "QmVxihaABYMBFkWGTpbK6hxekPXh9J7WmRQhq3vSZRix7q";
        const expectedPost = new Post({
            "author": {
                "displayName": "Mock Author - 1643823571924",
                "ipnsKeyId": "k2k4r8oxcsffkx4539ge47d8zvpxb39sqbtogm8qv6d0xl0so11j6em8"
            },
            "content": "Mock content - 1643823571924",
            "timestamp": 1643823571924,
            "subplebbitIpnsKeyId": "k2k4r8kn4nd962d2ku8ql4fliucgt1zmhhrtq0dyt0u2gxmf3qr48yc7",
            "previousCommentCid": "QmbQYEDDAhUFwZKBJf8cBbxVA5VPs9K1XGJQwzitmRKuvM",
            "commentIpnsKeyId": "k2k4r8kwk6br6feoitqeot58n3ao0sxgf973m7rco64jxbq4xa3fuw98",
            "commentIpnsKeyName": "7a98cae20e96193c30a5",
            "postCid": "QmVxihaABYMBFkWGTpbK6hxekPXh9J7WmRQhq3vSZRix7q",
            "title": "Mock Post - 1643823571924"
        });
        const loadedPost = await plebbit.getPostOrComment(postCid);
        assert.equal(JSON.stringify(loadedPost), JSON.stringify(expectedPost), "Failed to load test post correctly");
    });

    it("getPostOrComment fetches a comment correctly", async () => {
        const commentCid = "QmWrZd71VcJSmbjZQtmTHzf75kbQ33jxeFMzRLWZC6Feug";
        const expectedComment = new Comment({
            "author": {
                "displayName": "Mock Author - 1643832488522",
                "ipnsKeyId": "k2k4r8l98bs4lfbnrq90gjvo8b3l42a90jadxykmx4dpqcoeujd2ekvf"
            },
            "content": "Mock comment - 1643832488522",
            "timestamp": 1643832488522,
            "subplebbitIpnsKeyId": "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1",
            "previousCommentCid": "QmXigKr32V2hSSvVoB9X4j8a5y6ki4S9uEn8H8gHn23Bv5",
            "commentIpnsKeyId": "k2k4r8pk22g4d97id9hpz8jjcadao2dvv2fxkp0bb32ddj3fqc1dz9h3",
            "commentIpnsKeyName": "e00794b9ac55b25da1b7",
            "postCid": "QmaUA9jUp3CH96usYNwYXe58HnaxjeAHKKhthk55XNTU2d",
            "commentCid": "QmWrZd71VcJSmbjZQtmTHzf75kbQ33jxeFMzRLWZC6Feug"
        });
        const loadedComment = await plebbit.getPostOrComment(commentCid);
        assert.equal(JSON.stringify(loadedComment), JSON.stringify(expectedComment), "Failed to load test comment");
    });

    it("getSubplebbit is fetches a subplebbit correctly", async () => {
        const subplebbitIpns = "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1";
        const expectedSubplebbit = new Subplebbit({
            "title": "Test subplebbit - 1643557410848",
            "latestPostCid": "QmaUA9jUp3CH96usYNwYXe58HnaxjeAHKKhthk55XNTU2d",
            "preloadedPosts": [
                {
                    "author": {
                        "displayName": "Mock Author - 1643557581270",
                        "ipnsKeyId": "k2k4r8n1s0pvz5nq39cdfdb4y3kxms9civwh1mwi02pn4z3gcitbcnew"
                    },
                    "content": "Mock content - 1643557581270",
                    "timestamp": 1643557581270,
                    "previousCommentCid": "QmbwNU1uQ4eBuuwnPHRp6L8ZhQRL6nuab68RzHWrQVtAEq",
                    "commentIpnsKeyId": "k2k4r8nv8auy8vm4ub0wr1d9z4qffayc6k472u2fspvpdn9js81si8dx",
                    "commentIpnsKeyName": "03137c0c2e53bd96f32a",
                    "postCid": "QmaUA9jUp3CH96usYNwYXe58HnaxjeAHKKhthk55XNTU2d",
                    "subplebbitIpnsKeyId": "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1",
                    "title": "Mock Post - 1643557581270"
                },
                {
                    "author": {
                        "displayName": "Mock Author - 1643557489966",
                        "ipnsKeyId": "k2k4r8oljtok0v0ykn4fvsxwferexrqc4bg5b5oqnxqpprg3739os1u6"
                    },
                    "content": "Mock content - 1643557489966",
                    "timestamp": 1643557489966,
                    "commentIpnsKeyId": "k2k4r8k7v0o7xk3cfsr7tqx4oulhsxth3zsxk5uzvi4p2zb2gdhqpz1j",
                    "commentIpnsKeyName": "f6d7c6a5ae88fa1052fb",
                    "postCid": "QmbwNU1uQ4eBuuwnPHRp6L8ZhQRL6nuab68RzHWrQVtAEq",
                    "subplebbitIpnsKeyId": "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1",
                    "title": "Mock Post - 1643557489966"
                }
            ],
            "pubsubTopic": "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1",
            "ipnsKeyId": "k2k4r8oxv3xngwyxubqcr77mvs025hlbg44df64cgzxj8e6c4y1bovp1"
        });
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitIpns);
        assert.equal(JSON.stringify(expectedSubplebbit), JSON.stringify(loadedSubplebbit), "Failed to load test subplebbit");
    });
});