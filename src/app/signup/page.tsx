"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-semibold">
          AI Film Studio <span className="text-[var(--accent)]">OS</span>
        </h1>
        <p className="mb-8 text-sm text-[var(--muted)]">Crie sua conta de protótipo.</p>

        {done ? (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            Conta criada. Se a confirmação por email estiver ativada no seu projeto
            Supabase, confirme o email antes de entrar. Depois é só{" "}
            <Link href="/login" className="text-[var(--accent)]">
              fazer login
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
            >
              {loading ? "Criando…" : "Criar conta"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-[var(--muted)]">
          Já tem conta?{" "}
          <Link href="/login" className="text-[var(--accent)]">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
