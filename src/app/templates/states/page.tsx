
"use client";

import { AlertCircle, CloudOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatesTemplatePage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Visual States</h1>

      {/* Offline State */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Offline</h2>
        <div className="vx-offline-strip">
          <p>Cached snapshot. You are currently offline.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Loading State */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Loading</h2>
            <Card className="vx-card">
                <CardHeader>
                    <CardTitle>Data Loading</CardTitle>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center">
                    <Spinner />
                </CardContent>
            </Card>
        </div>

        {/* Error State */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Error</h2>
            <div className="vx-error-banner">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--neon-3)]" />
                    <div>
                        <p className="font-semibold">Connection Failed</p>
                        <p className="text-sm text-muted-foreground">Could not retrieve the latest data. Please try again.</p>
                        <Button variant="outline" size="sm" className="mt-2 vx-focus">Retry</Button>
                    </div>
                </div>
            </div>
        </div>

         {/* Empty State */}
        <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Empty</h2>
            <Card className="vx-card">
                <CardContent className="h-64 flex flex-col items-center justify-center text-center">
                    <CloudOff className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Incidents Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">There are currently no open incidents to display.</p>
                    <Button className="vx-cta vx-focus">Create New Incident</Button>
                </CardContent>
            </Card>
        </div>

        {/* Focus State */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Focus</h2>
            <p className="text-muted-foreground">Click or Tab to the button below to see the focus state.</p>
            <Button className="vx-cta vx-focus">Focused Button</Button>
        </div>
      </div>
    </div>
  );
}
