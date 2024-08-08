'use client'

import { TQueryValidator } from "@/lib/validators/query-validator";
import { Product } from "@/payload-types";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import ProductListing from "./ProductListing";

interface ProductReelProps {
    title: string
    subtitle?: string
    href?: string
    query: TQueryValidator
}

const FALLBACK_LIMIT = 4;

const ProductReel = (props: ProductReelProps) => {
    const { title, subtitle, href, query } = props;

    const { data: queryResults, isPending: isLoading } = trpc.getInfiniteProducts.useInfiniteQuery(
        {
            limit: query.limit ?? FALLBACK_LIMIT,
            query,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextPage,
        }
    );

    const products = queryResults?.pages.flatMap((page) => page.products);
    let map: (Product | null)[] = [];

    if (products && products.length) {
        // @ts-expect-error -- honestly have no idea why
        map = products;
    } else if (isLoading) {
        map = new Array<null>(query.limit || FALLBACK_LIMIT).fill(null);
    }
    console.log("map", map);


    return (
        <section className="py-12">
            <div className="md:flex md:items-center md:justify-between mb-4">
                <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>

                {href && (
                    <Link href={href} className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block group">
                        shop the collection <span aria-hidden="true" className="group-hover:ml-0.5 transition-all">&rarr;</span>
                    </Link>
                )}
            </div>
            <div className="relative">
                <div className="mt-6 flex items-center w-full">
                    <div className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
                        {map.map((product, idx) => (
                            <ProductListing
                                key={product?.id}
                                product={product}
                                index={idx}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductReel;
