"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProjectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createProject() {
    setLoading(true);
    const res = await fetch("/api/projects", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.id) {
      router.push(`/dashboard/${data.id}`);
    }
  }

  return (
    <button
      onClick={createProject}
      disabled={loading}
      className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
    >
      {loading ? "Criando…" : "+ Novo projeto"}
    </button>
  );
}
