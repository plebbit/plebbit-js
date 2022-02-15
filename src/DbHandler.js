import {challengeStages} from "./Challenge.js";

const TABLES = Object.freeze({
    comments: "comments",
    votes: "votes",
    authors: "authors",
    challenges: "challenges"
});


class DbHandler {
    constructor(knex) {
        this.knex = knex;
    }

    async #createCommentsTable() {
        await this.knex.schema.createTable(TABLES.comments, (table) => {
            table.text("commentCid").notNullable().primary().unique();
            table.text("authorIpnsName").notNullable().references("ipnsName").inTable(TABLES.authors);
            table.text("parentCommentCid").nullable().references("commentCid").inTable(TABLES.comments);
            table.text("postCid").notNullable().references("commentCid").inTable(TABLES.comments);
            table.text("previousCommentCid").nullable().references("commentCid").inTable(TABLES.comments);
            table.uuid("challengeRequestId").notNullable().references("requestId").inTable(TABLES.challenges);

            table.text("subplebbitIpnsName").notNullable();
            table.text("content").notNullable();
            table.timestamp("timestamp").notNullable();
            table.text("signature").nullable(); // Will likely revise later
            table.text("commentIpnsName").notNullable().unique();
            table.text("title").nullable();
        });

    }


    async #createVotesTable() {
        await this.knex.schema.createTable(TABLES.votes, (table) => {
            table.text("commentCid").notNullable().references("commentCid").inTable(TABLES.comments);
            table.text("authorIpnsName").notNullable().references("ipnsName").inTable(TABLES.authors);
            table.uuid("challengeRequestId").notNullable().references("requestId").inTable(TABLES.challenges);

            table.timestamp("timestamp").notNullable();
            table.text("subplebbitIpnsName").notNullable();
            table.enum("vote", [-1, 0, 1]).notNullable();
            table.text("signature").nullable(); // Will likely revise later

            table.primary(["commentCid", "authorIpnsName"]); // An author can't have multiple votes on a comment
        });
    }

    async #createAuthorsTable() {
        await this.knex.schema.createTable(TABLES.authors, (table) => {
            table.text("ipnsName").notNullable().primary().unique();
            table.text("displayName").notNullable();
        });

    }

    async #createChallengesTable() {
        await this.knex.schema.createTable(TABLES.challenges, (table) => {
            table.uuid("requestId").notNullable().primary().unique();

            table.enum("stage", Object.values(challengeStages)).notNullable();
            table.text("challenge").nullable();
            table.text("type").nullable(); // Challenge type

            table.text("answer").nullable();
            table.boolean("answerIsVerified").nullable();
            table.text("answerVerificationReason").nullable();
            table.uuid("answerId").nullable().unique();
            table.json("acceptedChallengeTypes").nullable();
            // TODO store the IP of challenge initiator
        });
    }

    async createTablesIfNeeded() {
        const functions = [this.#createCommentsTable, this.#createVotesTable, this.#createAuthorsTable, this.#createChallengesTable];
        const tables = Object.values(TABLES);
        for (const table of tables) {
            const i = tables.indexOf(table);
            const tableExists = await this.knex.schema.hasTable(table);
            if (!tableExists)
                await functions[i].bind(this)();

        }
    }

    async #addAuthorToDbIfNeeded(author) {
        return new Promise(async (resolve, reject) => {
            const authorFromDb = await this.knex(TABLES.authors).where({"ipnsName": author.ipnsName}).first();
            if (!authorFromDb) // Author is new. Add to database
                this.knex(TABLES.authors).insert(author.toJSON()).then(() => resolve(author.toJSON())).catch(err => {
                    console.error(err);
                    reject(err);
                });
            else
                resolve(authorFromDb);
        });
    }

    async upsertVote(vote) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(vote.author);
            const dbObject = vote.toJSONForDb();
            this.knex(TABLES.votes).insert(vote.toJSONForDb()).onConflict(['commentCid', "authorIpnsName"]).merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }


    async insertComment(postOrComment) {
        return new Promise(async (resolve, reject) => {
            await this.#addAuthorToDbIfNeeded(postOrComment.author);
            const dbObject = postOrComment.toJSONForDb();
            this.knex(TABLES.comments).insert(dbObject).then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });

        });
    }

    async upsertChallenge(challenge) {
        return new Promise(async (resolve, reject) => {
            const dbObject = challenge.toJSONForDb();
            this.knex(TABLES.challenges).insert(challenge.toJSONForDb()).onConflict('requestId').merge().then(() => resolve(dbObject)).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }
}

export default DbHandler;