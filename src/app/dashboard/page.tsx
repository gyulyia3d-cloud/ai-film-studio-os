import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewProjectButton } from "@/components/NewProjectButton";
import type { Project } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  onboarding: "Em onboarding",
  brief_ready: "Brief pronto",
  generating: "Gerando…",
  ready: "Pronto",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (projects ?? []) as Project[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Seus projetos</h1>
          <p className="text-sm text-[var(--muted)]">
            Da ideia ao roteiro, conduzido pela writers&apos; room de IA.
          </p>
        </div>
        <NewProjectButton />
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">
          Nenhum projeto ainda. Clique em &quot;+ Novo projeto&quot; para começar o
          onboarding.
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${project.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
            >
              <div>
                <h2 className="font-medium">{project.title}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {project.format ?? "Formato a definir"}
                </p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
