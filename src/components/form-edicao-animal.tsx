"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editarAnimal, excluirFotoAnimal } from "@/actions/animal";
import { Especie, Porte, Sexo, StatusAnimal } from "@prisma/client";
import {
  PawPrint,
  Camera,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import {
  formatarIdadeAproximada,
  obterFaixaEtariaAnimal,
} from "@/lib/animal-labels";
import Link from "next/link";

const TEMPERAMENTOS_PRESET = [
  "Dócil",
  "Brincalhão",
  "Calmo",
  "Sociável com outros cães",
  "Sociável com gatos",
  "Bom com crianças",
  "Carente",
  "Protetor",
  "Independente",
  "Energético",
];

export interface FotoEdicao {
  id: string;
  url: string;
  principal: boolean;
}

export interface AnimalEdicaoProps {
  id: string;
  nome: string;
  slug: string;
  especie: Especie;
  raca: string;
  porte: Porte;
  sexo: Sexo;
  idadeEstimadaMeses: number;
  pesoKg?: number | null;
  castrado: boolean;
  vacinado: boolean;
  vermifugado: boolean;
  necessidadesEspeciais: boolean;
  descricaoSaude?: string | null;
  temperamento: string[];
  exigeTelaProtecao: boolean;
  historia: string;
  status: StatusAnimal;
  destaqueVitrine: boolean;
  ativo: boolean;
  fotos: FotoEdicao[];
}

export function FormEdicaoAnimal({ animal }: { animal: AnimalEdicaoProps }) {
  const router = useRouter();

  // Dados Básicos
  const [nome, setNome] = useState(animal.nome);
  const [especie, setEspecie] = useState<Especie>(animal.especie);
  const [raca, setRaca] = useState(animal.raca);
  const [porte, setPorte] = useState<Porte>(animal.porte);
  const [sexo, setSexo] = useState<Sexo>(animal.sexo);
  const [idadeEstimadaMeses, setIdadeEstimadaMeses] = useState(String(animal.idadeEstimadaMeses));
  const [pesoKg, setPesoKg] = useState(animal.pesoKg ? String(animal.pesoKg) : "");

  // Saúde e Comportamento
  const [castrado, setCastrado] = useState(animal.castrado);
  const [vacinado, setVacinado] = useState(animal.vacinado);
  const [vermifugado, setVermifugado] = useState(animal.vermifugado);
  const [necessidadesEspeciais, setNecessidadesEspeciais] = useState(animal.necessidadesEspeciais);
  const [descricaoSaude, setDescricaoSaude] = useState(animal.descricaoSaude || "");
  const [exigeTelaProtecao, setExigeTelaProtecao] = useState(animal.exigeTelaProtecao);
  const [destaqueVitrine, setDestaqueVitrine] = useState(animal.destaqueVitrine);
  const [status, setStatus] = useState<StatusAnimal>(animal.status);

  // Temperamento
  const [temperamentos, setTemperamentos] = useState<string[]>(animal.temperamento || []);
  const [novoTemperamento, setNovoTemperamento] = useState("");

  // História
  const [historia, setHistoria] = useState(animal.historia);

  // Fotos Existentes e Novas
  const [fotosExistentes, setFotosExistentes] = useState<FotoEdicao[]>(animal.fotos || []);
  const [novasFotos, setNovasFotos] = useState<File[]>([]);
  const [novasPreviews, setNovasPreviews] = useState<string[]>([]);
  const [excluindoFotoId, setExcluindoFotoId] = useState<string | null>(null);

  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternarTag(tag: string) {
    if (temperamentos.includes(tag)) {
      setTemperamentos(temperamentos.filter((t) => t !== tag));
    } else {
      setTemperamentos([...temperamentos, tag]);
    }
  }

  function adicionarTagCustomizada() {
    if (novoTemperamento.trim() && !temperamentos.includes(novoTemperamento.trim())) {
      setTemperamentos([...temperamentos, novoTemperamento.trim()]);
      setNovoTemperamento("");
    }
  }

  async function handleExcluirFotoExistente(fotoId: string) {
    if (!confirm("Deseja realmente remover esta foto da galeria do animal?")) return;

    setExcluindoFotoId(fotoId);
    try {
      const res = await excluirFotoAnimal({
        fotoId,
        animalId: animal.id,
      });

      if (res.success) {
        setFotosExistentes((prev) => prev.filter((f) => f.id !== fotoId));
      } else {
        alert("Erro ao excluir foto: " + res.error);
      }
    } catch {
      alert("Falha de comunicação.");
    } finally {
      setExcluindoFotoId(null);
    }
  }

  function handleNovasFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const novosArquivos = Array.from(e.target.files);
    const espacoRestante = 5 - (fotosExistentes.length + novasFotos.length);

    if (novosArquivos.length > espacoRestante) {
      alert(`Você pode adicionar no máximo mais ${espacoRestante} foto(s).`);
    }

    const arquivosPermitidos = novosArquivos.slice(0, Math.max(0, espacoRestante));
    const previewsCriadas = arquivosPermitidos.map((f) => URL.createObjectURL(f));

    setNovasFotos((prev) => [...prev, ...arquivosPermitidos]);
    setNovasPreviews((prev) => [...prev, ...previewsCriadas]);
  }

  function removerNovaFoto(index: number) {
    URL.revokeObjectURL(novasPreviews[index]);
    setNovasFotos((prev) => prev.filter((_, i) => i !== index));
    setNovasPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSucesso(false);

    // Validação: não pode ficar sem foto na vitrine
    if (fotosExistentes.length === 0 && novasFotos.length === 0) {
      setError("É obrigatório manter pelo menos 1 foto real do animal na vitrine.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", animal.id);
      formData.append("nome", nome);
      formData.append("especie", especie);
      formData.append("raca", raca);
      formData.append("porte", porte);
      formData.append("sexo", sexo);
      formData.append("idadeEstimadaMeses", idadeEstimadaMeses);
      if (pesoKg) formData.append("pesoKg", pesoKg);
      formData.append("castrado", String(castrado));
      formData.append("vacinado", String(vacinado));
      formData.append("vermifugado", String(vermifugado));
      formData.append("necessidadesEspeciais", String(necessidadesEspeciais));
      if (descricaoSaude) formData.append("descricaoSaude", descricaoSaude);
      formData.append("exigeTelaProtecao", String(exigeTelaProtecao));
      formData.append("destaqueVitrine", String(destaqueVitrine));
      formData.append("temperamento", temperamentos.join(","));
      formData.append("historia", historia);
      formData.append("status", status);

      for (const foto of novasFotos) {
        formData.append("novasFotos", foto);
      }

      const res = await editarAnimal(formData);

      if (!res.success) {
        setError(res.error || "Erro ao atualizar animal.");
        setLoading(false);
        return;
      }

      setSucesso(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard/animais");
        router.refresh();
      }, 1500);
    } catch {
      setError("Erro inesperado ao salvar alterações. Tente novamente.");
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
          <span>Ficha de {animal.nome} atualizada com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* ========================================================
          1. DADOS DE IDENTIFICAÇÃO BÁSICA
      ======================================================== */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-emerald-600" />
          <span>Identificação do Animal</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Nome do Pet *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Espécie *
            </label>
            <select
              value={especie}
              onChange={(e) => setEspecie(e.target.value as Especie)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={Especie.CACHORRO}>🐶 Cachorro</option>
              <option value={Especie.GATO}>🐱 Gato</option>
              <option value={Especie.OUTRO}>🐾 Outro Animal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Raça *
            </label>
            <input
              type="text"
              required
              value={raca}
              onChange={(e) => setRaca(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Porte *
            </label>
            <select
              value={porte}
              onChange={(e) => setPorte(e.target.value as Porte)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={Porte.PEQUENO}>Pequeno (até 10kg)</option>
              <option value={Porte.MEDIO}>Médio (11 a 25kg)</option>
              <option value={Porte.GRANDE}>Grande (+25kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Sexo *
            </label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value as Sexo)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={Sexo.MACHO}>Macho</option>
              <option value={Sexo.FEMEA}>Fêmea</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Idade Estimada (em meses) *
            </label>
            <input
              type="number"
              min={1}
              max={300}
              required
              value={idadeEstimadaMeses}
              onChange={(e) => setIdadeEstimadaMeses(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {Number(idadeEstimadaMeses) >= 1 && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Exibição na vitrine: ~{formatarIdadeAproximada(Number(idadeEstimadaMeses))} (
                {obterFaixaEtariaAnimal(Number(idadeEstimadaMeses)).labelSingular})
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min={0.5}
              max={100}
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              placeholder="Ex: 14.5"
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Status Operacional *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusAnimal)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={StatusAnimal.DISPONIVEL}>Disponível para Adoção</option>
              <option value={StatusAnimal.EM_PROCESSO}>Em Processo de Adoção</option>
              <option value={StatusAnimal.EM_TRATAMENTO}>Em Tratamento Veterinário</option>
              <option value={StatusAnimal.ADOTADO}>Adotado (Final Feliz)</option>
              <option value={StatusAnimal.INDISPONIVEL}>Indisponível</option>
              <option value={StatusAnimal.OBITO}>Óbito (Histórico)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SAÚDE & CUIDADOS
      ======================================================== */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Controle de Saúde e Requisitos</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Castrado", val: castrado, setVal: setCastrado },
            { label: "Vacinado", val: vacinado, setVal: setVacinado },
            { label: "Vermifugado", val: vermifugado, setVal: setVermifugado },
            {
              label: "Cuidados Especiais",
              val: necessidadesEspeciais,
              setVal: setNecessidadesEspeciais,
            },
          ].map((item) => (
            <label
              key={item.label}
              className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-2.5 transition text-xs font-bold ${
                item.val
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.setVal(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label
            className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition text-xs font-bold ${
              exigeTelaProtecao
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <input
              type="checkbox"
              checked={exigeTelaProtecao}
              onChange={(e) => setExigeTelaProtecao(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span>Exigir Telas de Proteção na Adoção</span>
              <p className="text-[11px] font-normal text-neutral-500 mt-0.5">
                Obrigatório para apartamentos ou residências próximas a vias movimentadas.
              </p>
            </div>
          </label>

          <label
            className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition text-xs font-bold ${
              destaqueVitrine
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <input
              type="checkbox"
              checked={destaqueVitrine}
              onChange={(e) => setDestaqueVitrine(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span>Destacar na Página Inicial</span>
              <p className="text-[11px] font-normal text-neutral-500 mt-0.5">
                O pet aparecerá nos cards da Home do site para maior visibilidade.
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Observações Médicas / Quadro Clínico (Opcional)
          </label>
          <textarea
            rows={2}
            value={descricaoSaude}
            onChange={(e) => setDescricaoSaude(e.target.value)}
            placeholder="Ex: Faz uso contínuo de colírio, necessita ração hipoalergênica..."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* ========================================================
          3. TEMPERAMENTO
      ======================================================== */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-emerald-600" />
          <span>Temperamento e Personalidade</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {TEMPERAMENTOS_PRESET.map((tag) => {
            const selecionado = temperamentos.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => alternarTag(tag)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  selecionado
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                <span>{tag}</span>
                {selecionado && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            value={novoTemperamento}
            onChange={(e) => setNovoTemperamento(e.target.value)}
            placeholder="Outro traço de personalidade..."
            className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={adicionarTagCustomizada}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          4. HISTÓRIA DO PET
      ======================================================== */}
      <div className="space-y-2 pt-6 border-t border-neutral-200/80">
        <label className="block text-xs font-semibold text-neutral-700">
          História e Perfil do Animal (Mínimo 10 caracteres) *
        </label>
        <textarea
          rows={4}
          required
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          placeholder="Conte sobre como o animal foi resgatado, seus gostos, manias e como ele se comporta em família..."
          className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* ========================================================
          5. GALERIA DE FOTOS (EXISTENTES + NOVAS NO R2)
      ======================================================== */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Galeria de Fotos (Até 5 fotos)</span>
        </h3>

        {/* Fotos Já Cadastradas no R2 */}
        {fotosExistentes.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-neutral-600 mb-2">
              Fotos atuais na vitrine:
            </span>
            <div className="flex flex-wrap gap-3">
              {fotosExistentes.map((f, i) => (
                <div
                  key={f.id}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-200 group shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    disabled={excluindoFotoId === f.id}
                    onClick={() => handleExcluirFotoExistente(f.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition shadow-md"
                    title="Excluir esta foto"
                  >
                    {excluindoFotoId === f.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-neutral-900/80 text-white text-[9px] font-bold">
                      Capa
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previews de Novas Fotos */}
        {novasPreviews.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-emerald-700 mb-2">
              Novas fotos para envio ao Cloudflare R2:
            </span>
            <div className="flex flex-wrap gap-3">
              {novasPreviews.map((src, i) => (
                <div
                  key={src}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Nova foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removerNovaFoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Upload */}
        {fotosExistentes.length + novasFotos.length < 5 && (
          <label className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-neutral-50 hover:bg-emerald-50/40">
            <Camera className="w-6 h-6 text-neutral-400 group-hover:text-emerald-600" />
            <span className="text-xs font-bold text-neutral-700">
              Adicionar mais fotos do animal
            </span>
            <span className="text-[11px] text-neutral-400">
              Formatos JPG, PNG ou WebP (máx. 5 fotos no total)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNovasFotosChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* ========================================================
          BOTÕES DE AÇÃO DO FORMULÁRIO
      ======================================================== */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200/80">
        <Link
          href="/dashboard/animais"
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
              <span>Salvando alterações...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações do Pet</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

