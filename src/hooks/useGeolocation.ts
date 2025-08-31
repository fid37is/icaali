import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error(error)
      );
    }
  }, []);

  return location;
}