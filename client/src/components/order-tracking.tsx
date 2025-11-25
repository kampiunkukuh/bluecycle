import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Star } from "lucide-react";

interface DriverLocation {
  latitude: string;
  longitude: string;
  timestamp: string;
}

interface OrderTrackingProps {
  pickupId: number;
  driverId: number;
  driverName: string;
  driverPhone: string;
  driverRating: number;
}

export function OrderTracking({
  pickupId,
  driverId,
  driverName,
  driverPhone,
  driverRating,
}: OrderTrackingProps) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/driver-location/${pickupId}`);
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
        }
      } catch (error) {
        console.error("Failed to fetch driver location:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [pickupId]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Real-time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Driver Info */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg">
          <div>
            <h3 className="font-bold">{driverName}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${driverPhone}`} className="text-primary hover:underline">
                {driverPhone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(driverRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            <span className="text-sm font-medium ml-2">{driverRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location Status */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {loading ? "Fetching location..." : location ? "Live location" : "No tracking data"}
            </span>
          </div>
          {location && (
            <div className="text-sm text-muted-foreground">
              <p>Lat: {location.latitude}</p>
              <p>Lng: {location.longitude}</p>
              <p className="text-xs mt-1">
                Updated: {new Date(location.timestamp).toLocaleTimeString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* Map placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Map view (integrate Google Maps)</p>
        </div>
      </CardContent>
    </Card>
  );
}
