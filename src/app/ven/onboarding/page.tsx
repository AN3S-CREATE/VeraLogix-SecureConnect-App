
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Building, FileText, Users, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Company Profile", icon: <Building /> },
  { id: 2, title: "Certifications", icon: <FileText /> },
  { id: 3, title: "Team Setup", icon: <Users /> },
];

export default function VendorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/ven/dashboard");
    }
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <CompanyProfileStep />;
      case 2:
        return <CertificationsStep />;
      case 3:
        return <TeamSetupStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="p-6 bg-gradient-to-br from-[var(--g1)] to-[var(--g3)] rounded-t-lg">
           <h1 className="text-2xl font-bold text-center text-primary-foreground">Vendor Enrollment</h1>
        </div>

        <div className="vx-card p-6 md:p-8 rounded-b-lg">
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex flex-col items-center text-center ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors", step.id <= currentStep ? 'bg-primary/20 border-primary' : 'border-muted', {'animate-pulse': step.id === currentStep})}>
                                {step.id < currentStep ? <Check /> : step.icon}
                            </div>
                            <p className="text-xs mt-1 w-20">{step.title}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${index < currentStep -1 ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>

            <div className="min-h-[300px]">
              <StepContent />
            </div>

            <Button onClick={handleNext} className="w-full vx-cta vx-focus mt-8">
                {currentStep === steps.length ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="ml-2" />
            </Button>
        </div>
      </div>
    </div>
  );
}

function CompanyProfileStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Company Profile</h2>
            <p className="text-center text-muted-foreground text-sm">Tell us about your business.</p>
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="e.g., PlumbCo" className="vx-focus" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company-reg">Registration Number</Label>
                    <Input id="company-reg" placeholder="2024/123456/07" className="vx-focus" />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="company-address">Business Address</Label>
                    <Textarea id="company-address" placeholder="123 Main Street, Anytown..." className="vx-focus" />
                </div>
            </div>
        </div>
    )
}

function CertificationsStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Certifications & COI</h2>
            <p className="text-center text-muted-foreground text-sm">Upload your Certificate of Insurance and other relevant documents.</p>
            <div className="pt-4 space-y-4">
                <DocUploader title="Certificate of Insurance (COI)" />
                <DocUploader title="Safety Compliance Certificate" />
            </div>
        </div>
    )
}

function DocUploader({ title }: { title: string }) {
    return (
        <div className="p-4 border rounded-md">
            <Label htmlFor="doc-coi" className="font-medium">{title}</Label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/50 px-6 py-6 bg-black/20">
                <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-500" />
                    <div className="mt-2 flex text-sm text-gray-400">
                        <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary vx-focus">
                            <span>Upload a file</span>
                            <Input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </div>
            </div>
        </div>
    )
}


function TeamSetupStep() {
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <h2 className="text-xl font-semibold text-center">Invite Your Team</h2>
            <p className="text-center text-muted-foreground text-sm">Add team members who will need access to the platform.</p>
            <div className="pt-4 space-y-2">
                <Label htmlFor="member-email">Team Member's Email</Label>
                <div className="flex gap-2">
                    <Input id="member-email" type="email" placeholder="colleague@email.com" className="vx-focus" />
                    <Button variant="outline" className="vx-focus">Add Member</Button>
                </div>
            </div>
             <p className="text-xs text-center text-muted-foreground pt-4">You can always add more team members later from your dashboard.</p>
        </div>
    )
}

    