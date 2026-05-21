"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-border bg-neutral-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-text-primary hover:text-primary transition-colors duration-200"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span>LangWhich</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  pathname === link.href
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" id="nav-login-btn">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" id="nav-register-btn">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-border bg-neutral-card animate-fade-in">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-sm font-medium py-2 transition-colors duration-200",
                  pathname === link.href
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-neutral-border pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout} fullWidth>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
