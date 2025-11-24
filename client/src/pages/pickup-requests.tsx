import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, MapPin, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PickupRequest {
  id: string;
  address: string;
  wasteType: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  requestedBy: string;
  scheduledDate?: string;
  assignedDriver?: string;
}

const mockPickups: PickupRequest[] = [
  {
    id: "1",
    address: "123 Main Street, Downtown",
    wasteType: "Organic",
    status: "pending",
    requestedBy: "Sarah Johnson",
    scheduledDate: "Nov 25, 2024",
  },
  {
    id: "2",
    address: "456 Oak Avenue, North District",
    wasteType: "Recyclable",
    status: "scheduled",
    requestedBy: "Mike Davis",
    scheduledDate: "Nov 24, 2024",
    assignedDriver: "Driver #3",
  },
  {
    id: "3",
    address: "789 Pine Road, East Side",
    wasteType: "General",
    status: "completed",
    requestedBy: "Alex Chen",
    scheduledDate: "Nov 23, 2024",
    assignedDriver: "Driver #2",
  },
  {
    id: "4",
    address: "321 Elm Street, West Zone",
    wasteType: "Hazardous",
    status: "scheduled",
    requestedBy: "Emma Wilson",
    scheduledDate: "Nov 26, 2024",
    assignedDriver: "Driver #1",
  },
];

export default function PickupRequests() {
  const [pickups, setPickups] = useState<PickupRequest[]>(mockPickups);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newPickup, setNewPickup] = useState({
    address: "",
    wasteType: "General",
    notes: "",
    scheduledDate: "",
  });

  const filteredPickups = pickups.filter((p) =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePickup = () => {
    const pickup: PickupRequest = {
      id: String(Date.now()),
      address: newPickup.address,
      wasteType: newPickup.wasteType,
      status: "pending",
      requestedBy: "Current User",
      scheduledDate: newPickup.scheduledDate,
    };
    setPickups([pickup, ...pickups]);
    setShowDialog(false);
    setNewPickup({ address: "", wasteType: "General", notes: "", scheduledDate: "" });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900", 
        label: "Pending" 
      },
      scheduled: { 
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900", 
        label: "Scheduled" 
      },
      completed: { 
        color: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900", 
        label: "Completed" 
      },
      cancelled: { 
        color: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900", 
        label: "Cancelled" 
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getWasteTypeIcon = (type: string) => {
    return <Trash2 className="h-5 w-5" />;
  };

  const getWasteTypeColor = (type: string) => {
    const colors = {
      Organic: "bg-green-500/10 text-green-600",
      Recyclable: "bg-blue-500/10 text-blue-600",
      General: "bg-gray-500/10 text-gray-600",
      Hazardous: "bg-red-500/10 text-red-600",
    };
    return colors[type as keyof typeof colors] || colors.General;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Pickup Requests</h1>
          <p className="text-muted-foreground text-base">
            Manage and track all waste collection requests
          </p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)} 
          size="lg"
          className="h-12 px-6 text-base font-semibold shadow-md"
          data-testid="button-new-pickup"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Request
        </Button>
      </div>

      <Card className="shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by address or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            data-testid="input-search-pickups"
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredPickups.map((pickup) => {
          const statusConfig = getStatusConfig(pickup.status);
          return (
            <Card 
              key={pickup.id} 
              className="shadow-md hover-elevate"
              data-testid={`row-pickup-${pickup.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-xl ${getWasteTypeColor(pickup.wasteType)} flex items-center justify-center flex-shrink-0`}>
                    {getWasteTypeIcon(pickup.wasteType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{pickup.address}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Trash2 className="h-3 w-3" />
                            {pickup.wasteType}
                          </span>
                          <span>•</span>
                          <span>{pickup.requestedBy}</span>
                        </div>
                      </div>
                      <Badge 
                        className={statusConfig.color}
                        variant="secondary"
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {pickup.scheduledDate && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{pickup.scheduledDate}</span>
                        </div>
                      )}
                      {pickup.assignedDriver && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{pickup.assignedDriver}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">New Pickup Request</DialogTitle>
            <DialogDescription className="text-base">
              Schedule a waste collection pickup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">Pickup Address</Label>
              <Input
                id="address"
                value={newPickup.address}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, address: e.target.value })
                }
                placeholder="Enter complete address"
                className="h-12"
                data-testid="input-pickup-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteType" className="text-base font-medium">Waste Type</Label>
              <Select
                value={newPickup.wasteType}
                onValueChange={(value) =>
                  setNewPickup({ ...newPickup, wasteType: value })
                }
              >
                <SelectTrigger id="wasteType" className="h-12" data-testid="select-waste-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General Waste</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Recyclable">Recyclable</SelectItem>
                  <SelectItem value="Hazardous">Hazardous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate" className="text-base font-medium">Preferred Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={newPickup.scheduledDate}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, scheduledDate: e.target.value })
                }
                className="h-12"
                data-testid="input-scheduled-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                value={newPickup.notes}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, notes: e.target.value })
                }
                placeholder="Any special instructions..."
                className="min-h-24"
                data-testid="input-pickup-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} size="lg" data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleCreatePickup} size="lg" data-testid="button-submit-pickup">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
