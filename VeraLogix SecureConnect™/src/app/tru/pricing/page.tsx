
"use client";
import { Button } from "@/components/ui/button";
import { Signature, ThumbsDown, ThumbsUp } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TrusteePricingPage() {
    const proposals = [
        { 
            id: 'PROP-001', 
            name: 'Weekend Surge Pricing', 
            proposer: 'John Doe (Agent)',
            details: [
                { key: 'Peak Markup', from: '50%', to: '75%' },
                { key: 'Weekend Surcharge', from: '$10', to: '$15' },
            ]
        },
    ];
    
    const decisions = [
        { amenity: 'Pool', time: 'Sat 2:00 PM', price: 35.00, reason: 'Weekend peak hour' },
        { amenity: 'Cinema Room', time: 'Mon 10:00 AM', price: 20.00, reason: 'Off-peak baseline' },
    ];

    const handleApproval = (proposalId: string, status: 'approved' | 'declined') => {
        console.log(`sc.trust.pricing.${status}`, { proposalId });
    }

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Pricing Oversight</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Guardrail Proposals */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Pending Guardrail Proposals</h2>
                    {proposals.map(prop => (
                        <div key={prop.id} className="vx-card p-0 overflow-hidden" onClick={() => console.log('sc.trust.pricing.viewed', { proposalId: prop.id })}>
                             <div className="p-4 bg-gradient-to-r from-[var(--g1)] to-[var(--g3)]">
                                <h3 className="text-lg font-bold text-primary-foreground">{prop.name}</h3>
                                <p className="text-sm text-primary-foreground/80">Proposed by {prop.proposer}</p>
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold mb-2">Changes:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {prop.details.map(detail => (
                                        <li key={detail.key}>
                                            <span className="font-medium">{detail.key}:</span>{' '}
                                            <span className="text-muted-foreground line-through">{detail.from}</span>
                                            {' -> '}
                                            <span className="font-semibold delta-positive">{detail.to}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                
                 {/* Decision Feed */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Live Decision Feed</h2>
                    <div className="space-y-4">
                        {decisions.map((decision, i) => (
                             <div key={i} className="p-4 rounded-md border border-border bg-black/20" style={{borderLeftColor: 'var(--neon-1)', borderLeftWidth: '3px'}}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{decision.amenity} @ {decision.time}</p>
                                        <p className="text-2xl font-bold text-gradient-primary">
                                            {decision.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </p>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="ghost" className="text-[var(--neon-2)] hover:text-[var(--neon-2)]/80 vx-focus">
                                                Why this price?
                                            </Button>
                                        </DialogTrigger>
                                         <DialogContent className="sm:max-w-md bg-background border-[var(--neon-2)]/50" style={{boxShadow: '0 0 40px rgba(228,255,102,.35)'}}>
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                            <DialogHeader>
                                                <DialogTitle>Pricing Decision Explanation</DialogTitle>
                                            </DialogHeader>
                                            <div className="mt-4 text-sm space-y-2">
                                                <p><span className="font-semibold text-primary">Reason:</span> {decision.reason}</p>
                                            </div>
                                         </DialogContent>
                                    </Dialog>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Approval Panel */}
            <aside className="lg:col-span-1 vx-card p-6 space-y-6">
                <h2 className="text-xl font-bold">Approval Panel</h2>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Signature /> E-Signature</h3>
                    <div className="aspect-[2/1] w-full bg-black/20 rounded-md border border-border flex items-center justify-center text-muted-foreground vx-focus" tabIndex={0}>
                        <p>Sign here to confirm</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Button className="w-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 vx-focus" onClick={() => handleApproval('PROP-001', 'approved')}>
                        <ThumbsUp className="mr-2" />Approve Proposal
                    </Button>
                    <Button className="w-full bg-destructive/20 text-destructive-foreground border border-destructive/50 hover:bg-destructive/30 vx-focus" onClick={() => handleApproval('PROP-001', 'declined')}>
                        <ThumbsDown className="mr-2" />Decline Proposal
                    </Button>
                </div>
            </aside>
        </div>
    </div>
  );
}
