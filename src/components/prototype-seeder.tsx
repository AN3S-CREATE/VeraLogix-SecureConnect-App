'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

const DUMMY_DOORS = [
  { id: "D-101", name: "Main Lobby Entrance", state: "locked", health: "healthy", proximityReady: true, siteId: "site-1" },
  { id: "D-102", name: "Parking Garage P1", state: "unlocked", health: "healthy", proximityReady: true, siteId: "site-1" },
  { id: "D-201", name: "Floor 2 - East Wing", state: "locked", health: "degraded", proximityReady: false, siteId: "site-1" },
  { id: "D-202", name: "Floor 2 - West Wing", state: "locked", health: "healthy", proximityReady: false, siteId: "site-1" },
  { id: "D-300", name: "Rooftop Access", state: "locked", health: "offline", proximityReady: false, siteId: "site-1" },
  { id: "SRV-01", name: "Server Room", state: "locked", health: "healthy", proximityReady: false, siteId: "site-1" },
];

const DUMMY_LOGS = [
  { id: "1", name: "John Doe (PASS-001)", location: "Main Lobby", time: "1 min ago", status: "granted" },
  { id: "2", name: "Delivery Drone #A4", location: "Rooftop Landing", time: "3 mins ago", status: "granted" },
  { id: "3", name: "Unknown", location: "Parking Garage P1", time: "5 mins ago", status: "denied" },
];

export function PrototypeSeeder() {
  const firestore = useFirestore();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    async function seedData() {
      if (!firestore) return;
      try {
        const doorsSnap = await getDocs(collection(firestore, 'doors'));
        if (doorsSnap.empty) {
          console.log("Database empty. Seeding prototype data...");
          const batch = writeBatch(firestore);
          
          DUMMY_DOORS.forEach(door => {
            const doorRef = doc(firestore, 'doors', door.id);
            batch.set(doorRef, door);
          });
          
          DUMMY_LOGS.forEach(log => {
            const logRef = doc(firestore, 'accessLogs', log.id);
            batch.set(logRef, log);
          });

          await batch.commit();
          console.log("Prototype data seeded successfully.");
        }
      } catch (e) {
        console.error("Error seeding prototype data:", e);
      }
      setSeeded(true);
    }
    
    seedData();
  }, [firestore]);

  if (!seeded) return null;
  return <></>;
}
