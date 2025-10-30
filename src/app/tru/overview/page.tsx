"use client";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LinkIcon, Building, ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function TruOverviewPage() {
  const trustImage = PlaceHolderImages.find(p => p.id === 'trust-background');
  const router = useRouter();
  const { toast } = useToast();

  const handleLink = () => {
    toast({
      title: "Verification Submitted",
      description: "Your holdings are being verified. You will now be redirected to your dashboard.",
    });
    // In a real app, you'd wait for a response before redirecting
    setTimeout(() => {
        router.push('/tru/security');
    }, 2000);
  }

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Portfolio Overview</h1>

        <div className="relative min-h-[400px] w-full flex items-center justify-center p-4 rounded-lg overflow-hidden">
            {trustImage && (
                <Image
                    src={trustImage.imageUrl}
                    alt={trustImage.description}
                    fill
                    quality={100}
                    className="object-cover"
                    data-ai-hint={trustImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-2xl text-center">
                <div className="vx-card p-8 md:p-12">
                    <Building className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Link Your Holdings</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        To get started, link your property holdings to your VeraLogix account using an invite code or deed verification number.
                    </p>
                    <div className="mt-8">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full max-w-sm vx-cta vx-focus text-lg">
                                    <LinkIcon className="mr-2" />
                                    Link Ownership
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] bg-background border-white/10">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                <DialogHeader>
                                <DialogTitle>Link Ownership</DialogTitle>
                                <DialogDescription>
                                    Enter your invite code or deed verification number below.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="link-code">Invite Code or Deed #</Label>
                                    <Input id="link-code" placeholder="Enter code" className="vx-focus" />
                                </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button className="vx-cta" onClick={handleLink}>Submit for Verification</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Need assistance? <a href="#" className="font-semibold text-primary hover:underline">Contact support</a>.
                    </p>
                </div>
            </div>
        </div>

        <div className="vx-card p-6">
            <h2 className="text-xl font-bold mb-4">Linked Holdings</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-md border border-border">
                    <div>
                        <p className="font-semibold">The Grand Regency</p>
                        <p className="text-sm text-muted-foreground">123 Luxury Ave, Metropolis</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="vx-focus">
                        <Link href="/tru/security">View Dashboard <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
                 <div className="flex justify-between items-center p-4 rounded-md border border-border opacity-60">
                    <div>
                        <p className="font-semibold">Oceanview Towers</p>
                        <p className="text-sm text-muted-foreground">456 Shoreline Dr, Coast City</p>
                    </div>
                    <Button variant="outline" size="sm" className="vx-focus" disabled>Verification Pending</Button>
                </div>
            </div>
        </div>
    </div>
  );
}
