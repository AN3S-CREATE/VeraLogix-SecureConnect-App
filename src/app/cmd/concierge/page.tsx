
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, SendHorizonal } from "lucide-react";

function AgingBucket({ label, amount, percentage, color }: { label: string; amount: number; percentage: number; color: string }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
                <div className={cn("h-2.5 rounded-full", color)} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

export default function AgentConciergePage() {
    const threads = [
        { id: 1, name: "Alice (Unit 101)", topic: "Overdue Invoice", lastMessage: "Can I get an extension?", time: "2h ago", unread: true },
        { id: 2, name: "Bob (Unit 204)", topic: "Payment Confirmation", lastMessage: "Thanks, payment sent.", time: "6h ago", unread: false },
        { id: 3, name: "Charlie (Unit 302)", topic: "Amenity Booking Fee", lastMessage: "I was charged twice for the pool.", time: "1d ago", unread: false },
        { id: 4, name: "Diana (Unit 105)", topic: "EV Charging Bill", lastMessage: "Please send me the invoice.", time: "2d ago", unread: true },
    ];

    const messages = [
        { from: "user", text: "Hi, I received a reminder about my invoice. Can I get an extension until Friday?", time: "2:31 PM" },
        { from: "agent", text: "Good afternoon. I can grant a 3-day extension. Would that work for you?", time: "2:32 PM" },
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex vx-card p-0">
            {/* Thread List */}
            <div className="hidden md:flex flex-col w-1/4 border-r border-border">
                <div className="p-4 border-b border-border">
                    <h1 className="text-xl font-bold">Omni-Inbox</h1>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8 vx-focus" />
                    </div>
                </div>
                <ScrollArea>
                    {threads.map(thread => (
                        <div key={thread.id} className={cn("p-4 border-b border-border cursor-pointer hover:bg-muted/50", thread.id === 1 && "bg-muted/50")}>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold">{thread.name}</p>
                                {thread.unread && <div className="w-2 h-2 rounded-full bg-neon-1 mt-1.5"></div>}
                            </div>
                            <p className="text-sm font-medium">{thread.topic}</p>
                            <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                            <p className="text-xs text-muted-foreground text-right">{thread.time}</p>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Message View */}
            <div className="flex-1 flex flex-col bg-background/50">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">Alice (Unit 101) - Overdue Invoice</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-end gap-2", msg.from === 'agent' ? 'justify-end' : '')}>
                                {msg.from === 'user' && (
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${threads[0].name}`} />
                                        <AvatarFallback>{threads[0].name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs lg:max-w-md p-3 rounded-lg", msg.from === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-card')}>
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-border space-y-2 bg-background rounded-b-lg">
                    <div className="flex gap-2">
                        <Button variant="outline" className="chip-info vx-focus">Send Invoice</Button>
                        <Button variant="outline" className="chip-info vx-focus">Offer Payment Plan</Button>
                        <Button variant="outline" className="chip-alert vx-focus">Escalate to Collections</Button>
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Type your message..." className="vx-focus" />
                        <Button className="vx-cta vx-focus"><SendHorizonal className="w-5 h-5" /></Button>
                    </div>
                </div>
            </div>

            {/* Action Panel / Arrears */}
            <div className="hidden lg:flex flex-col w-1/4 border-l border-border">
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold">Action Panel</h2>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">User Info</h3>
                        <div className="text-sm">
                            <p><strong>Alice</strong></p>
                            <p className="text-muted-foreground">Unit 101</p>
                            <p className="text-muted-foreground">Joined: 2023-01-15</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Arrears Aging</h3>
                        <div className="space-y-4">
                            <AgingBucket label="30-60 Days" amount={250} percentage={100} color="bg-yellow-500/50" />
                            <AgingBucket label="60-90 Days" amount={0} percentage={0} color="bg-orange-500/50" />
                            <AgingBucket label="90+ Days" amount={0} percentage={0} color="bg-red-500/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
