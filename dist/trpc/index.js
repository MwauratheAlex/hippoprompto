"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const zod_1 = require("zod");
const auth_router_1 = require("./auth-router");
const trpc_1 = require("./trpc");
const query_validator_1 = require("../lib/validators/query-validator");
const get_payload_1 = require("../get-payload");
const payment_router_1 = require("./payment-router");
exports.appRouter = (0, trpc_1.router)({
    auth: auth_router_1.authRouter,
    payment: payment_router_1.paymentRouter,
    getInfiniteProducts: trpc_1.publicProcedure.
        input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100),
        cursor: zod_1.z.number().nullish(),
        query: query_validator_1.QueryValidator
    })).
        query(async ({ input }) => {
        const { query, cursor } = input;
        const { sort, limit } = query, queryOpts = __rest(query, ["sort", "limit"]);
        const payload = await (0, get_payload_1.getPayloadClient)();
        const parsedQueryOptions = {};
        Object.entries(queryOpts).forEach(([key, value]) => {
            parsedQueryOptions[key] = {
                equals: value,
            };
        });
        const page = cursor || 1;
        const { docs: products, hasNextPage, nextPage } = await payload.find({
            collection: "products",
            where: Object.assign({ approvedForSale: {
                    equals: "approved",
                } }, parsedQueryOptions),
            sort,
            depth: 1,
            limit,
            page
        });
        return {
            products,
            nextPage: hasNextPage ? nextPage : null,
        };
    }),
});
