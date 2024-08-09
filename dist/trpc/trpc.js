"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateProcedure = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const t = server_1.initTRPC.context().create();
const middleware = t.middleware;
const isAuth = middleware(async ({ ctx, next }) => {
    const req = ctx.req;
    const { user } = req;
    if (!user || !user.id) {
        throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            user,
        },
    });
});
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.privateProcedure = t.procedure.use(isAuth);
