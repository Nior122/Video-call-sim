import React, { useEffect, useState } from "react";
import { PhoneCall, PhoneOff, Video, Sparkles } from "lucide-react";
import { Persona } from "../types";

interface IncomingCallModalProps {
  persona: Persona;
  reason?: "prove_not_bot" | "call_request";
  onAccept: () => void;
  onDecline: (trigger?: "rejected" | "timeout") => void;
  ringingTimeoutSeconds?: number;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  persona,
  reason,
  onAccept,
  onDecline,
  ringingTimeoutSeconds = 20,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(ringingTimeoutSeconds);

  useEffect(() => {
    // Vibrate device if supported
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([400, 300, 400, 300, 600]);
      } catch (err) {
        console.warn("Vibration not allowed:", err);
      }
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Never automatically pick up! After 20 seconds of ringing, call ends as missed/timeout
          onDecline("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          // ignore
        }
      }
    };
  }, [onDecline]);

  const subtitle =
    reason === "prove_not_bot"
      ? "Calling to prove she's 100% real 😉"
      : "Calling you right now as requested 💋";

  return (
    <div
      id="incoming-call-modal"
      className="fixed inset-0 z-[120] flex flex-col items-center justify-between bg-neutral-950/90 backdrop-blur-2xl px-6 py-10 sm:py-14 text-white animate-in fade-in duration-300 select-none"
    >
      {/* Background ambient glow matching persona vibe */}
      <div className="absolute top-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pink-500/20 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />

      {/* Top Banner / Call Type */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-emerald-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Video className="w-3.5 h-3.5" />
          Incoming Video Call
        </div>
        <p className="text-sm sm:text-base text-neutral-300 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          {subtitle}
        </p>
      </div>

      {/* Center Persona Avatar with pulsing waves */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Outer pulsing ripple ring 1 */}
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-emerald-400/20 animate-ping duration-1000" />
          {/* Outer pulsing ripple ring 2 */}
          <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-pink-500/30 animate-pulse" />

          {/* Profile image container */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-emerald-400 shadow-2xl shadow-pink-500/30">
            <img
              src={persona.profileImage || persona.coverImage}
              alt={persona.name}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover rounded-full select-none"
            />
          </div>
        </div>

        <h2 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
          {persona.name}
        </h2>
        <div className="mt-1 flex flex-col items-center gap-1">
          <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ringing... ({secondsRemaining}s)
          </p>
          <span className="text-[11px] text-neutral-400 font-normal">
            Tap Accept to pick up the call
          </span>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-around gap-6 pt-4">
        {/* Decline Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            id="incoming-call-decline-btn"
            type="button"
            onClick={() => onDecline("rejected")}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-red-600/90 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30 transition-all duration-150 cursor-pointer"
            aria-label="Decline Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <span className="text-xs text-neutral-400 font-medium">Decline</span>
        </div>

        {/* Accept Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            id="incoming-call-accept-btn"
            type="button"
            onClick={onAccept}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/60 border-2 border-emerald-300/40 animate-bounce transition-all duration-150 cursor-pointer"
            aria-label="Accept Video Call"
          >
            <PhoneCall className="w-8 h-8" />
          </button>
          <span className="text-xs text-emerald-300 font-semibold tracking-wide">
            Accept Call
          </span>
        </div>
      </div>
    </div>
  );
};
