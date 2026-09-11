import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, X, Sparkles } from "lucide-react";
import { DEFAULT_PERSONAS } from "../data/defaultPersonas";
import { Persona } from "../types";
import { setPersonaOnlineStatus } from "../utils/personaStatus";

export default function OnlinePopupToast() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [personas, setPersonas] = useState<Persona[]>(() => DEFAULT_PERSONAS);
  const timerRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  // Load latest personas from API if available
  useEffect(() => {
    fetch("/api/personas")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPersonas(data);
        }
      })
      .catch(() => {
        setPersonas(DEFAULT_PERSONAS);
      });
  }, []);

  // Schedule random popups
  useEffect(() => {
    // Don't show disruptive popup while user is in active video call screen
    if (location.pathname.startsWith("/call/")) {
      setActivePersona(null);
      return;
    }

    const triggerNextPopup = () => {
      // Random delay between 6 to 13 seconds (random timing)
      const randomInterval = Math.floor(Math.random() * (13000 - 6000 + 1)) + 6000;

      timerRef.current = window.setTimeout(() => {
        if (personas.length > 0) {
          // Pick a random persona
          const randomIdx = Math.floor(Math.random() * personas.length);
          const picked = personas[randomIdx];
          
          // Ensure she is marked as online in the store
          setPersonaOnlineStatus(picked.slug, true);
          setActivePersona(picked);

          // Auto-dismiss after 4.5 seconds
          dismissTimerRef.current = window.setTimeout(() => {
            setActivePersona(null);
            triggerNextPopup();
          }, 4500);
        } else {
          triggerNextPopup();
        }
      }, randomInterval);
    };

    triggerNextPopup();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    };
  }, [personas, location.pathname]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePersona(null);
  };

  const handleAction = (type: "call" | "view") => {
    if (!activePersona) return;
    const slug = activePersona.slug;
    setActivePersona(null);
    if (type === "call") {
      navigate(`/call/${slug}`);
    } else {
      navigate(`/dreamgirl/${slug}`);
    }
  };

  return (
    <AnimatePresence>
      {activePersona && (
        <motion.div
          key={activePersona.id + "-online-toast"}
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed bottom-5 left-4 sm:left-6 z-50 max-w-[360px] w-[calc(100vw-32px)] sm:w-auto"
        >
          <div
            onClick={() => handleAction("view")}
            className="group relative bg-[#0f111e]/95 hover:bg-[#131627] backdrop-blur-xl border border-pink-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/80 hover:shadow-pink-500/20 transition-all cursor-pointer overflow-hidden"
          >
            {/* Ambient subtle glow inside popup */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="flex items-start gap-3">
              {/* Bigger Avatar with pulsing green online dot */}
              <div className="relative shrink-0">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#e1147a] via-[#ec4899] to-[#9333ea] shadow-md shadow-pink-500/30">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-neutral-800 border-2 border-[#0f111e]">
                    <img
                      src={activePersona.profileImage || ""}
                      alt={activePersona.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                {/* 🟢 Online indicator badge */}
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0f111e] flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.9)]">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-white text-sm tracking-tight truncate group-hover:text-pink-300 transition-colors">
                    {activePersona.name} is online
                  </span>
                  <span className="text-emerald-400 text-sm animate-pulse">🟢</span>
                </div>

                <p className="text-[11px] text-neutral-300 font-medium truncate">
                  Available for 1-on-1 video call right now
                </p>

                {/* Quick actions */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction("call");
                    }}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-[#e1147a] to-[#9333ea] hover:opacity-95 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction("view");
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-neutral-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
