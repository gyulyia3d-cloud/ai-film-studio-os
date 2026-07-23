import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
        Protótipo
      </span>
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        AI Film Studio <span className="text-[var(--accent)]">OS</span>
      </h1>
      <p className="mt-4 max-w-xl text-[15px] text-[var(--muted)]">
        O sistema operacional para desenvolvimento criativo audiovisual. Onboarding
        inteligente, writers&apos; room multiagente e roteiro pronto para produção —
        da ideia à página.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)]"
        >
          Entrar
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
