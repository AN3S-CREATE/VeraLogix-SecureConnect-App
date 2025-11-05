
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/icons/logo";


export default function TenConciergePage() {
  const threads = [
    { id: 1, topic: "Package Delivery", lastMessage: "Your package from Amazon has arrived.", time: "2h ago", unread: true },
    { id: 2, topic: "Maintenance Request #TKT-001", lastMessage: "Our technician is scheduled to arrive...", time: "6h ago", unread: false },
    { id: 3, topic: "Community Policy Updates", lastMessage: "Please see the attached document for...", time: "1d ago", unread: false },
  ];

  const messages = [
      { from: "concierge", text: "Good afternoon! How can I help you today?", time: "2:30 PM" },
      { from: "user", text: "I'm expecting a package from Amazon, has it arrived?", time: "2:31 PM" },
      { from: "concierge", text: "Let me check for you. Yes, a package for you was logged at 1:15 PM. You can pick it up anytime.", time: "2:32 PM" },
  ];
  
  const handleSendMessage = () => {
    console.log('sc.ten.msg.sent', { thread_type: 'concierge' });
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex vx-card p-0">
      <div className="hidden md:flex flex-col w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Concierge</h1>
        </div>
        <ScrollArea>
          {threads.map(thread => (
            <div key={thread.id} className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${thread.id === 1 ? "bg-muted/50" : ""}`} id={thread.id === 1 ? 'thread' : undefined}>
              <div className="flex justify-between items-start">
                <p className="font-semibold">{thread.topic}</p>
                {thread.unread && <div className="w-2 h-2 rounded-full bg-neon-1 mt-1.5"></div>}
              </div>
              <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
              <p className="text-xs text-muted-foreground text-right">{thread.time}</p>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col bg-background/50">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Package Delivery</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                {msg.from === 'concierge' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Logo className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border space-y-2 bg-background rounded-b-lg">
            <div className="flex gap-2">
                <Button variant="outline" className="chip-info vx-focus">Book Amenity</Button>
                <Button variant="outline" className="chip-info vx-focus">Make Payment</Button>
                <Button variant="outline" className="chip-info vx-focus">New Pass</Button>
                <Button variant="outline" className="chip-info vx-focus">Report Issue</Button>
            </div>
            <div className="flex gap-2">
                <Input placeholder="Type your message..." className="vx-focus" />
                <Button className="vx-cta vx-focus" onClick={handleSendMessage}><SendHorizonal className="w-5 h-5" /></Button>
            </div>
        </div>
      </div>
    </div>
  );
}
