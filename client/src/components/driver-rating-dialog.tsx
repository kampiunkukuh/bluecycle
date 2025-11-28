import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DriverRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickupId: number;
  driverId: number;
  driverName: string;
  onRatingSubmitted?: () => void;
}

export function DriverRatingDialog({
  open,
  onOpenChange,
  pickupId,
  driverId,
  driverName,
  onRatingSubmitted,
}: DriverRatingDialogProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Pilih rating terlebih dahulu!", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/driver-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupId,
          driverId,
          userId: 2, // Current user ID (should come from context)
          rating,
          review: review || undefined,
        }),
      });

      if (response.ok) {
        toast({ title: "Rating berhasil dikirim! Terima kasih!" });
        setRating(5);
        setReview("");
        onOpenChange(false);
        onRatingSubmitted?.();
      } else {
        throw new Error("Failed to submit rating");
      }
    } catch (error) {
      toast({ title: "Gagal mengirim rating", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Driver</DialogTitle>
          <DialogDescription>Berikan rating untuk pengemudi {driverName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  data-testid={`star-${star}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {rating === 5 && "Sangat memuaskan!"}
              {rating === 4 && "Bagus"}
              {rating === 3 && "Cukup"}
              {rating === 2 && "Kurang"}
              {rating === 1 && "Buruk"}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Ulasan (Optional)
            </label>
            <Textarea
              id="review"
              placeholder="Bagikan pengalaman Anda dengan pengemudi ini..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="resize-none"
              data-testid="textarea-review"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-rating"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            data-testid="button-submit-rating"
          >
            {submitting ? "Mengirim..." : "Kirim Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
