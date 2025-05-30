import { expect } from "chai";
import { parseDbResponses } from "../../dist/node/util.js";
import { describeSkipIfRpc } from "../../dist/node/test/test-util.js";

describeSkipIfRpc(`Test parsing of database queries`, async () => {
    it(`Can parse regular json object with a field that's json string`, async () => {
        const rawObj = {
            author: '{"address":"12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR","displayName":"Mock Author - 1676110849.7439198"}'
        };
        const parsed = parseDbResponses(rawObj);
        expect(parsed).to.be.a("object");
        expect(parsed.author).to.be.a("object");
        expect(parsed.author.address).to.equal("12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR");
        expect(parsed.author.displayName).to.equal("Mock Author - 1676110849.7439198");
    });

    it(`Can parse regular json object with a boolean field (hardcoded)`, async () => {
        const rawObj = {
            removed: 1
        };
        const parsed = parseDbResponses(rawObj);
        expect(parsed).to.be.a("object");
        expect(parsed.removed).to.equal(true);
    });

    it(`Can parse regular json object with a stringifed array field`, async () => {
        const rawObj = {
            acceptedChallengeTypes: '["test"]'
        };

        const parsed = parseDbResponses(rawObj);
        expect(parsed).to.be.a("object");
        expect(parsed.acceptedChallengeTypes).to.be.a("array");
        expect(parsed.acceptedChallengeTypes[0]).to.equal("test");
    });

    it(`Only parses one level of json strings`, async () => {
        const author = {
            address: "12D3KooWL8oSq4yRKyw1cB83t9GeNcvxrDEQVkdE5F3PjBunzcVq",
            avatar: {
                address: "0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188",
                chainTicker: "matic",
                id: "9842",
                signature: {
                    signature:
                        '{"domainSeparator":"plebbit-author-avatar","authorAddress":"12D3KooWJsiCyvG9mjRtWzc8TqzS7USKUrFFNs9s2AJuGqNhn9uU","timestamp":1709879936,"tokenAddress":"0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188","tokenId":"9842"}',
                    type: "eip191"
                }
            }
        };
        const rawComment = {
            author
        };

        const parsedComment = parseDbResponses(rawComment);

        expect(parsedComment).to.be.a("object");
        expect(parsedComment.author).to.be.a("object");
        expect(parsedComment.author.address).to.be.a("string");
        expect(parsedComment.author.avatar).to.be.a("object");
        expect(parsedComment.author.avatar.address).to.be.a("string");
        expect(parsedComment.author.avatar.chainTicker).to.be.a("string");
        expect(parsedComment.author.avatar.id).to.be.a("string");

        expect(parsedComment.author.avatar.signature).to.be.a("object");
        expect(parsedComment.author.avatar.signature.signature).to.be.a("string");
        expect(parsedComment.author.avatar.signature.type).to.be.a("string");
    });
});
