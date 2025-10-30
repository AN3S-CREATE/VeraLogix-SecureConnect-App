"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

export default function TenAmenitiesPage() {
  const amenities = [
    { id: 1, name: "Pool & Jacuzzi", image: "https://picsum.photos/seed/pool/600/400", hint: "pool jacuzzi", available: true },
    { id: 2, name: "Rooftop BBQ", image: "https://picsum.photos/seed/bbq/600/400", hint: "rooftop bbq", available: true },
    { id: 3, name: "Cinema Room", image: "https://picsum.photos/seed/cinema/600/400", hint: "cinema room", available: false },
    { id: 4, name: "Fitness Center", image: "https://picsum.photos/seed/gym/600/400", hint: "fitness center", available: true },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Book an Amenity</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        selected={new Date()}
                        className="rounded-md self-center"
                    />
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Available Slots</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="vx-focus">09:00</Button>
                        <Button variant="outline" className="vx-focus ring-2 ring-neon-1">11:00</Button>
                        <Button variant="outline" className="vx-focus">13:00</Button>
                        <Button variant="outline" className="vx-focus" disabled>15:00</Button>
                        <Button variant="outline" className="vx-focus">17:00</Button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Price Breakdown</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between"><span>Booking Fee</span><span>$25.00</span></div>
                        <div className="flex justify-between"><span>Taxes</span><span>$2.50</span></div>
                        <div className="flex justify-between font-bold text-foreground"><span>Total</span><span>$27.50</span></div>
                    </div>
                </div>
                <Button className="w-full vx-cta vx-focus">Proceed to Payment</Button>
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}
