"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  PawPrint,
  PhoneCall,
  Heart,
  Newspaper,
  Syringe,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Início", icon: Home, accent: "text-neutral-600" },
  { href: "/animais", label: "Quero Adotar", icon: PawPrint, accent: "text-emerald-600" },
  { href: "/chamados", label: "Pedir Resgate", icon: PhoneCall, accent: "text-red-500" },
  { href: "/castracao", label: "Castração / Vacina", icon: Syringe, accent: "text-teal-600" },
  { href: "/noticias", label: "Blog & Notícias", icon: Newspaper, accent: "text-amber-600" },
  { href: "/ajude", label: "Ajude", icon: Heart, accent: "text-amber-500" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-20 bg-white border-b border-neutral-200 shadow-xl z-50 px-4 py-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.accent}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
