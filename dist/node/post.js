"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("./comment");
const assert_1 = __importDefault(require("assert"));
class Post extends comment_1.Comment {
    _initProps(props) {
        super._initProps(props);
        this.parentCid = undefined;
        this.title = props["title"];
    }
    toJSONSkeleton() {
        return Object.assign(Object.assign({}, super.toJSONSkeleton()), { title: this.title });
    }
    publish(userOptions) {
        const _super = Object.create(null, {
            publish: { get: () => super.publish }
        });
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.title, "Post needs a title to publish");
            return _super.publish.call(this, userOptions);
        });
    }
}
exports.default = Post;
