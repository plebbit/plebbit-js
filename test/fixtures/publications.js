import signers from "./signers";

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

export { comment };
