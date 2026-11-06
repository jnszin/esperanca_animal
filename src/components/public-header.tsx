import Link from "next/link";
import { PawPrint, Heart, PhoneCall, LogIn } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 transition">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight block leading-none">
              Esperança Animal
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Adoção & Proteção
            </span>
          </div>
        </Link>

        {/* Links Principais */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 hover:text-emerald-700 transition"
          >
            Início
          </Link>
          <Link
            href="/animais"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5"
          >
            <PawPrint className="w-4 h-4" />
            <span>Quero Adotar</span>
          </Link>
          <Link
            href="/chamados"
            className="text-sm font-medium text-neutral-600 hover:text-red-600 transition flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4 text-red-500" />
            <span>Pedir Resgate</span>
          </Link>
          <Link
            href="/doacoes"
            className="text-sm font-medium text-neutral-600 hover:text-amber-600 transition flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-amber-500" />
            <span>Doar Pix</span>
          </Link>
        </nav>

        {/* Acesso Voluntário */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Área da ONG</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
