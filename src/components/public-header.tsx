import Link from "next/link";
import {
  PawPrint,
  Heart,
  PhoneCall,
  Newspaper,
  Syringe,
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 transition">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-neutral-900 tracking-tight block leading-none whitespace-nowrap">
              Projeto Esperança Animal
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Adoção &amp; Proteção Animal
            </span>
          </div>
        </Link>

        {/* Links Principais */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 hover:text-emerald-700 transition whitespace-nowrap"
          >
            Início
          </Link>
          <Link
            href="/animais"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <PawPrint className="w-4 h-4 shrink-0" />
            <span>Quero Adotar</span>
          </Link>
          <Link
            href="/chamados"
            className="text-sm font-medium text-neutral-600 hover:text-red-600 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 text-red-500 shrink-0" />
            <span>Pedir Resgate</span>
          </Link>
          <Link
            href="/castracao"
            className="text-sm font-medium text-neutral-600 hover:text-teal-700 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Syringe className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Castração / Vacina</span>
          </Link>
          <Link
            href="/noticias"
            className="text-sm font-medium text-neutral-600 hover:text-amber-800 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Newspaper className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Blog & Notícias</span>
          </Link>
          <Link
            href="/ajude"
            className="text-sm font-medium text-neutral-600 hover:text-amber-600 transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Heart className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Ajude</span>
          </Link>
        </nav>

        {/* Menu Mobile */}
        <MobileNav />
      </div>
    </header>
  );
}
