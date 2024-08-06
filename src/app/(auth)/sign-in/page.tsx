'use client'

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCredentialsValidator, TAuthCredentialValidator } from "@/lib/validators/accountCredentialValidator";
import { trpc } from "@/trpc/client";
import { toast } from 'sonner';
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSeller = searchParams.get("as") === "seller";
    const origin = searchParams.get("origin");

    const continueAsSeller = () => {
        router.push("?as=seller");
    }
    const continueAsBuyer = () => {
        router.replace("/sign-in", undefined);
    }

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TAuthCredentialValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    });

    const { mutate: signIn, isPending: isLoading } = trpc.auth.signIn.useMutation({
        onSuccess: () => {
            toast.success("Signed in successfully");

            if (origin) {
                router.push(`/${origin}`);
            } else if (isSeller) {
                router.push("/sell");
            } else {
                router.push("/");
            }

            router.refresh();
        },
        onError: (err) => {
            if (err.data?.code === "UNAUTHORIZED") {
                toast.error("Invalid email or password");
                return;
            }

            toast.error("Something went wrong. Please try again.");
        },
    });

    const onSubmit = ({ email, password }: TAuthCredentialValidator) => {
        signIn({ email, password });
    }

    return (
        <>
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Icons.logo className="h-20 w-20" />
                        <h1 className="text-2xl font-bold">
                            Sign in to your {isSeller && "seller"} account
                        </h1>

                        <Link href="/sign-up" className={buttonVariants({
                            variant: "link",
                            className: "gap-1.5 group transition-all",
                        })}>
                            Don&apos;t have an account? Sign-up
                            <ArrowRight className="h-4 w-4 group-hover:ml-0.5 transition-all" />
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-2">
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        className={cn({
                                            "focus-visible:ring-red-500": errors.email
                                        })}
                                        placeholder="you@example.com"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>
                                    <Input
                                        className={cn({
                                            "focus-visible:ring-red-500": errors.password
                                        })}
                                        placeholder="Password"
                                        {...register("password")}
                                        type="password"
                                    />
                                </div>
                                <Button>Sign in</Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    or
                                </span>
                            </div>
                        </div>

                        {isSeller ? (
                            <Button
                                variant="secondary" disabled={isLoading}
                                onClick={continueAsBuyer}
                            >
                                Continue as customer
                            </Button>
                        ) : (
                            <Button
                                variant="secondary" disabled={isLoading}
                                onClick={continueAsSeller}
                            >
                                Continue as seller
                            </Button>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default Page;
