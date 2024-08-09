"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
const config_1 = require("../../config");
const stripe_1 = require("../../lib/stripe");
const addUser = async ({ req, data }) => {
    const user = req.user;
    return Object.assign(Object.assign({}, data), { user: user.id });
};
exports.Products = {
    slug: "products",
    admin: {
        useAsTitle: "name",
    },
    access: {},
    hooks: {
        beforeChange: [
            addUser,
            async (args) => {
                if (args.operation === "create") {
                    const data = args.data;
                    const createdProduct = await stripe_1.stripe.products.create({
                        name: data.name,
                        default_price_data: {
                            currency: "KES",
                            unit_amount: Math.round(data.price * 100)
                        }
                    });
                    const updated = Object.assign(Object.assign({}, data), { stripeId: createdProduct.id, priceId: createdProduct.default_price });
                    return updated;
                }
                else if (args.operation === "update") {
                    const data = args.data;
                    const updatedProduct = await stripe_1.stripe.products.update(data.stripeId, {
                        name: data.name,
                        default_price: data.priceId,
                    });
                    const updated = Object.assign(Object.assign({}, data), { stripeId: updatedProduct.id, priceId: updatedProduct.default_price });
                    return updated;
                }
            }
        ],
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false,
            admin: {
                condition: () => false,
            }
        },
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "textarea",
            label: "Product details",
        },
        {
            name: "price",
            label: "price in USD",
            min: 0,
            max: 1000,
            type: "number",
            required: true
        },
        {
            name: "category",
            label: "Category",
            type: "select",
            options: config_1.PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
            required: true,
        },
        {
            name: "product_files",
            label: "Product file(s)",
            type: "relationship",
            required: true,
            relationTo: "product_files",
            hasMany: false,
        },
        {
            name: "approvedForSale",
            label: "Product Status",
            type: "select",
            defaultValue: "pending",
            access: {
                create: ({ req }) => req.user.role === "admin",
                read: ({ req }) => req.user.role === "admin",
                update: ({ req }) => req.user.role === "admin",
            },
            options: [
                {
                    label: "Pending verification",
                    value: "pending",
                },
                {
                    label: "Approved",
                    value: "approved",
                },
                {
                    label: "Denied",
                    value: "denied",
                },
            ]
        },
        {
            name: "priceId",
            access: {
                create: () => false,
                read: () => false,
                update: () => false,
            },
            type: "text",
            admin: {
                hidden: true
            },
        },
        {
            name: "stripeId",
            access: {
                create: () => false,
                read: () => false,
                update: () => false,
            },
            type: "text",
            admin: {
                hidden: true
            },
        },
        {
            name: "images",
            type: "array",
            label: "Product images",
            minRows: 1,
            maxRows: 4,
            required: true,
            labels: {
                singular: "Image",
                plural: "Images",
            },
            fields: [
                {
                    name: "images",
                    type: "upload",
                    relationTo: "media",
                    required: true,
                }
            ],
        },
    ],
};
