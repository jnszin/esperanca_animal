"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarAnimal } from "@/actions/animal";
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
} from "lucide-react";
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

export function FormCadastroAnimal({
  chamadoOrigemId,
  nomeSugerido,
  especieSugerida,
}: {
  chamadoOrigemId?: string;
  nomeSugerido?: string;
  especieSugerida?: Especie;
}) {
  const router = useRouter();

  // Dados Básicos
  const [nome, setNome] = useState(nomeSugerido || "");
  const [especie, setEspecie] = useState<Especie>(especieSugerida || Especie.CACHORRO);
  const [raca, setRaca] = useState("SRD (Sem Raça Definida)");
  const [porte, setPorte] = useState<Porte>(Porte.MEDIO);
  const [sexo, setSexo] = useState<Sexo>(Sexo.MACHO);
  const [idadeEstimadaMeses, setIdadeEstimadaMeses] = useState("12");
  const [pesoKg, setPesoKg] = useState("");

  // Saúde e Comportamento
  const [castrado, setCastrado] = useState(false);
  const [vacinado, setVacinado] = useState(false);
  const [vermifugado, setVermifugado] = useState(false);
  const [necessidadesEspeciais, setNecessidadesEspeciais] = useState(false);
  const [descricaoSaude, setDescricaoSaude] = useState("");
  const [exigeTelaProtecao, setExigeTelaProtecao] = useState(especie === Especie.GATO);
  const [destaqueVitrine, setDestaqueVitrine] = useState(false);

  // Temperamento
  const [temperamentos, setTemperamentos] = useState<string[]>(["Dócil", "Brincalhão"]);
  const [novoTemperamento, setNovoTemperamento] = useState("");

  // História
  const [historia, setHistoria] = useState("");

  // Upload de Fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Estados de Controle
  const [loading, setLoading] = useState(false);
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

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const novosArquivos = Array.from(e.target.files);
    const totalDisponivel = 5 - fotos.length;

    if (novosArquivos.length > totalDisponivel) {
      alert("Você pode enviar no máximo 5 fotos por pet.");
    }

    const arquivosFiltrados = novosArquivos.slice(0, totalDisponivel);
    const novasPreviews = arquivosFiltrados.map((file) => URL.createObjectURL(file));

    setFotos((prev) => [...prev, ...arquivosFiltrados]);
    setPreviews((prev) => [...prev, ...novasPreviews]);
  }

  function removerFoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validação de foto obrigatória
    if (fotos.length === 0) {
      setError("É obrigatório anexar pelo menos 1 foto real e de boa qualidade do animal para cadastro na vitrine.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
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
      formData.append("status", StatusAnimal.DISPONIVEL);
      if (chamadoOrigemId) formData.append("chamadoOrigemId", chamadoOrigemId);

      for (const foto of fotos) {
        formData.append("fotos", foto);
      }

      const res = await cadastrarAnimal(formData);

      if (!res.success) {
        setError(res.error || "Erro ao cadastrar animal.");
        setLoading(false);
        return;
      }

      // Redireciona de volta para o catálogo do backoffice
      router.push("/dashboard/animais");
      router.refresh();
    } catch {
      setError("Erro inesperado ao salvar. Tente novamente.");
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

      {chamadoOrigemId && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
          <Heart className="w-5 h-5 shrink-0 text-blue-600" />
          <span>
            Este cadastro está vinculado a um chamado de acolhimento existente. Ao
            concluir, a ocorrência será automaticamente marcada como <strong>RESGATADA</strong>.
          </span>
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
              placeholder="Ex: Paçoca, Luna, Thor..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Espécie *
            </label>
            <select
              value={especie}
              onChange={(e) => {
                const esp = e.target.value as Especie;
                setEspecie(esp);
                if (esp === Especie.GATO) setExigeTelaProtecao(true);
              }}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
              placeholder="Ex: SRD, Poodle, Siamês..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Porte *
            </label>
            <select
              value={porte}
              onChange={(e) => setPorte(e.target.value as Porte)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value={Porte.PEQUENO}>Pequeno (Até 10kg)</option>
              <option value={Porte.MEDIO}>Médio (11kg a 25kg)</option>
              <option value={Porte.GRANDE}>Grande (Acima de 25kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Sexo *
            </label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value as Sexo)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
              required
              min={1}
              max={300}
              value={idadeEstimadaMeses}
              onChange={(e) => setIdadeEstimadaMeses(e.target.value)}
              placeholder="Ex: 12 (1 ano), 6 (6 meses)"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Peso em Kg (Opcional)
            </label>
            <input
              type="number"
              step="0.1"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              placeholder="Ex: 8.5"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SAÚDE, CUIDADOS E REGRAS DE TRIAGEM
      ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Saúde e Requisitos de Adoção</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={castrado}
              onChange={(e) => setCastrado(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-neutral-800">Castrado</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={vacinado}
              onChange={(e) => setVacinado(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-neutral-800">Vacinado</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={vermifugado}
              onChange={(e) => setVermifugado(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-neutral-800">Vermifugado</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={exigeTelaProtecao}
              onChange={(e) => setExigeTelaProtecao(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-neutral-800">
              Exige Janelas Teladas
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={necessidadesEspeciais}
              onChange={(e) => setNecessidadesEspeciais(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-neutral-800">
              Cuidados Especiais
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-amber-200 bg-amber-50/60 cursor-pointer hover:bg-amber-50">
            <input
              type="checkbox"
              checked={destaqueVitrine}
              onChange={(e) => setDestaqueVitrine(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-amber-900">
              ⭐ Destaque na Home
            </span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Observações Clínicas e Veterinárias (Opcional)
          </label>
          <input
            type="text"
            value={descricaoSaude}
            onChange={(e) => setDescricaoSaude(e.target.value)}
            placeholder="Ex: V10 aplicada em 10/10, castração cicatrizada, sem alterações no exame de sangue."
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* ========================================================
          3. TEMPERAMENTO & COMPORTAMENTO
      ======================================================== */}
      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
          Traços de Temperamento e Comportamento
        </label>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENTOS_PRESET.map((tag) => {
            const isSelected = temperamentos.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => alternarTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <span>{tag}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-w-sm pt-1">
          <input
            type="text"
            value={novoTemperamento}
            onChange={(e) => setNovoTemperamento(e.target.value)}
            placeholder="Adicionar outro traço..."
            className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
          <button
            type="button"
            onClick={adicionarTagCustomizada}
            className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-bold rounded-xl hover:bg-neutral-900 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inserir</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          4. HISTÓRIA DO PET
      ======================================================== */}
      <div className="space-y-2 pt-4 border-t border-neutral-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
          História e Perfil Acolhedor *
        </label>
        <textarea
          required
          rows={4}
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          placeholder="Conte sobre como o animal foi acolhido, o que ele mais gosta de fazer, como se comporta com humanos e qual o perfil de família ideal..."
          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      {/* ========================================================
          5. UPLOAD DE FOTOS (ATÉ 5 COM PREVIEW)
      ======================================================== */}
      <div className={`space-y-3 pt-4 border-t ${fotos.length === 0 && error ? "p-4 bg-red-50/50 rounded-2xl border-red-300" : "border-neutral-100"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
              Fotos do Pet para Vitrine *
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
              Mínimo 1 foto real obrigatória
            </span>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {fotos.length} de 5 fotos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removerFoto(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-1.5 left-1.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                  Capa Principal
                </div>
              )}
            </div>
          ))}

          {fotos.length < 5 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50/30 flex flex-col items-center justify-center p-3 cursor-pointer transition text-neutral-500 hover:text-emerald-700 group">
              <Camera className="w-7 h-7 mb-1.5 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-center">Foto</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">JPG ou PNG</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotoChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* ========================================================
          6. BOTÃO DE SUBMISSÃO
      ======================================================== */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-70 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Otimizando imagens WebP e cadastrando pet...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Publicar Animal na Vitrine</span>
            </>
          )}
        </button>

        <Link
          href="/dashboard/animais"
          className="px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-2xl transition text-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

