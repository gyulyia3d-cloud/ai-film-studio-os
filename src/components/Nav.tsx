"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Nav({ email }: { email?: string | null }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          AI Film Studio <span className="text-[var(--accent)]">OS</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          {email && <span>{email}</span>}
          <button
            onClick={signOut}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
