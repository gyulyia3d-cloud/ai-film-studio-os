"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownView } from "@/components/MarkdownView";
import {
  AGENT_LABELS,
  DOC_LABELS,
  DOC_ORDER,
  type AgentRole,
  type DocType,
  type PipelineEvent,
} from "@/lib/types";

type StepState = { role: AgentRole; status: "running" | "done" };

export function WritersRoom({
  projectId,
  status,
  initialDocuments,
}: {
  projectId: string;
  status: string;
  initialDocuments: Partial<Record<DocType, string>>;
}) {
  const [documents, setDocuments] =
    useState<Partial<Record<DocType, string>>>(initialDocuments);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DocType | null>(
    DOC_ORDER.find((t) => initialDocuments[t]) ?? null
  );
  const router = useRouter();

  async function start() {
    setGenerating(true);
    setError(null);
    setSteps([]);

    const res = await fetch(`/api/projects/${projectId}/generate`, { method: "POST" });
    if (!res.body) {
      setError("Não foi possível iniciar o streaming.");
      setGenerating(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const line = chunk.replace(/^data:\s*/, "");
        if (!line) continue;
        const event = JSON.parse(line) as PipelineEvent;
        handleEvent(event);
      }
    }

    setGenerating(false);
    router.refresh();
  }

  function handleEvent(event: PipelineEvent) {
    if (event.type === "round_start") {
      setSteps((prev) => [...prev, { role: event.role, status: "running" }]);
    } else if (event.type === "round_done") {
      setSteps((prev) =>
        prev.map((s) => (s.role === event.role ? { ...s, status: "done" } : s))
      );
    } else if (event.type === "document") {
      setDocuments((prev) => ({ ...prev, [event.docType]: event.content }));
      setActiveTab((prev) => prev ?? event.docType);
    } else if (event.type === "error") {
      setError(event.message);
    }
  }

  const hasDocuments = DOC_ORDER.some((t) => documents[t]);

  return (
    <div className="flex flex-col gap-6">
      {!hasDocuments && !generating && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <h2 className="text-lg font-semibold">Brief pronto</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            A writers&apos; room vai encadear Diretor → Roteirista → Script Doctor →
            Produtor Executivo para transformar seu brief em logline, sinopse,
            tratamento, beat sheet, personagens e roteiro.
          </p>
          <button
            onClick={start}
            className="mt-5 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Iniciar Writers&apos; Room
          </button>
        </div>
      )}

      {(generating || steps.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {steps.map((step, i) => (
            <span
              key={i}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                step.status === "done"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] animate-pulse"
              }`}
            >
              {AGENT_LABELS[step.role]} {step.status === "done" ? "✓" : "…"}
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasDocuments && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-3">
            <div className="flex flex-wrap gap-1">
              {DOC_ORDER.filter((t) => documents[t]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    activeTab === type
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {DOC_LABELS[type]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {status === "ready" && !generating && (
                <button
                  onClick={start}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Regenerar
                </button>
              )}
              <a
                href={`/api/projects/${projectId}/export`}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Exportar Markdown
              </a>
            </div>
          </div>
          <div className="p-6">
            {activeTab && documents[activeTab] && (
              <MarkdownView content={documents[activeTab]!} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
