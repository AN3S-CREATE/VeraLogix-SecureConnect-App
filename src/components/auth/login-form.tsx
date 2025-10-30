"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { KeyRound, Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  profile: z.enum(["Agent", "Resident", "Trustee", "Vendor", "Estate Manager"]),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  remember: z.boolean().default(false).optional(),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
      profile: "Agent",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // This is a placeholder for the login logic.
    // In a real application, you would make an API call here.
    console.log(values);
  }

  return (
    <div className="w-full max-w-sm space-y-6 p-8 vx-card">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
          Agent Console
        </h1>
        <p className="mt-2 text-muted-foreground">
          Securely sign in to your Veralogix account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="vx-focus">
                      <SelectValue placeholder="Select a profile to log in" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Resident">Resident</SelectItem>
                    <SelectItem value="Trustee">Trustee</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Estate Manager">Estate Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="agent@veralogix.com" {...field} className="vx-focus" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="vx-focus" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="vx-focus"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
             <Link
                href="#"
                className="text-sm font-medium text-primary hover:text-primary/90 hover:underline underline-offset-4 transition-colors vx-focus"
              >
                Forgot password?
              </Link>
          </div>
          <Button type="submit" className={cn("w-full transition-all vx-cta", "hover:shadow-[0_0_15px_theme(colors.primary.DEFAULT)]")}>
            <KeyRound className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
            Or continue with
            </span>
        </div>
      </div>
      
      <Button variant="outline" className="w-full font-semibold transition-all hover:border-accent hover:text-accent-foreground hover:shadow-[0_0_15px_theme(colors.accent)] vx-focus">
        <Shield className="mr-2 h-4 w-4" />
        Sign In with SSO
      </Button>
    </div>
  );
}
