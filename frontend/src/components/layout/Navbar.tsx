"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, LogOut, User, ChevronDown, Shield, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById("user-dropdown-container");
      if (container && !container.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    ...(isMounted && isAuthenticated
      ? [
        { href: "/vocab", label: "Vocabulary" },
        { href: "/theory", label: "Theory Lessons" },
        { href: "/exercises", label: "Practice" },
      ]
      : [
        { href: "/theory", label: "Theory Lessons" },
        { href: "/#features", label: "Features" },
        { href: "/#", label: "Pricing" },
      ]),
  ];

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
          {isMounted && isAuthenticated ? (
            <div className="relative" id="user-dropdown-container">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-border bg-neutral-card/60 hover:bg-neutral-border/50 text-sm text-text-primary hover:text-text-primary transition-all duration-200 focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user?.username}</span>
                <ChevronDown className={cn("h-4 w-4 text-text-secondary transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-border bg-neutral-card/95 backdrop-blur-md p-1.5 shadow-xl animate-slide-up z-50">
                  <div className="px-3 py-2 border-b border-neutral-border mb-1">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Logged in as</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{user?.username}</p>
                    {user?.role === "ADMIN" && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold text-primary bg-primary/10 rounded">
                        Admin
                      </span>
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-neutral-border/50 transition-colors duration-150"
                  >
                    <LayoutDashboard className="h-4 w-4 text-text-secondary" />
                    <span>Dashboard</span>
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-neutral-border/50 transition-colors duration-150"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-neutral-border/50 transition-colors duration-150"
                  >
                    <User className="h-4 w-4 text-text-secondary" />
                    <span>Profile</span>
                  </Link>

                  <div className="h-px bg-neutral-border my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-status-error hover:bg-status-error/10 hover:text-status-error transition-colors duration-150 text-left font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
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
              {isMounted && isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary leading-none">{user?.username}</p>
                      <p className="text-xs text-text-secondary mt-1">{user?.role === "ADMIN" ? "Administrator" : "Student"}</p>
                    </div>
                  </div>

                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" fullWidth className="justify-start gap-2 h-10">
                      <LayoutDashboard className="h-4 w-4 text-text-secondary" />
                      Dashboard
                    </Button>
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="w-full">
                      <Button variant="outline" size="sm" fullWidth className="justify-start gap-2 h-10">
                        <Shield className="h-4 w-4 text-primary" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}

                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" fullWidth className="justify-start gap-2 h-10">
                      <User className="h-4 w-4 text-text-secondary" />
                      Profile
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    fullWidth
                    className="justify-start gap-2 h-10 text-status-error hover:text-status-error hover:bg-status-error/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
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
