import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Recycle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">BlueCycle</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm hover:text-primary transition-colors">Fitur</a>
          <a href="#faq" className="text-sm hover:text-primary transition-colors">FAQ</a>
          <a href="#partnership" className="text-sm hover:text-primary transition-colors">Mitra</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" data-testid="button-login-nav">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full" data-testid="button-register-nav">Daftar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
