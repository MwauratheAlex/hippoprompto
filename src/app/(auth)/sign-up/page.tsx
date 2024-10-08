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
import { ZodError } from "zod";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TAuthCredentialValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    });

    const { mutate, isPending: isLoading } = trpc.auth.createPayloadUser.useMutation({
        onError: (err) => {
            if (err.data?.code === "CONFLICT") {
                toast.error("This email is already is use. Sign in instead?");
                return;
            }

            if (err instanceof ZodError) {
                toast.error(err.issues[0].message);
                return;
            }
            toast.error("Something went wrong. Please try again.");
        },
        onSuccess: ({ sendToEmail }) => {
            toast.success(`Verification email sent to ${sendToEmail}`);
            router.push(`verify-email?to=${sendToEmail}`);
        },
    });

    const onSubmit = ({ email, password }: TAuthCredentialValidator) => {
        mutate({ email, password });
    }

    return (
        <>
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Icons.logo className="h-20 w-20" />
                        <h1 className="text-2xl font-bold">
                            Create an account
                        </h1>

                        <Link href="/sign-in" className={buttonVariants({
                            variant: "link",
                            className: "gap-1.5 group transition-all",
                        })}>
                            Already have an account? Sign-in
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
                                    {errors.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                                <Button>Sign up</Button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Page;
