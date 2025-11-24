import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <Button
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 md:bottom-8 md:right-8"
          data-testid="button-scroll-to-top"
          title="Kembali ke atas"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
