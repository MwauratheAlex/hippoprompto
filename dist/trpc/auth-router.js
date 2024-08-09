"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const accountCredentialValidator_1 = require("../lib/validators/accountCredentialValidator");
const trpc_1 = require("./trpc");
const payload_1 = __importDefault(require("payload"));
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const get_payload_1 = require("../get-payload");
exports.authRouter = (0, trpc_1.router)({
    createPayloadUser: trpc_1.publicProcedure.
        input(accountCredentialValidator_1.AuthCredentialsValidator).
        mutation(async ({ input }) => {
        const { email, password } = input;
        // check if user already exists
        const { docs: users } = await payload_1.default.find({
            collection: "users",
            where: {
                email: {
                    equals: email,
                },
            },
        });
        if (users.length !== 0)
            throw new server_1.TRPCError({ code: "CONFLICT" });
        await payload_1.default.create({
            collection: "users",
            data: {
                email,
                password,
                role: "user",
            }
        });
        return { success: true, sendToEmail: email };
    }),
    verifyEmail: trpc_1.publicProcedure.
        input(zod_1.z.object({ token: zod_1.z.string() })).
        query(async ({ input }) => {
        const { token } = input;
        const payload = await (0, get_payload_1.getPayloadClient)();
        const isVerified = await payload.verifyEmail({
            collection: "users",
            token,
        });
        if (!isVerified) {
            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
        }
        return { success: true };
    }),
    signIn: trpc_1.publicProcedure.input(accountCredentialValidator_1.AuthCredentialsValidator).mutation(async ({ input, ctx }) => {
        const { email, password } = input;
        const payload = await (0, get_payload_1.getPayloadClient)();
        const { res } = ctx;
        try {
            await payload.login({
                collection: "users",
                data: {
                    email,
                    password,
                },
                res,
            });
            return { success: true };
        }
        catch (err) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
        }
    }),
});
