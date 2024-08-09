"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("./trpc");
const server_1 = require("@trpc/server");
const get_payload_1 = require("../get-payload");
const stripe_1 = require("../lib/stripe");
exports.paymentRouter = (0, trpc_1.router)({
    createSession: trpc_1.privateProcedure
        .input(zod_1.z.object({ productIds: zod_1.z.array(zod_1.z.string()) }))
        .mutation(async ({ ctx, input }) => {
        const { user } = ctx;
        let { productIds } = input;
        if (productIds.length === 0) {
            throw new server_1.TRPCError({ code: "BAD_REQUEST" });
        }
        const payload = await (0, get_payload_1.getPayloadClient)();
        const { docs: products } = await payload.find({
            collection: "products",
            where: {
                id: {
                    in: productIds,
                },
            },
        });
        // @ts-expect-error
        const filteredProdcuts = products.filter((prod) => Boolean(prod.priceId));
        const order = await payload.create({
            collection: "orders",
            data: {
                _isPaid: false,
                products: filteredProdcuts.map((prod) => prod.id),
                user: user.id,
            }
        });
        const line_items = [];
        filteredProdcuts.forEach((product) => line_items.push({
            price: product.priceId,
            quantity: 1
        }));
        line_items.push({
            price: "price_1PlnM8GbNuTZ2fhnGjoJzqY5",
            quantity: 1,
            adjustable_quantity: {
                enabled: false,
            }
        });
        try {
            const stripeSession = await stripe_1.stripe.checkout.sessions.create({
                success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
                cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
                payment_method_types: ["card"],
                mode: "payment",
                metadata: {
                    userId: user.id,
                    orderId: order.id,
                },
                line_items
            });
            return { url: stripeSession.url };
        }
        catch (err) {
            console.log("Error creating payment session: ", err);
            return { url: null };
        }
    }),
    pollOrderStatus: trpc_1.privateProcedure
        .input(zod_1.z.object({ orderId: zod_1.z.string() }))
        .query(async ({ input }) => {
        const { orderId } = input;
        const payload = await (0, get_payload_1.getPayloadClient)();
        const { docs: orders } = await payload.find({
            collection: "orders",
            where: {
                id: {
                    equals: orderId
                }
            }
        });
        if (!orders.length) {
            throw new server_1.TRPCError({ code: "NOT_FOUND" });
        }
        // @ts-expect-error
        const [order] = orders;
        return { isPaid: order._isPaid };
    }),
});
