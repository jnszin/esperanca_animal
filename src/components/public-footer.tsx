import Link from "next/link";
import { PawPrint, Heart, Shield, Phone, Mail, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          {/* Coluna 1: Sobre */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Esperança Animal</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Trabalhamos pelo resgate, reabilitação e adoção consciente de animais
              em situação de risco e abandono. Cada vida importa.
            </p>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/animais" className="hover:text-emerald-400 transition">
                  Vitrine de Adoção
                </Link>
              </li>
              <li>
                <Link href="/chamados" className="hover:text-emerald-400 transition">
                  Central de Chamados de Resgate
                </Link>
              </li>
              <li>
                <Link href="/castracao" className="hover:text-emerald-400 transition">
                  Castração &amp; Vacinação (Protocolo)
                </Link>
              </li>
              <li>
                <Link href="/ajude" className="hover:text-emerald-400 transition">
                  Ajude (Doações &amp; Insumos)
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-emerald-400 transition">
                  Blog & Projetos da ONG
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contato & Emergências */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Atendimento</h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp com Notificações n8n</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>contato@esperancaanimal.ong.br</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Espírito Santo, Brasil</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Transparência & LGPD */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Compromisso Ético</h4>
            <div className="bg-neutral-800/80 p-4 rounded-xl border border-neutral-700/60 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Proteção de Dados (LGPD)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Todos os dados informados em cadastros de adoção e resgates são
                armazenados com criptografia e usados estritamente para contato
                oficial da ONG.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} ONG Esperança Animal. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
            <span>para salvar vidas.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

