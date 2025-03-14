"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/clients/browser";
import { ComponentProps } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(64)
});

export function LoginForm({
                            className,
                            ...props
                          }: ComponentProps<"div">) {

  const supabase = createClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{"Login to your account"}</CardTitle>
          <CardDescription>
            {"Enter your email and password to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(async ({ email, password }) => {
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) {
                console.error(error);
                return toast.error(error.name, {
                  description: error.message,
                });
              }
              router.push("/dashboard");
            })}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Email"}</FormLabel>
                        <FormControl>
                          <Input disabled={form.formState.isSubmitting} placeholder="me@example.com" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Password"}</FormLabel>
                        <FormControl>
                          <Input disabled={form.formState.isSubmitting} type={"password"}
                                 placeholder="super-secret-password" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                    className="w-full"
                  >
                    {"Login"}
                  </Button>
                  {/*<Button variant="outline" className="w-full">*/}
                  {/*  Login with Google*/}
                  {/*</Button>*/}
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="#" className="underline underline-offset-4">
                  {"Sign up"}
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
