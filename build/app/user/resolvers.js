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
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../client/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const queries = {
    verifyGoogleToken: (parent, { token }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const googleAuthToken = token;
        const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set("id_token", googleAuthToken);
        const { data } = yield axios_1.default.get(googleOAuthURL.toString(), {
            responseType: "json",
        });
        const checkExisitingUser = yield db_1.prismaclient.user.findUnique({
            where: { email: data.email },
        });
        if (!checkExisitingUser) {
            yield db_1.prismaclient.user.create({
                data: {
                    email: (_a = data === null || data === void 0 ? void 0 : data.email) !== null && _a !== void 0 ? _a : "",
                    firstName: (_b = data === null || data === void 0 ? void 0 : data.given_name) !== null && _b !== void 0 ? _b : "",
                    LastName: data.family_name,
                    profileImageURL: data.picture,
                },
            });
        }
        const IfExists = yield db_1.prismaclient.user.findUnique({
            where: { email: data.email },
        });
        if (!IfExists)
            throw new Error("User not found");
        const userToken = jwt_1.default.generateTokenForUser(IfExists);
        return userToken;
    }),
};
exports.resolvers = { queries };
