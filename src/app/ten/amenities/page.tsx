"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Amenity } from "@/lib/entities";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";

type AmenityRow = Amenity & { siteId: string };

function photoFor(amenity: AmenityRow) {
  return amenity.photos?.[0] || `https://picsum.photos/seed/${encodeURIComponent(amenity.name)}/600/400`;
}

export default function TenAmenitiesPage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<AmenityRow>("amenities");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>("11:00");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const amenities = useMemo(() => data ?? [], [data]);

  const handleBook = async (amenity: AmenityRow) => {
    const siteId = user?.siteIds[0];
    if (!siteId || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Log in as a resident with a site assignment to book.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast({ title: "Pick a date and slot", variant: "destructive" });
      return;
    }

    const [hours, minutes] = selectedSlot.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    setBookingId(amenity.id);
    try {
      await client.create("bookings", {
        siteId,
        amenityId: amenity.id,
        userId: user.id,
        slotStart: start.toISOString(),
        slotEnd: end.toISOString(),
        price: 0,
        status: "confirmed",
      });
      await refresh();
      toast({
        title: "Booking confirmed",
        description: `${amenity.name} on ${start.toLocaleString()}`,
      });
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Unable to create booking",
        variant: "destructive",
      });
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Book an Amenity</h1>
      {isLoading && amenities.length === 0 ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : amenities.length === 0 ? (
        <p className="text-muted-foreground">No amenities yet. Run `npm run db:seed` to create Clubhouse.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="calendar">
          {amenities.map((amenity) => (
            <Sheet key={amenity.id}>
              <SheetTrigger asChild>
                <div className="vx-card p-0 overflow-hidden cursor-pointer">
                  <div className="relative h-48 w-full">
                    <Image src={photoFor(amenity)} alt={amenity.name} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg">{amenity.name}</h2>
                    {amenity.rules ? (
                      <p className="text-xs text-muted-foreground mt-1">{amenity.rules}</p>
                    ) : null}
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent className="bg-background border-l border-white/10 w-full sm:max-w-md">
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
                        day_selected:
                          "bg-[var(--neon-1)] text-black hover:bg-[var(--neon-1)] hover:text-black focus:bg-[var(--neon-1)] focus:text-black",
                        day_today: "text-neon-1",
                      }}
                    />
                  </div>
                  {amenity.rules ? (
                    <div className="p-2 text-center rounded-md border border-[var(--neon-2)] text-[var(--neon-2)] text-sm font-semibold">
                      {amenity.rules}
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-semibold mb-2">Available Slots</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["09:00", "11:00", "13:00", "17:00"].map((slot) => (
                        <Button
                          key={slot}
                          variant="outline"
                          className={cn("vx-focus", selectedSlot === slot && "ring-2 ring-[var(--neon-1)]")}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full vx-cta vx-focus"
                    disabled={bookingId === amenity.id}
                    onClick={() => handleBook(amenity)}
                  >
                    {bookingId === amenity.id ? "Booking…" : "Confirm booking"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      )}
    </div>
  );
}
