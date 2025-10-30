"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, UserPlus, Bell, FileText, Home } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  { id: 1, title: "Link Your Unit", icon: <Home /> },
  { id: 2, title: "Privacy Consent", icon: <FileText /> },
  { id: 3, title: "Notifications", icon: <Bell /> },
  { id: 4, title: "Add Household", icon: <UserPlus /> },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete, redirect to home
      router.push("/ten/home");
    }
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <LinkUnitStep />;
      case 2:
        return <PrivacyConsentStep />;
      case 3:
        return <NotificationsStep />;
      case 4:
        return <AddHouseholdStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="p-6 bg-gradient-to-br from-[var(--g1)] to-[var(--g3)] rounded-t-lg">
           <h1 className="text-2xl font-bold text-center text-primary-foreground">Welcome to VeraLogix</h1>
        </div>

        <div className="vx-card p-6 md:p-8 rounded-b-lg">
            <div className="flex items-center justify-center mb-6">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex flex-col items-center ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.id <= currentStep ? 'bg-primary/20 border-primary' : 'border-muted'}`}>
                                {step.icon}
                            </div>
                            <p className="text-xs mt-1 text-center">{step.title}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${index < currentStep -1 ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>

            <div className="min-h-[250px]">
              <StepContent />
            </div>

            <Button onClick={handleNext} className="w-full vx-cta vx-focus mt-6">
                {currentStep === steps.length ? "Finish Setup" : "Continue"}
                <ArrowRight className="ml-2" />
            </Button>
        </div>
      </div>
    </div>
  );
}


function LinkUnitStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Link Your Unit</h2>
            <p className="text-center text-muted-foreground text-sm">Enter the invite code you received from management.</p>
            <div className="pt-4">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input id="invite-code" placeholder="ABC-123" className="vx-focus text-center text-lg tracking-widest" />
            </div>
        </div>
    )
}

function PrivacyConsentStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Privacy & Consent</h2>
            <div className="h-32 overflow-y-auto p-3 border rounded-md text-sm text-muted-foreground space-y-2">
                <p>By using VeraLogix SecureConnect™, you agree to the collection and processing of your personal data as described in our Privacy Policy. This includes, but is not limited to, data related to access control, amenity bookings, and service requests.</p>
                <p>We are committed to protecting your data in accordance with POPIA and other applicable regulations.</p>
            </div>
             <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="terms" className="vx-focus"/>
                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I have read and agree to the terms and conditions.
                </Label>
            </div>
        </div>
    )
}

function NotificationsStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Notification Channels</h2>
            <p className="text-center text-muted-foreground text-sm">Choose how you'd like to receive alerts.</p>
             <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                    <Switch id="push-notifications" defaultChecked className="vx-focus" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="email-notifications" className="font-medium">Email Alerts</Label>
                    <Switch id="email-notifications" defaultChecked className="vx-focus" />
                </div>
                 <div className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor="sms-notifications" className="font-medium">SMS Messages</Label>
                    <Switch id="sms-notifications" className="vx-focus" />
                </div>
            </div>
        </div>
    )
}

function AddHouseholdStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Setup Your Household</h2>
            <p className="text-center text-muted-foreground text-sm">You can invite other members of your household later from your profile.</p>
            <div className="pt-4 space-y-2">
                <Label htmlFor="member-email">Member's Email</Label>
                <div className="flex gap-2">
                    <Input id="member-email" type="email" placeholder="family.member@email.com" className="vx-focus" />
                    <Button variant="outline" className="vx-focus"><UserPlus /></Button>
                </div>
            </div>
             <p className="text-xs text-center text-muted-foreground pt-4">You can skip this for now.</p>
        </div>
    )
}