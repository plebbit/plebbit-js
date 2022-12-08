const signers = require("./signers").rawSigners;

const comment = {
    subplebbitAddress: signers[0].address,
    author: { address: signers[1].address },
    timestamp: 1600000000,
    parentCid: "QmbSiusGgY4Uk5LdAe91bzLkBzidyKyKHRKwhXPDz7gGyx",
    content: "some content... "
};
// test large content
let i = 1000;
while (i--) {
    comment.content += "some content... ";
}

const fixtureSignature = {
    signature:
        "IMff4G8CPJPS3O3zRYkqh160BU3dLCd9Is6F348yNkUBzMEstH2u6+PMfyULQeJQzspz+bEU6iq/b7QwRAvQKClV6kHXK0R5Yzfop7cDHD3v0uqTVwxbtbINOm6dbjO1iThOeP7ULSXzLEP0obVyy51v3xBqKfrdG8NMQd/VuU6rtxmRJQwJdPHEhjDFQ3QxtoOUnrGTUVED0eX22gORjxb1uW5vJ+T/63frIJ9gBgCYRA8luCmTt59hZRusmh0n21zIQmxIdRebmdwR15wI7hmrppqcH1e5Fm+MCVRu7JLySsP4r5DJ2PECw9gobq1am6F4SuUXZBbQaxq36QZk9Q",
    publicKey: signers[1].publicKey,
    type: "rsa",
    signedPropertyNames: ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"]
};

module.exports = {
    comment,
    fixtureSignature
};
