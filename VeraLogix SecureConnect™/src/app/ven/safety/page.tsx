"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Video, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";

const inductionSteps = [
    { id: 1, title: 'Watch Safety Video', icon: <Video /> },
    { id: 2, title: 'Complete Quiz', icon: <FileText /> },
];

export default function SafetyAndPermitsPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const inductionComplete = currentStep > inductionSteps.length;

    const handleNextStep = () => {
        setCurrentStep(prev => prev + 1);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Safety Induction</h1>
                    <p className="text-muted-foreground">You must complete this induction before you can request permits to work.</p>
                </div>

                <div className="vx-card p-6">
                    <div className="flex items-center mb-6">
                        {inductionSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex flex-col items-center ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors", step.id <= currentStep ? 'bg-primary/20 border-primary' : 'border-muted', {'animate-pulse': step.id === currentStep})}>
                                        {step.icon}
                                    </div>
                                    <p className="text-xs mt-1 text-center">{step.title}</p>
                                </div>
                                {index < inductionSteps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${index < currentStep -1 ? 'bg-primary' : 'bg-muted'}`} />}
                            </div>
                        ))}
                    </div>
                    {currentStep === 1 && <SafetyVideoStep onComplete={handleNextStep} />}
                    {currentStep === 2 && <SafetyQuizStep onComplete={handleNextStep} />}
                    {inductionComplete && <InductionComplete />}
                </div>
            </div>

            <aside className="lg:col-span-1">
                 <div className={cn("vx-card p-6", !inductionComplete && "opacity-50")}>
                    <h2 className="text-xl font-bold mb-4">Request Permit to Work</h2>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="work-description">Description of Work</Label>
                            <Textarea id="work-description" placeholder="e.g., HVAC servicing on Unit 5" className="vx-focus" disabled={!inductionComplete} />
                        </div>
                        <div>
                            <Label>Isolation Matrix</Label>
                             <div className="p-4 border rounded-md bg-black/20 text-sm text-muted-foreground">
                                <p className="font-semibold text-foreground mb-2">Select required isolations:</p>
                                <div className="space-y-2">
                                     <div className="flex items-center gap-2"><Checkbox id="iso-elec" className="vx-focus" disabled={!inductionComplete} /> <Label htmlFor="iso-elec">Electrical</Label></div>
                                     <div className="flex items-center gap-2"><Checkbox id="iso-water" className="vx-focus" disabled={!inductionComplete} /> <Label htmlFor="iso-water">Water Supply</Label></div>
                                     <div className="flex items-center gap-2"><Checkbox id="iso-gas" className="vx-focus" disabled={!inductionComplete} /> <Label htmlFor="iso-gas">Gas Line</Label></div>
                                </div>
                             </div>
                        </div>
                        <Button className="w-full vx-cta vx-focus" disabled={!inductionComplete}>Submit PTW Request</Button>
                    </form>
                </div>
            </aside>
        </div>
    );
}

function SafetyVideoStep({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="space-y-4">
            <div className="aspect-video bg-black rounded-md flex items-center justify-center text-muted-foreground">
                <Video className="w-16 h-16" />
                <p className="sr-only">Safety video placeholder</p>
            </div>
            <Button onClick={onComplete} className="w-full vx-cta vx-focus">Mark as Watched <ChevronRight /></Button>
        </div>
    )
}

function SafetyQuizStep({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="space-y-6">
            <div>
                <Label className="font-semibold">1. What is the first step in case of a fire alarm?</Label>
                <RadioGroup defaultValue="b" className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="a" id="q1a" className="vx-focus" /><Label htmlFor="q1a">Finish your work quickly.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="b" id="q1b" className="vx-focus" /><Label htmlFor="q1b">Evacuate immediately via the nearest safe exit.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="c" id="q1c" className="vx-focus" /><Label htmlFor="q1c">Call security to ask if it's a drill.</Label></div>
                </RadioGroup>
            </div>
             <div>
                <Label className="font-semibold">2. Personal Protective Equipment (PPE) is...</Label>
                <RadioGroup defaultValue="c" className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="a" id="q2a" className="vx-focus" /><Label htmlFor="q2a">Optional if you are experienced.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="b" id="q2b" className="vx-focus" /><Label htmlFor="q2b">Only for major construction work.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="c" id="q2c" className="vx-focus" /><Label htmlFor="q2c">Mandatory for all work on site.</Label></div>
                </RadioGroup>
            </div>
            <Button onClick={onComplete} className="w-full vx-cta vx-focus">Submit Quiz <ChevronRight /></Button>
        </div>
    )
}

function InductionComplete() {
    return (
        <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-primary">Induction Complete!</h2>
            <p className="text-muted-foreground mt-2">You have successfully completed the safety induction. You can now request Permits to Work.</p>
        </div>
    )
}
