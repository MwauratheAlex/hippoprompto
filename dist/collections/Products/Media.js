"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
const isAdminOrHasAccessToImages = () => async ({ req, }) => {
    const user = req.user;
    if (!user)
        return false;
    if (user.role === "admin")
        return true;
    return {
        user: {
            equals: req.user.id,
        },
    };
};
exports.Media = {
    slug: "media",
    hooks: {
        beforeChange: [({ req, data }) => {
                return Object.assign(Object.assign({}, data), { user: req.user.id });
            },]
    },
    access: {
        read: async ({ req }) => {
            const referer = req.headers.referer;
            if (!req.user || !(referer === null || referer === void 0 ? void 0 : referer.includes("sell"))) {
                return true;
            }
            return await isAdminOrHasAccessToImages()({ req });
        },
        delete: isAdminOrHasAccessToImages(),
        update: isAdminOrHasAccessToImages(),
    },
    admin: {
        hidden: ({ user }) => user.role !== "admin",
    },
    upload: {
        staticURL: "/media",
        staticDir: "media",
        imageSizes: [
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre",
            },
            {
                name: "card",
                width: 768,
                height: 1024,
                position: "centre",
            },
            {
                name: "tablet",
                width: 1024,
                height: undefined,
                position: "centre",
            },
        ],
        mimeTypes: ["image/*"]
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
        }
    ]
};
