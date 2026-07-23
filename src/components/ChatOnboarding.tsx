"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/lib/types";

export function ChatOnboarding({
  projectId,
  initialConversation,
}: {
  projectId: string;
  initialConversation: ChatMessage[];
}) {
  const [conversation, setConversation] = useState<ChatMessage[]>(initialConversation);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const hasStarted = useRef(initialConversation.length > 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      void sendTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendTurn(message?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message }),
      });
      const data = await res.json();

      setConversation((prev) => {
        const next = message ? [...prev, { role: "user" as const, content: message }] : prev;
        return [...next, { role: "assistant" as const, content: data.message }];
      });

      if (data.done) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const message = input.trim();
    setInput("");
    void sendTurn(message);
  }

  return (
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex max-h-[55vh] min-h-[300px] flex-col gap-4 overflow-y-auto p-6">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "bg-[var(--background)] border border-[var(--border)]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--muted)]">
              digitando…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!done && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-[var(--border)] p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua resposta…"
            disabled={loading}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[15px] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      )}

      {done && (
        <div className="border-t border-[var(--border)] p-4 text-center text-sm text-[var(--muted)]">
          Brief concluído. Atualizando página…
        </div>
      )}
    </div>
  );
}
