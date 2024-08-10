"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = void 0;
const stripe_1 = require("./lib/stripe");
const get_payload_1 = require("./get-payload");
const resend_1 = require("resend");
const ReceiptEmail_1 = require("./components/emails/ReceiptEmail");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const stripeWebhookHandler = async (req, res) => {
  var _a, _b;
  const webhookRequest = req;
  const body = webhookRequest.rawBody;
  const signature = req.headers["stripe-signature"] || "";
  let event;
  try {
    event = stripe_1.stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`
      );
  }
  const session = event.data.object;
  if (
    !((_a =
      session === null || session === void 0 ? void 0 : session.metadata) ===
      null || _a === void 0
      ? void 0
      : _a.userId) ||
    !((_b =
      session === null || session === void 0 ? void 0 : session.metadata) ===
      null || _b === void 0
      ? void 0
      : _b.orderId)
  ) {
    return res.status(400).send(`Webhook Error: No user present in metadata`);
  }
  if (event.type === "checkout.session.completed") {
    const payload = await (0, get_payload_1.getPayloadClient)();
    const { docs: users } = await payload.find({
      collection: "users",
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    });
    const [user] = users;
    if (!user) return res.status(404).json({ error: "No such user exists." });
    const { docs: orders } = await payload.find({
      collection: "orders",
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    });
    const [order] = orders;
    if (!user) return res.status(404).json({ error: "No such order exists." });
    await payload.update({
      collection: "orders",
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    });
    // send receipt
    try {
      const data = await resend.emails.send({
        from: "DigitalHippo <hippo@casekraze.mbumwa.com>",
        to: [user.email],
        subject: "Thanks for your order! This is your receipt.",
        html: (0, ReceiptEmail_1.ReceiptEmailHtml)({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products,
        }),
      });
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  return res.status(200).send();
};
exports.stripeWebhookHandler = stripeWebhookHandler;
