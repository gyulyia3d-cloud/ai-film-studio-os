"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OBJETIVO_OPTIONS,
  FORMATO_OPTIONS,
  FAIXA_ETARIA_OPTIONS,
  INTERESSE_OPTIONS,
  ORCAMENTO_OPTIONS,
  PRAZO_OPTIONS,
  IDIOMA_OPTIONS,
  ESTILO_OPTIONS,
  RECURSOS_OPTIONS,
  PIPELINE_OPTIONS,
  type Choice,
} from "@/lib/onboarding-options";
import type { ProjectBrief } from "@/lib/types";

function labelsFor(options: Choice[], values: string[]): string {
  return options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label)
    .join(", ");
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: Choice[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}) {
  function toggle(v: string) {
    if (multi) {
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    } else {
      onChange([v]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip key={opt.value} active={value.includes(opt.value)} onClick={() => toggle(opt.value)}>
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}

const TOTAL_STEPS = 8;

export function OnboardingWizard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [ideiaInicial, setIdeiaInicial] = useState("");
  const [objetivo, setObjetivo] = useState<string[]>([]);
  const [formato, setFormato] = useState<string[]>([]);
  const [faixaEtaria, setFaixaEtaria] = useState<string[]>([]);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [orcamento, setOrcamento] = useState<string[]>([]);
  const [prazo, setPrazo] = useState<string[]>([]);
  const [idioma, setIdioma] = useState<string[]>([]);
  const [estilo, setEstilo] = useState<string[]>([]);
  const [referenciaLivre, setReferenciaLivre] = useState("");
  const [recursos, setRecursos] = useState<string[]>([]);
  const [pipeline, setPipeline] = useState<string[]>([]);

  const canAdvance = [
    ideiaInicial.trim().length > 0 && objetivo.length > 0,
    formato.length > 0,
    faixaEtaria.length > 0 && interesses.length > 0,
    orcamento.length > 0 && prazo.length > 0,
    idioma.length > 0 && estilo.length > 0,
    recursos.length > 0,
    pipeline.length > 0,
    true,
  ][step];

  async function submit() {
    setSaving(true);

    const brief: ProjectBrief = {
      ideiaInicial: ideiaInicial.trim(),
      objetivo: labelsFor(OBJETIVO_OPTIONS, objetivo),
      formato: labelsFor(FORMATO_OPTIONS, formato),
      publicoAlvo: `${labelsFor(FAIXA_ETARIA_OPTIONS, faixaEtaria)} — interesses: ${labelsFor(
        INTERESSE_OPTIONS,
        interesses
      )}`,
      orcamento: labelsFor(ORCAMENTO_OPTIONS, orcamento),
      prazo: labelsFor(PRAZO_OPTIONS, prazo),
      idioma: labelsFor(IDIOMA_OPTIONS, idioma),
      referenciasVisuais: referenciaLivre.trim() || "Sem referência específica informada",
      estiloNarrativo: labelsFor(ESTILO_OPTIONS, estilo),
      recursosDisponiveis: labelsFor(RECURSOS_OPTIONS, recursos),
      pipelineProducao: labelsFor(PIPELINE_OPTIONS, pipeline),
    };

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, brief }),
    });

    setSaving(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Qual é a ideia inicial?</h2>
            <p className="mb-3 text-sm text-[var(--muted)]">
              Conte livremente, com suas palavras, o que você imagina.
            </p>
            <textarea
              value={ideiaInicial}
              onChange={(e) => setIdeiaInicial(e.target.value)}
              rows={4}
              placeholder="Ex: quero criar um vídeo sobre..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Qual é o objetivo principal?</h3>
            <ChipGroup options={OBJETIVO_OPTIONS} value={objetivo} onChange={setObjetivo} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-1 text-lg font-semibold">Em que formato?</h2>
          <p className="mb-3 text-sm text-[var(--muted)]">Escolha o que mais se aproxima.</p>
          <ChipGroup options={FORMATO_OPTIONS} value={formato} onChange={setFormato} />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Para quem é esse projeto?</h2>
            <h3 className="mb-2 text-sm font-medium">Faixa etária</h3>
            <ChipGroup options={FAIXA_ETARIA_OPTIONS} value={faixaEtaria} onChange={setFaixaEtaria} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Interesses (pode escolher mais de um)</h3>
            <ChipGroup options={INTERESSE_OPTIONS} value={interesses} onChange={setInteresses} multi />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Orçamento e prazo</h2>
            <h3 className="mb-2 text-sm font-medium">Orçamento</h3>
            <ChipGroup options={ORCAMENTO_OPTIONS} value={orcamento} onChange={setOrcamento} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Prazo</h3>
            <ChipGroup options={PRAZO_OPTIONS} value={prazo} onChange={setPrazo} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Idioma e estilo narrativo</h2>
            <h3 className="mb-2 text-sm font-medium">Idioma</h3>
            <ChipGroup options={IDIOMA_OPTIONS} value={idioma} onChange={setIdioma} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Estilo (pode escolher mais de um)</h3>
            <ChipGroup options={ESTILO_OPTIONS} value={estilo} onChange={setEstilo} multi />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">
              Referência visual/narrativa (opcional — canal, filme, artista...)
            </h3>
            <input
              value={referenciaLivre}
              onChange={(e) => setReferenciaLivre(e.target.value)}
              placeholder="Ex: MelodySheep"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-1 text-lg font-semibold">Quais recursos você já tem?</h2>
          <p className="mb-3 text-sm text-[var(--muted)]">Pode escolher mais de um.</p>
          <ChipGroup options={RECURSOS_OPTIONS} value={recursos} onChange={setRecursos} multi />
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="mb-1 text-lg font-semibold">Qual pipeline de produção?</h2>
          <ChipGroup options={PIPELINE_OPTIONS} value={pipeline} onChange={setPipeline} />
        </div>
      )}

      {step === 7 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Revisar brief</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs uppercase text-[var(--muted)]">Ideia</dt><dd>{ideiaInicial}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Objetivo</dt><dd>{labelsFor(OBJETIVO_OPTIONS, objetivo)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Formato</dt><dd>{labelsFor(FORMATO_OPTIONS, formato)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Público</dt><dd>{labelsFor(FAIXA_ETARIA_OPTIONS, faixaEtaria)} · {labelsFor(INTERESSE_OPTIONS, interesses)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Orçamento</dt><dd>{labelsFor(ORCAMENTO_OPTIONS, orcamento)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Prazo</dt><dd>{labelsFor(PRAZO_OPTIONS, prazo)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Idioma</dt><dd>{labelsFor(IDIOMA_OPTIONS, idioma)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Estilo</dt><dd>{labelsFor(ESTILO_OPTIONS, estilo)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Referência</dt><dd>{referenciaLivre || "—"}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Recursos</dt><dd>{labelsFor(RECURSOS_OPTIONS, recursos)}</dd></div>
            <div><dt className="text-xs uppercase text-[var(--muted)]">Pipeline</dt><dd>{labelsFor(PIPELINE_OPTIONS, pipeline)}</dd></div>
          </dl>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-30"
        >
          Voltar
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-40"
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-40"
          >
            {saving ? "Salvando…" : "Confirmar e gerar brief"}
          </button>
        )}
      </div>
    </div>
  );
}
