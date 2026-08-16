import Link from "next/link";
import { CHARACTERS } from "@/lib/characters";
import CharacterCard from "@/components/CharacterCard";
import AdBanner from "@/components/AdBanner";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-base/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold gradient-text">💜 AnimeLove AI</span>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-sm text-white/60 hover:text-white">Chat</Link>
            <Link
              href="/chat"
              className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink px-5 py-2 text-sm font-bold hover:opacity-90"
            >
              Chat Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: "linear-gradient(120deg,#a855f7,#ec4899,#22d3ee,#a855f7)",
            backgroundSize: "300% 300%",
            animation: "gradient 10s ease infinite",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            তোমার <span className="gradient-text">Perfect Anime Girlfriend</span>, AI Powered
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            ১২+ ইউনিক চরিত্র। Normal, Romantic আর 18+ Adult mood। Streaming AI chat — প্রতিটা কথার উত্তর
            সাথে সাথেই। সবসময় online, সবসময় তোমার পাশে। 💜
          </p>
          <Link
            href="/chat"
            className="mt-10 inline-block rounded-2xl bg-gradient-to-r from-neon-purple to-neon-pink px-10 py-4 text-lg font-bold glow hover:scale-105 transition"
          >
            💬 Chat Now — Free
          </Link>
          <p className="mt-4 text-sm text-white/40">🔞 18+ only · Free plan: ২০টি message/দিন</p>
        </div>
      </section>

      {/* Characters */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-2">তোমার <span className="gradient-text">Girlfriend</span> বেছে নাও</h2>
        <p className="text-center text-white/50 mb-10">প্রত্যেকের নিজস্ব personality, story আর mood</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHARACTERS.map((c) => (
            <CharacterCard key={c.id} char={c} />
          ))}
        </div>
      </section>

      <AdBanner size="728x90" className="max-w-4xl" />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">কেন <span className="gradient-text">AnimeLove</span>?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ["🎭", "৩টা Mood Mode", "Normal (SFW), Romantic আর Adult (18+ verified) — এক toggle এ switch"],
            ["⚡", "Instant Streaming", "Token-by-token reply, typing indicator সহ — real girlfriend feel"],
            ["🧠", "Long-term Memory", "তোমার chat history মনে রাখে, প্রতিটা character আলাদা সম্পর্ক"],
            ["🎨", "Custom Character", "Premium এ নিজের girlfriend বানাও — নাম, personality, story সব নিজের মতো"],
            ["🔊", "Voice Messages", "ElevenLabs TTS দিয়ে সে তোমাকে কথা বলে শোনাবে"],
            ["🔒", "Safe & Private", "JWT auth, bcrypt password, encrypted session — তোমার data নিরাপদ"],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="glass p-6 hover:glow transition">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8">
            <h3 className="font-bold text-xl">Free 🆓</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>✅ ২০টি message/দিন</li>
              <li>✅ Normal + Romantic mood</li>
              <li>✅ সব ১২টা character</li>
              <li>❌ Ads দেখা লাগবে</li>
            </ul>
          </div>
          <div className="glass p-8 glow border-neon-purple/50">
            <h3 className="font-bold text-xl gradient-text">Premium 💜</h3>
            <p className="mt-2 text-3xl font-extrabold">$9.99<span className="text-sm text-white/40">/month</span></p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>✅ Unlimited messages</li>
              <li>✅ Adult (18+) mode</li>
              <li>✅ Voice messages</li>
              <li>✅ Custom character</li>
              <li>✅ Ad-free experience</li>
            </ul>
            <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink py-3 font-bold hover:opacity-90">
              Upgrade (coming soon)
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
        {[
          ["এটা কি আসল মানুষ?", "না, এটা AI। কিন্তু personality, memory আর streaming reply দিয়ে feel আসল girlfriend এর মতো।"],
          ["Adult mode এ কি হয়?", "18+ verified users এর জন্য explicit roleplay। আলাদা consent নেওয়া হয়।"],
          ["আমার chat কি private?", "হ্যাঁ। JWT session আর encrypted DB storage। কোনো data third-party কে দেওয়া হয় না।"],
          ["কোন payment method?", "Stripe/Paddle দিয়ে subscription। শীঘ্রই crypto payment আসছে।"],
        ].map(([q, a]) => (
          <details key={q} className="glass mb-3 p-5 group">
            <summary className="cursor-pointer font-semibold list-none flex justify-between">
              {q} <span className="text-neon-purple group-open:rotate-45 transition">+</span>
            </summary>
            <p className="mt-3 text-sm text-white/60">{a}</p>
          </details>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <p>© 2026 AnimeLove AI — ১৮+ only</p>
        <div className="mt-2 space-x-4">
          <Link href="/terms" className="hover:text-white/80">Terms</Link>
          <Link href="/privacy" className="hover:text-white/80">Privacy</Link>
          <Link href="/privacy#dmca" className="hover:text-white/80">DMCA</Link>
        </div>
      </footer>
    </div>
  );
}