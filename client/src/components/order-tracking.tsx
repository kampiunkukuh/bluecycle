import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Phone, Star, Bike } from "lucide-react";

interface DriverLocation {
  latitude: string;
  longitude: string;
  timestamp: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
  profilePhoto?: string;
  motorbikeplate?: string;
}

interface OrderTrackingProps {
  pickupId: number;
  driverId: number;
  driver?: Driver;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
}

export function OrderTracking({
  pickupId,
  driverId,
  driver,
  driverName,
  driverPhone,
  driverRating = 5,
}: OrderTrackingProps) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const finalDriverName = driver?.name || driverName || "Driver";
  const finalDriverPhone = driver?.phone || driverPhone || "Tidak tersedia";
  const driverPhoto = driver?.profilePhoto;
  const plateNumber = driver?.motorbikeplate || "N/A";

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
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [pickupId]);

  const mapUrl =
    location && driverId
      ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyAi2iBYRQhYqRGfcJVQGU7s2pqhFTZaFuI&q=${location.latitude},${location.longitude}`
      : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Pelacakan Real-time Pengemudi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Driver Info Card */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-primary/10 space-y-3">
          <div className="flex items-start gap-4">
            {/* Driver Avatar */}
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarImage src={driverPhoto} alt={finalDriverName} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {finalDriverName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Driver Details */}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{finalDriverName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${finalDriverPhone}`} className="text-primary hover:underline font-medium">
                  {finalDriverPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bike className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="bg-primary/5">
                  {plateNumber}
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-end gap-1">
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
              </div>
              <span className="text-sm font-semibold">{driverRating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg space-y-2 border border-primary/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {loading ? "Mengambil lokasi..." : location ? "Lokasi sedang diperbaharui" : "Menunggu data lokasi"}
            </span>
          </div>
          {location && (
            <div className="text-sm text-muted-foreground space-y-1 pl-6">
              <p>
                <span className="font-medium">Koordinat:</span> {location.latitude}, {location.longitude}
              </p>
              <p className="text-xs">
                Terakhir: {new Date(location.timestamp).toLocaleTimeString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* Google Maps Embed */}
        {location && (
          <div className="w-full rounded-lg overflow-hidden border-2 border-primary/20">
            <iframe
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAi2iBYRQhYqRGfcJVQGU7s2pqhFTZaFuI&q=${location.latitude},${location.longitude}`}
            ></iframe>
          </div>
        )}

        {/* No Location Yet */}
        {!location && !loading && (
          <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Pengemudi belum memulai perjalanan</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
