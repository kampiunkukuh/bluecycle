import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    address: "123 Main Street",
    wasteType: "Organic",
    status: "pending",
    requestedBy: "Sarah Johnson",
    scheduledDate: "2024-11-25",
  },
  {
    id: "2",
    address: "456 Oak Avenue",
    wasteType: "Recyclable",
    status: "scheduled",
    requestedBy: "Mike Davis",
    scheduledDate: "2024-11-24",
    assignedDriver: "Driver #3",
  },
  {
    id: "3",
    address: "789 Pine Road",
    wasteType: "General",
    status: "completed",
    requestedBy: "Alex Chen",
    scheduledDate: "2024-11-23",
    assignedDriver: "Driver #2",
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
      scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
      completed: "bg-green-500/10 text-green-600 dark:text-green-500",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-500",
    };
    return colors[status as keyof typeof colors] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pickup Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track waste collection requests
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} data-testid="button-new-pickup">
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-pickups"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Waste Type</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPickups.map((pickup) => (
              <TableRow key={pickup.id} data-testid={`row-pickup-${pickup.id}`}>
                <TableCell className="font-medium">{pickup.address}</TableCell>
                <TableCell>{pickup.wasteType}</TableCell>
                <TableCell>{pickup.requestedBy}</TableCell>
                <TableCell>
                  {pickup.scheduledDate && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {pickup.scheduledDate}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(pickup.status)} variant="secondary">
                    {pickup.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {pickup.assignedDriver || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Pickup Request</DialogTitle>
            <DialogDescription>
              Schedule a waste collection pickup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Pickup Address</Label>
              <Input
                id="address"
                value={newPickup.address}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, address: e.target.value })
                }
                placeholder="Enter complete address"
                data-testid="input-pickup-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteType">Waste Type</Label>
              <Select
                value={newPickup.wasteType}
                onValueChange={(value) =>
                  setNewPickup({ ...newPickup, wasteType: value })
                }
              >
                <SelectTrigger id="wasteType" data-testid="select-waste-type">
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
              <Label htmlFor="scheduledDate">Preferred Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={newPickup.scheduledDate}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, scheduledDate: e.target.value })
                }
                data-testid="input-scheduled-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={newPickup.notes}
                onChange={(e) =>
                  setNewPickup({ ...newPickup, notes: e.target.value })
                }
                placeholder="Any special instructions..."
                data-testid="input-pickup-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleCreatePickup} data-testid="button-submit-pickup">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
