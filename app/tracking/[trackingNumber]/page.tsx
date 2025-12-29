"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, Clock } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

interface Shipment {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  orderNumber: string;
}

export default function TrackingPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trackingNumber) {
      fetchTracking();
    }
  }, [trackingNumber]);

  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/shipping/tracking/${trackingNumber}`);
      if (!response.ok) throw new Error("Failed to fetch tracking");
      const data = await response.json();
      setShipment(data);
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "bg-gray-500",
      label_created: "bg-blue-500",
      in_transit: "bg-yellow-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      exception: "bg-red-500",
      returned: "bg-purple-500",
    };
    return statusMap[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Numéro de suivi introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Suivi de colis
          </CardTitle>
          <CardDescription>
            Numéro de suivi: {shipment.trackingNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transporteur</p>
              <p className="font-semibold">{shipment.carrier}</p>
            </div>
            <Badge className={getStatusColor(shipment.status)}>
              {shipment.status}
            </Badge>
          </div>

          {shipment.estimatedDelivery && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Livraison estimée: {new Date(shipment.estimatedDelivery).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Historique</h3>
            <div className="space-y-3">
              {shipment.events.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />
                    {index < shipment.events.length - 1 && (
                      <div className="w-0.5 h-8 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

