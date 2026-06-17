
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function TenAmenitiesPage() {
  const amenities = [
    { id: 1, name: "Pool & Jacuzzi", image: "https://picsum.photos/seed/pool/600/400", hint: "pool jacuzzi", available: true, rule: "Max 4 guests", price: 27.50 },
    { id: 2, name: "Rooftop BBQ", image: "https://picsum.photos/seed/bbq/600/400", hint: "rooftop bbq", available: true, rule: "Closes at 10 PM", price: 35.00 },
    { id: 3, name: "Cinema Room", image: "https://picsum.photos/seed/cinema/600/400", hint: "cinema room", available: false, rule: null, price: 50.00 },
    { id: 4, name: "Fitness Center", image: "https://picsum.photos/seed/gym/600/400", hint: "fitness center", available: true, rule: "2-hour limit", price: 10.00 },
  ];
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>("11:00");

  const handleBook = (id: number, price: number) => {
    console.log('sc.res.amenity.booked', { id, price });
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Book an Amenity</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="calendar">
        {amenities.map(amenity => (
          <Sheet key={amenity.id}>
            <SheetTrigger asChild>
              <div className="vx-card p-0 overflow-hidden cursor-pointer">
                <div className="relative h-48 w-full">
                  <Image src={amenity.image} alt={amenity.name} fill objectFit="cover" data-ai-hint={amenity.hint} />
                  {!amenity.available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="chip-alert">Fully Booked</span></div>}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg">{amenity.name}</h2>
                </div>
              </div>
            </SheetTrigger>
            <SheetContent className="bg-background border-l border-white/10 w-full sm:max-w-md">
               <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
              <SheetHeader>
                <SheetTitle className="text-2xl">{amenity.name}</SheetTitle>
                <SheetDescription>Select a date and time slot to book this amenity.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Select Date</h3>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md self-center"
                        classNames={{
                           day_selected: "bg-[var(--neon-1)] text-black hover:bg-[var(--neon-1)] hover:text-black focus:bg-[var(--neon-1)] focus:text-black",
                           day_today: "text-neon-1"
                        }}
                    />
                </div>
                 {amenity.rule && (
                    <div className="p-2 text-center rounded-md border border-[var(--neon-2)] text-[var(--neon-2)] text-sm font-semibold">
                        {amenity.rule}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold mb-2">Available Slots</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className={cn("vx-focus", selectedSlot === '09:00' && "ring-2 ring-[var(--neon-1)]")} onClick={() => setSelectedSlot('09:00')}>09:00</Button>
                        <Button variant="outline" className={cn("vx-focus", selectedSlot === '11:00' && "ring-2 ring-[var(--neon-1)]")} onClick={() => setSelectedSlot('11:00')}>11:00</Button>
                        <Button variant="outline" className={cn("vx-focus", selectedSlot === '13:00' && "ring-2 ring-[var(--neon-1)]")} onClick={() => setSelectedSlot('13:00')}>13:00</Button>
                        <Button variant="outline" className="vx-focus" disabled>15:00</Button>
                        <Button variant="outline" className={cn("vx-focus", selectedSlot === '17:00' && "ring-2 ring-[var(--neon-1)]")} onClick={() => setSelectedSlot('17:00')}>17:00</Button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Price Breakdown</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between"><span>Booking Fee</span><span>${(amenity.price * 0.9).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Taxes</span><span>${(amenity.price * 0.1).toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-foreground"><span>Total</span><span>${amenity.price.toFixed(2)}</span></div>
                    </div>
                </div>
                <Link href="/ten/wallet#pay" passHref>
                  <Button className="w-full vx-cta vx-focus" onClick={() => handleBook(amenity.id, amenity.price)}>Proceed to Payment</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}
