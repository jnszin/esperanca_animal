"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LiveRevalidatorProps {
  /**
   * Intervalo de polling em milissegundos quando a aba estiver visível.
   * Padrão: 45000ms (45 segundos) - leve e seguro para VPS compartilhada.
   */
  intervalMs?: number;
}

/**
 * Componente cliente leve para auto-revalidação suave (Polling Leve + Focus).
 * Mantém visitantes com a página aberta em sincronia com alterações feitas no backoffice.
 */
export function LiveRevalidator({ intervalMs = 45000 }: LiveRevalidatorProps) {
  const router = useRouter();

  useEffect(() => {
    // 1. Revalidação instantânea ao focar na janela/aba do projeto
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener("focus", handleFocus);

    // 2. Polling periódico somente se o documento estiver visível (evita consumo em segundo plano)
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        router.refresh();
      }
    }, intervalMs);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(timer);
    };
  }, [router, intervalMs]);

  return null;
}

