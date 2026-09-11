import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Persona } from "../types";
import { Phone, MapPin, RefreshCw } from "lucide-react";
import {
  getPersonaOnlineStatus,
  togglePersonaOnlineStatus,
  subscribeToPersonaStatus,
  PersonaOnlineStatus
} from "../utils/personaStatus";

export interface PersonaCardProps {
  persona: Persona;
  key?: React.Key;
}

export default function PersonaCard({ persona }: PersonaCardProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PersonaOnlineStatus>(() =>
    getPersonaOnlineStatus(persona.slug)
  );

  useEffect(() => {
    setStatus(getPersonaOnlineStatus(persona.slug));
    const unsubscribe = subscribeToPersonaStatus((slug, newStatus) => {
      if (slug === persona.slug.toLowerCase()) {
        setStatus(newStatus);
      }
    });
    return unsubscribe;
  }, [persona.slug]);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = togglePersonaOnlineStatus(persona.slug);
    setStatus(updated);
  };

  // Parse personality tags
  const tags = persona.personality
    ? persona.personality.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4)
    : [];

  const location = [persona.city, persona.country].filter(Boolean).join(", ") || "Worldwide";

  return (
    <div className="group relative bg-[#0d0f1a] border border-white/[0.08] hover:border-pink-500/40 rounded-[28px] overflow-hidden transition-all duration-300 flex flex-col h-full shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1.5">
      {/* CARD COVER / BANNER PHOTO */}
      <div
        onClick={() => navigate(`/dreamgirl/${persona.slug}`)}
        className="relative h-36 sm:h-40 w-full overflow-hidden bg-neutral-900 shrink-0 cursor-pointer"
      >
        {persona.coverImage || persona.profileImage ? (
          <img
            src={persona.coverImage || persona.profileImage!}
            alt={persona.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#0d0f1a]" />
        )}

        {/* Subtle dark gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-transparent to-black/30" />

        {/* ONLINE STATUS / LAST SEEN BADGE */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleToggleStatus}
            title="Click to toggle Online/Offline mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/15 text-xs font-medium shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {status.isOnline ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-emerald-400 font-semibold">Online 🟢</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="text-neutral-300">{status.lastSeenText}</span>
              </>
            )}
            <RefreshCw className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 ml-0.5" />
          </button>
        </div>
      </div>

      {/* OVERLAPPING AVATAR & INFO CONTAINER */}
      <div className="px-5 pb-5 flex-1 flex flex-col relative z-10">
        <div className="-mt-16 sm:-mt-20 mb-3 flex items-end justify-between">
          <div
            onClick={() => navigate(`/dreamgirl/${persona.slug}`)}
            className="relative cursor-pointer"
          >
            <div className="p-[3px] bg-gradient-to-tr from-[#e1147a] via-[#ec4899] to-[#9333ea] rounded-full shadow-2xl shadow-black/90 group-hover:shadow-pink-500/40 transition-all">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-800 border-4 border-[#0d0f1a]">
                {persona.profileImage ? (
                  <img
                    src={persona.profileImage}
                    alt={persona.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white font-bold text-3xl">
                    {persona.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            {/* Pulsing indicator on avatar */}
            {status.isOnline && (
              <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-400 border-3 border-[#0d0f1a] shadow-[0_0_12px_rgba(52,211,153,0.9)] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
              </span>
            )}
          </div>
        </div>

        {/* NAME & USERNAME */}
        <div
          onClick={() => navigate(`/dreamgirl/${persona.slug}`)}
          className="mb-1.5 cursor-pointer"
        >
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-pink-300 transition-colors">
              {persona.name}
            </h3>
            <span className="text-xs text-neutral-400 font-normal">@{persona.slug}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
            <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
            <span>{location}</span>
          </div>
        </div>

        {/* PERSONALITY TAGS PILLS */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-2.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-neutral-300 border border-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* SHORT BIO */}
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-4">
          {persona.shortBio || persona.description}
        </p>

        {/* ACTION BUTTONS (CALL + VIEW PROFILE) */}
        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/call/${persona.slug}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#e1147a] to-[#9333ea] hover:opacity-95 shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>
          <Link
            to={`/dreamgirl/${persona.slug}`}
            className="flex items-center justify-center py-2.5 px-3 rounded-full text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 active:scale-95 transition-all text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
