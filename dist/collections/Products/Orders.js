"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
const yourOwn = ({ req: { user } }) => {
    if (user.role === "admin")
        return true;
    return {
        user: {
            equals: user === null || user === void 0 ? void 0 : user.id
        }
    };
};
exports.Orders = {
    slug: "orders",
    admin: {
        useAsTitle: "Your Orders",
        description: "A suumary of your orders on DigitalHippo",
    },
    access: {
        read: yourOwn,
        update: ({ req }) => req.user.role === "admin",
        delete: ({ req }) => req.user.role === "admin",
        create: ({ req }) => req.user.role === "admin",
    },
    fields: [
        {
            name: "_isPaid",
            type: "checkbox",
            access: {
                read: ({ req }) => req.user.role === "admin",
                create: () => false,
                update: () => false,
            },
            admin: {
                hidden: true,
            },
            required: true,
        },
        {
            name: "user",
            type: "relationship",
            admin: {
                hidden: true,
            },
            relationTo: "users",
            required: true,
        },
        {
            name: "products",
            type: "relationship",
            relationTo: "products",
            required: true,
            hasMany: true,
        },
    ],
};
