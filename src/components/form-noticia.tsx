"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarNoticia, editarNoticia } from "@/actions/noticia";
import {
  Newspaper,
  Camera,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";

const CATEGORIAS_PADRAO = [
  "Projetos Concluídos",
  "Histórias de Resgate",
  "Dicas Veterinárias",
  "Eventos & Feiras",
  "Avisos da Diretoria",
];

export interface FormNoticiaProps {
  noticiaExistente?: {
    id: string;
    titulo: string;
    subtitulo?: string | null;
    conteudo: string;
    categoria: string;
    publicado: boolean;
    tempoLeituraMin: number;
    autorNome: string;
    imagemCapaUrl?: string | null;
  };
}

export function FormNoticia({ noticiaExistente }: FormNoticiaProps) {
  const router = useRouter();
  const isEditing = Boolean(noticiaExistente);

  const [titulo, setTitulo] = useState(noticiaExistente?.titulo || "");
  const [subtitulo, setSubtitulo] = useState(noticiaExistente?.subtitulo || "");
  const [conteudo, setConteudo] = useState(noticiaExistente?.conteudo || "");
  const [categoria, setCategoria] = useState(noticiaExistente?.categoria || CATEGORIAS_PADRAO[0]);
  const [publicado, setPublicado] = useState(noticiaExistente?.publicado ?? true);
  const [tempoLeituraMin, setTempoLeituraMin] = useState(String(noticiaExistente?.tempoLeituraMin || 2));
  const [autorNome, setAutorNome] = useState(noticiaExistente?.autorNome || "Equipe Esperança Animal");

  // Imagem de Capa
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(noticiaExistente?.imagemCapaUrl || null);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function handleCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setCapaFile(file);
    setCapaPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSucesso(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      if (subtitulo) formData.append("subtitulo", subtitulo);
      formData.append("conteudo", conteudo);
      formData.append("categoria", categoria);
      formData.append("publicado", String(publicado));
      formData.append("tempoLeituraMin", tempoLeituraMin);
      formData.append("autorNome", autorNome);

      if (isEditing && noticiaExistente) {
        formData.append("id", noticiaExistente.id);
        if (capaFile) formData.append("novaImagemCapa", capaFile);

        const res = await editarNoticia(formData);
        if (!res.success) {
          setError(res.error || "Erro ao atualizar matéria.");
          setLoading(false);
          return;
        }
      } else {
        if (capaFile) formData.append("imagemCapa", capaFile);

        const res = await criarNoticia(formData);
        if (!res.success) {
          setError(res.error || "Erro ao publicar matéria.");
          setLoading(false);
          return;
        }
      }

      setSucesso(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard/noticias");
        router.refresh();
      }, 1200);
    } catch {
      setError("Erro inesperado de comunicação com o servidor.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80 space-y-8"
    >
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {sucesso && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Matéria {isEditing ? "atualizada" : "publicada"} com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* ========================================================
          1. INFORMAÇÕES BÁSICAS DA MATÉRIA
      ======================================================== */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-emerald-600" />
          <span>Dados da Publicação</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Título da Notícia / Projeto *
          </label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Novo Lar, Nova Esperança: O Abrigo Conclui Mudança após 1 Ano"
            className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Subtítulo / Resumo Prévio (Aparece nos cards e no início do texto)
          </label>
          <textarea
            rows={2}
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            placeholder="Breve resumo atraente de até 2 ou 3 linhas sobre o que se trata a matéria..."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Categoria *</span>
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-neutral-300 bg-white text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIAS_PADRAO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Tempo de Leitura (min) *</span>
            </label>
            <input
              type="number"
              min={1}
              max={60}
              required
              value={tempoLeituraMin}
              onChange={(e) => setTempoLeituraMin(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Autor da Postagem *
            </label>
            <input
              type="text"
              required
              value={autorNome}
              onChange={(e) => setAutorNome(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. IMAGEM DE CAPA (UPLOAD CLOUDFLARE R2)
      ======================================================== */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Imagem de Capa da Notícia</span>
        </h3>

        {capaPreview ? (
          <div className="relative aspect-16/9 rounded-3xl overflow-hidden border border-neutral-200 shadow-md max-w-xl group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capaPreview} alt="Capa" className="w-full h-full object-cover" />
            <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md">
              <Camera className="w-3.5 h-3.5" />
              <span>Trocar Foto</span>
              <input type="file" accept="image/*" onChange={handleCapaChange} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-neutral-50 hover:bg-emerald-50/40 max-w-xl">
            <Camera className="w-8 h-8 text-neutral-400 group-hover:text-emerald-600" />
            <span className="text-xs font-bold text-neutral-700">
              Clique para selecionar a foto de capa
            </span>
            <span className="text-[11px] text-neutral-400">
              Formatos JPG, PNG ou WebP (compressão automática via Sharp no R2)
            </span>
            <input type="file" accept="image/*" onChange={handleCapaChange} className="hidden" />
          </label>
        )}
      </div>

      {/* ========================================================
          3. CONTEÚDO COMPLETO DO ARTIGO
      ======================================================== */}
      <div className="space-y-2 pt-6 border-t border-neutral-200/80">
        <label className="block text-xs font-semibold text-neutral-700">
          Conteúdo Completo da Matéria (Parágrafos formatados) *
        </label>
        <textarea
          rows={10}
          required
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Escreva a história completa do resgate, a prestação de contas do projeto ou as dicas de cuidados. Pule linhas para separar parágrafos..."
          className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-normal"
        />
      </div>

      {/* ========================================================
          4. STATUS DE PUBLICAÇÃO
      ======================================================== */}
      <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={publicado}
            onChange={(e) => setPublicado(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <span className="text-xs font-bold text-neutral-900 block">
              Publicar imediatamente no Blog
            </span>
            <span className="text-[11px] text-neutral-500">
              Se desmarcado, a matéria será salva como Rascunho visível apenas para os administradores.
            </span>
          </div>
        </label>
      </div>

      {/* ========================================================
          5. BOTÕES DE AÇÃO
      ======================================================== */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200/80">
        <Link
          href="/dashboard/noticias"
          className="px-5 py-2.5 rounded-2xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processando matéria...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? "Salvar Alterações" : "Publicar Matéria"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
