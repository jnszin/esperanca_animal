"use client";

import { useState } from "react";
import {
  consultarProtocoloCastracao,
  type ProtocoloPublicoDTO,
} from "@/actions/castracao";
import { FormCastracao } from "@/components/form-castracao";
import { ConsultaProtocoloCastracao } from "@/components/consulta-protocolo-castracao";
import { ClipboardList, Search } from "lucide-react";

interface CastracaoPortalProps {
  initialProtocoloCode?: string;
  initialProtocoloData?: ProtocoloPublicoDTO | null;
  initialProtocoloError?: string | null;
}

export function CastracaoPortal({
  initialProtocoloCode = "",
  initialProtocoloData = null,
  initialProtocoloError = null,
}: CastracaoPortalProps) {
  const [abaAtiva, setAbaAtiva] = useState<"cadastro" | "consulta">(
    initialProtocoloCode ? "consulta" : "cadastro"
  );
  const [codigoConsulta, setCodigoConsulta] = useState(initialProtocoloCode);
  const [dadosConsulta, setDadosConsulta] =
    useState<ProtocoloPublicoDTO | null>(initialProtocoloData);
  const [erroConsulta, setErroConsulta] = useState<string | null>(
    initialProtocoloError
  );

  async function handleVerProtocoloRecemCriado(protocolo: string) {
    setCodigoConsulta(protocolo);
    setAbaAtiva("consulta");
    const res = await consultarProtocoloCastracao(protocolo);
    if (res.success && res.dados) {
      setDadosConsulta(res.dados);
      setErroConsulta(null);
    } else {
      setDadosConsulta(null);
      setErroConsulta(res.error || null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Navegação por Abas */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setAbaAtiva("cadastro")}
          className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border transition cursor-pointer ${
            abaAtiva === "cadastro"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Cadastrar Pet</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("consulta")}
          className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 border transition cursor-pointer ${
            abaAtiva === "consulta"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Acompanhar Protocolo</span>
        </button>
      </div>

      {abaAtiva === "cadastro" ? (
        <FormCastracao onVerProtocolo={handleVerProtocoloRecemCriado} />
      ) : (
        <ConsultaProtocoloCastracao
          initialCode={codigoConsulta}
          initialData={dadosConsulta}
          initialError={erroConsulta}
        />
      )}
    </div>
  );
}

