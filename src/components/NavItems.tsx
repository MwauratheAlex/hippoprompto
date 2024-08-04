'use client'

import NavItem from "./NavItem";
import { PRODUCT_CATEGORIES } from "@/config";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { useEffect, useRef, useState } from "react";

const NavItems = () => {
    const [activeIndex, setActiveIndex] = useState<null | number>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveIndex(null);
            }
        }

        document.addEventListener("keydown", handler);

        return () => {
            document.removeEventListener("keydown", handler);
        }
    }, []);


    const isAnyOpen = activeIndex !== null;
    const navRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(navRef, () => setActiveIndex(null));

    return (
        <div ref={navRef} className="flex  gap-4 h-full">
            {PRODUCT_CATEGORIES.map((category, idx) => {
                const handleOpen = () => {
                    if (activeIndex === idx) {
                        setActiveIndex(null);
                    } else {
                        setActiveIndex(idx);
                    }
                }

                const isOpen = activeIndex === idx;

                return (
                    <div key={category.value}>
                        <NavItem isOpen={isOpen} isAnyOpen={isAnyOpen} category={category} handleOpen={handleOpen} />
                    </div>
                );
            })}
        </div>
    );
}

export default NavItems;
