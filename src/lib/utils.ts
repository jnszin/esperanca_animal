import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MUNICIPIOS_SUGERIDOS = [
  "Vitória",
  "Vila Velha",
  "Serra",
  "Cariacica",
  "Viana",
  "Guarapari",
  "Fundão",
  "Aracruz",
];

/** Normaliza telefone brasileiro para padrão E.164 apenas dígitos (ex: 5527999999999). */
export function sanitizarWhatsappE164(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    return `55${digits}`;
  }
  return digits;
}

/** Formata telefone para exibição legível no painel administrativo. */
export function formatarWhatsappVisual(telefone: string): string {
  const digits = telefone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return telefone;
}

