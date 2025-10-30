"use client";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Link, Building } from "lucide-react";
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

export default function TruOverviewPage() {
  const trustImage = PlaceHolderImages.find(p => p.id === 'trust-background');

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center p-4">
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Link Your Holdings</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            To get started, link your property holdings to your VeraLogix account. You can use an invite code, a deed verification number, or request manual approval.
          </p>
          <div className="mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full max-w-sm vx-cta vx-focus text-lg">
                  <Link className="mr-2" />
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
                  <Button variant="secondary">Cancel</Button>
                  <Button className="vx-cta">Submit for Verification</Button>
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
  );
}
