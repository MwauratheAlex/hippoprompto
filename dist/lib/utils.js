"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatPrice = formatPrice;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function formatPrice(price, options = {}) {
    const { currency = "KES", notation = "standard" } = options;
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        notation,
        maximumFractionDigits: 2,
    }).format(numericPrice);
}
