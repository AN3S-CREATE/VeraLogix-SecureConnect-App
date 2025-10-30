"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Download, Book, LineChart, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const templates = [
    { id: 'quarterly', name: 'Quarterly Review', description: 'Comprehensive financial and security overview.' },
    { id: 'agm', name: 'AGM Pack', description: 'Full report for the Annual General Meeting.' },
    { id: 'esg', name: 'ESG Focus', description: 'Energy, sustainability, and governance report.' },
];

const sections = [
    { id: 'finance', name: 'Finance', icon: <LineChart /> },
    { id: 'security', name: 'Security', icon: <ShieldCheck /> },
    { id: 'esg', name: 'ESG', icon: <Zap /> },
    { id: 'projects', name: 'Projects', icon: <Book /> },
];

export default function PackBuilderPage() {
    const [selectedTemplate, setSelectedTemplate] = useState('quarterly');

    return (
        <div className="space-y-8">
             <style jsx global>{`
                .export-glow {
                    box-shadow: 0 0 15px var(--neon-1), inset 0 0 5px var(--neon-1);
                }
             `}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Meeting Pack Builder</h1>
                 <Button variant="outline" className="vx-focus export-glow">
                    <Download className="mr-2" /> Export PDF/Deck
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Config */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Template Picker */}
                    <Card className="vx-card">
                        <CardHeader>
                            <CardTitle>1. Select a Template</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {templates.map(template => (
                                <div 
                                    key={template.id} 
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        selectedTemplate === template.id ? 'border-primary' : 'border-border hover:border-primary/50'
                                    )}
                                >
                                    <div className="h-16 rounded-md bg-gradient-to-br from-primary to-secondary mb-2"></div>
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Section Toggles */}
                    <Card className="vx-card">
                        <CardHeader>
                            <CardTitle>2. Configure Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sections.map(section => (
                                <div key={section.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <Label htmlFor={`section-${section.id}`} className="flex items-center gap-2 font-medium">
                                        {section.icon} {section.name}
                                    </Label>
                                    <Switch id={`section-${section.id}`} defaultChecked className="vx-focus" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Editor & Preview */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Narrative Editor */}
                    <Card className="vx-card">
                        <CardHeader>
                            <CardTitle>3. Add Narrative</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea placeholder="Type your opening statement or key takeaways here..." className="vx-focus min-h-[150px]" />
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="vx-card">
                        <CardHeader>
                            <CardTitle>4. Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black p-6 rounded-lg min-h-[400px] flex items-center justify-center">
                                <p className="text-muted-foreground">Report preview will be rendered here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
