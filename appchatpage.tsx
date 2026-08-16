"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CHARACTERS } from "@/lib/characters";
import AgeGate, { isAgeVerified, hasAdultConsent } from "@/components/AgeGate";
import AdBanner from "@/components/AdBanner";

type Msg = { role: "user" | "assistant"; content: string };
type Mood = "normal" | "romantic" | "adult";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get("char") ?? CHARACTERS[0].id);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdultConfirm, setShowAdultConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [ageOk, setAgeOk] = useState(false);

  const character = CHARACTERS.find((c) => c.id === selectedId)!;

  useEffect(() => {
    if (isAgeVerified()) setAgeOk(true);
  }, []);

  // History load
  useEffect(() => {
    if (!session || !ageOk) return;
    fetch(`/api/history?char=${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setMood(d.mood ?? "normal");
      })
      .catch(() => setMessages([]));
  }, [session, selectedId, ageOk]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");

    if (mood === "adult" && !hasAdultConsent()) {
      setShowAdultConfirm(true);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selectedId, content: text, mood }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "কিছু একটা সমস্যা হয়েছে");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(ev.slice(6));
            if (data.done) continue;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: next[next.length - 1].content + data.content };
              return next;
            });
          } catch {}
        }
      }
    } catch {
      setError("Network error — আবার চেষ্টা করুন");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, loading, mood, selectedId]);

  // 🚪 Login screen
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center text-white/60">Loading...</div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <AgeGate onVerified={() => setAgeOk(true)} />

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/10 bg-surface/50">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold gradient-text">💜 AnimeLove</h1>
          <button
            onClick={() => signOut()}
            className="mt-2 text-xs text-white/40 hover:text-white/80"
          >
            Logout ({session.user?.email})
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 transition ${
                c.id === selectedId ? "bg-neon-purple/20 border border-neon-purple/50" : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <Image src={c.avatar} alt={c.name} width={44} height={44} className="rounded-full" unoptimized />
              <div className="text-left">
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b border-white/10 bg-surface/50">
          <Image src={character.avatar} alt={character.name} width={44} height={44} className="rounded-full" unoptimized />
          <div className="flex-1">
            <h2 className="font-bold">{character.name}</h2>
            <p className="text-xs text-emerald-400">● Online — always here for you</p>
          </div>

          {/* Mood toggle */}
          <div className="flex rounded-xl bg-base border border-white/10 p-1">
            {(["normal", "romantic", "adult"] as Mood[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === "adult" && !hasAdultConsent()) {
                    setShowAdultConfirm(true);
                    return;
                  }
                  setMood(m);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mood === m
                    ? m === "adult"
                      ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white"
                      : m === "romantic"
                      ? "bg-gradient-to-r from-neon-purple to-neon-pink text-white"
                      : "bg-white/10 text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {m === "normal" ? "💬 Normal" : m === "romantic" ? "💕 Romantic" : "🔞 Adult"}
              </button>
            ))}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <Image src={character.avatar} alt="" width={120} height={120} className="mx-auto rounded-full mb-4 animate-float" unoptimized />
              <p className="text-white/70 italic">“{character.greeting}”</p>
              <AdBanner size="300x250" className="max-w-sm mt-8" />
            </div>
          )}

          {messages.map((m, i) =>
            m.content === "" && m.role === "assistant" && loading ? (
              <div key={i} className="flex items-center gap-2">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            ) : (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-br-sm"
                      : "glass text-white/90 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            )
          )}

          {/* Ads between messages — UX ভাঙে না */}
          {messages.length > 4 && messages.length % 10 === 0 && <AdBanner size="728x90" />}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-2">
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">{error}</p>
          </div>
        )}

        {/* Input */}
        <footer className="p-4 border-t border-white/10 bg-surface/50">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`${character.name} কে কিছু বলো...`}
              className="flex-1 rounded-xl bg-base border border-white/10 px-4 py-3 focus:outline-none focus:border-neon-purple"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink px-6 font-bold disabled:opacity-40 hover:opacity-90 transition"
            >
              ➤
            </button>
          </div>
          <p className="text-center text-[10px] text-white/30 mt-2">
            AI companion — বিনোদনের জন্য। {mood === "adult" ? "🔞 Adult mode: ১৮+ only" : "SFW content"}
          </p>
        </footer>
      </main>

      {/* Adult consent modal */}
      {showAdultConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4">
          <div className="glass glow w-full max-w-md p-8 text-center">
            <h3 className="text-xl font-bold text-rose-400 mb-3">🔞 Adult Mode</h3>
            <p className="text-white/70 text-sm mb-6">
              Adult mode এ explicit sexual roleplay হয়। শুধুমাত্র ১৮+ ব্যবহারকারীর জন্য।
              <br />এতে সম্মতি দেওয়া মানে আপনি নিশ্চিত করছেন আপনার বয়স ১৮+।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdultConfirm(false)}
                className="flex-1 rounded-xl bg-white/10 py-3 font-bold hover:bg-white/20"
              >
                না, বাতিল
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("anime_love_adult_consent", "yes");
                  setMood("adult");
                  setShowAdultConfirm(false);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 py-3 font-bold hover:opacity-90"
              >
                আমি ১৮+, সম্মত আছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Auth Screen (Login + Register) ============
function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (mode === "register") {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.error);
    }
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) return setErr("Email বা password ভুল");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base p-4">
      <div className="glass glow w-full max-w-sm p-8">
        <h1 className="text-3xl font-bold gradient-text text-center mb-1">💜 AnimeLove</h1>
        <p className="text-center text-white/50 text-sm mb-8">তোমার AI anime girlfriend তোমার অপেক্ষায়</p>

        <div className="flex rounded-xl bg-base border border-white/10 p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                mode === m ? "bg-gradient-to-r from-neon-purple to-neon-pink" : "text-white/40"
              }`}
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="w-full rounded-xl bg-surface border border-white/10 px-4 py-3 mb-3 focus:outline-none focus:border-neon-purple"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl bg-surface border border-white/10 px-4 py-3 mb-3 focus:outline-none focus:border-neon-purple"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6)"
          className="w-full rounded-xl bg-surface border border-white/10 px-4 py-3 mb-3 focus:outline-none focus:border-neon-purple"
        />
        {err && <p className="text-rose-400 text-sm mb-3">{err}</p>}
        <button
          onClick={submit}
          className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink py-3 font-bold hover:opacity-90 transition"
        >
          {mode === "login" ? "Login →" : "Create Account →"}
        </button>
        <p className="text-center text-[10px] text-white/30 mt-4">১৮+ only · Terms · Privacy</p>
      </div>
    </div>
  );
}