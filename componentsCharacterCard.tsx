import Link from "next/link";
import Image from "next/image";
import type { AnimeCharacter } from "@/lib/characters";

export default function CharacterCard({ char }: { char: AnimeCharacter }) {
  return (
    <Link
      href={`/chat?char=${char.id}`}
      className="glass group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:glow"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={char.avatar}
          alt={char.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent" />
      </div>
      <div className="p-5 -mt-10 relative">
        <h3 className="text-xl font-bold">{char.name}</h3>
        <p className="text-sm text-neon-purple font-medium mb-2">{char.tagline}</p>
        <p className="text-sm text-white/60 line-clamp-2">{char.personality}</p>
        <span className="mt-4 inline-block rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink px-4 py-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition">
          Chat Now →
        </span>
      </div>
    </Link>
  );
}