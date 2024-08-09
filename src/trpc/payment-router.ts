import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from '@trpc/server';
import { getPayloadClient } from '../get-payload';
import { stripe } from '../lib/stripe';
import { Order, Product } from '../payload-types';
import type Stripe from 'stripe';
import { throws } from 'assert';

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const payload = await getPayloadClient();

      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      });


      // @ts-expect-error
      const filteredProdcuts = products.filter((prod) => Boolean(prod.priceId)) as Product[];

      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          products: filteredProdcuts.map((prod) => prod.id),
          user: user.id,
        }
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      filteredProdcuts.forEach((product) => line_items.push({
        price: product.priceId!,
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
        const stripeSession = await stripe.checkout.sessions.create({
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

      } catch (err) {
        console.log("Error creating payment session: ", err);
        return { url: null }
      }


    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;

      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId
          }
        }
      });

      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // @ts-expect-error
      const [order] = orders as Order[];

      return { isPaid: order._isPaid }

    }),
});
