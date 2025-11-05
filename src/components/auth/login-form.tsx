
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, initiateEmailSignIn } from "@/firebase";
import { useEffect } from "react";

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

const profileRoutes: Record<string, string> = {
    "Agent": "/cmd",
    "Resident": "/ten/home",
    "Trustee": "/tru/overview",
    "Vendor": "/ven/onboarding",
    "Estate Manager": "/cmd"
};

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
      profile: "Agent",
    },
  });

  const profile = form.watch("profile");

  useEffect(() => {
    if (auth.currentUser) {
      const route = profileRoutes[profile] || "/";
      router.push(route);
    }
  }, [auth.currentUser, profile, router]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
        title: "Signing In...",
        description: `Attempting to log in as ${values.profile}.`,
    });

    // Special case for admin user to allow logging into any profile
    if (
      values.email === "admin@veralogix.com" &&
      values.password === "admin"
    ) {
      initiateEmailSignIn(auth, values.email, values.password);
      return;
    }
    
    // Default login logic
    initiateEmailSignIn(auth, values.email, values.password);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
          Agent Secure Login
        </h1>
        <p className="mt-2 text-muted-foreground">
          Access the VeraLogix Command Center.
        </p>
      </div>

      <div className="vx-card p-8">
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
                    <Input placeholder="user@veralogix.com" {...field} className="vx-focus" />
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
            <Button type="submit" className={cn("w-full transition-all vx-cta vx-focus")}>
              <KeyRound className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </form>
        </Form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
              Or continue with
              </span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full font-semibold transition-all vx-focus">
          <Shield className="mr-2 h-4 w-4" />
          Sign In with SSO
        </Button>
      </div>
    </div>
  );
}

    