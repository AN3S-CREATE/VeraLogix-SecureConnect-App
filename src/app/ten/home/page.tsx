"use client";

import { ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TenHomePage() {

  return (
    <div className="space-y-8">
      {/* Offline indicator placeholder */}
      {/* <div className="p-2 text-center text-sm bg-muted text-muted-foreground border-b border-neon-2">
        <p>Cached snapshot. You are currently offline.</p>
      </div> */}
      
      <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Balance" value="$250.00" trend="+2.5%" trendDirection="positive" />
        <KpiCard title="Bookings" value="3" trend="1 upcoming" trendDirection="neutral" />
        <KpiCard title="Active Passes" value="1" trend="Expires in 3h" trendDirection="neutral" />
        <KpiCard title="Packages" value="2" trend="New" trendDirection="positive" />
      </div>

      {/* Shortcut Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/ten/keys#tap" passHref>
          <Button className="w-full vx-cta vx-focus">Open Gate</Button>
        </Link>
        <Link href="/ten/amenities#calendar" passHref>
          <Button className="w-full vx-cta vx-focus">Book Amenity</Button>
        </Link>
        <Link href="/ten/wallet#pay" passHref>
          <Button className="w-full vx-cta vx-focus">Pay Now</Button>
        </Link>
        <Link href="/ten/maintenance#new" passHref>
          <Button className="w-full vx-cta vx-focus">Report Issue</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Carousel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Alerts</h2>
          <Carousel>
            <CarouselContent>
              <CarouselItem>
                <div className="p-6 vx-card h-48 flex flex-col justify-center">
                  <p className="font-semibold text-primary">Water Maintenance</p>
                  <p className="text-foreground/80 mt-2">Scheduled water maintenance on Friday at 2 PM. Please prepare for a temporary outage.</p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="p-6 vx-card h-48 flex flex-col justify-center">
                  <p className="font-semibold text-primary">Fire Drill</p>
                  <p className="text-foreground/80 mt-2">A mandatory fire drill is scheduled for next Monday. Please review evacuation routes.</p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <div className="mt-4 flex justify-end gap-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>

        {/* Messages Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          <Link href="/ten/concierge#thread" className="block vx-card hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-primary">Concierge Desk</p>
                    <p className="text-sm text-foreground/80">Your package has arrived...</p>
                  </div>
                  <p className="text-xs text-muted-foreground">2h ago</p>
              </div>
            </div>
          </Link>
           <Link href="/ten/concierge#thread" className="block vx-card hover:shadow-lg transition-shadow mt-4">
            <div className="p-6">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-primary">Management</p>
                    <p className="text-sm text-foreground/80">Community policy updates...</p>
                  </div>
                  <p className="text-xs text-muted-foreground">1d ago</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, trend, trendDirection }: { title: string, value: string, trend: string, trendDirection: 'positive' | 'negative' | 'neutral' }) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div className={`flex items-center text-sm ${trendDirection === 'positive' ? 'delta-positive' : trendDirection === 'negative' ? 'delta-negative' : 'text-muted-foreground'}`}>
        {trendDirection === 'positive' && <ArrowUp className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}