'use client';

import { useEffect, useState } from "react";
import { eventsApi } from "@/lib/api/events";

export default function Page() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getAllEvents();
        console.log(data);
        
        setEvents(data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return <div>hiiiiiiiiiiiiiiiiii</div>;
}
