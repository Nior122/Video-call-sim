/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ExplorePersonas from "./components/ExplorePersonas";
import PersonaDetail from "./components/PersonaDetail";
import CallSession from "./components/CallSession";
import AdminDashboard from "./components/AdminDashboard";
import OnlinePopupToast from "./components/OnlinePopupToast";
import AuthModal from "./components/AuthModal";
import UserSettingsModal from "./components/UserSettingsModal";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ShieldAlert } from "lucide-react";

export default function App() {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  useEffect(() => {
    // 1. Prevent Right-Click Context Menu across media and app
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "IMG" ||
        target?.tagName === "VIDEO" ||
        target?.closest(".media-protected") ||
        target?.closest("video") ||
        target?.closest("img")
      ) {
        e.preventDefault();
        setSecurityNotice("Media download and copying is protected.");
        setTimeout(() => setSecurityNotice(null), 2500);
      }
    };

    // 2. Prevent Drag and Drop of images and videos
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "IMG" ||
        target?.tagName === "VIDEO" ||
        target?.closest("img") ||
        target?.closest("video")
      ) {
        e.preventDefault();
      }
    };

    // 3. Block Save (Ctrl+S / Cmd+S), Print (Ctrl+P / Cmd+P), and Screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Save page (Ctrl+S, Cmd+S)
      if (isCtrlOrMeta && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setSecurityNotice("Saving content is disabled for media protection.");
        setTimeout(() => setSecurityNotice(null), 2500);
        return;
      }

      // Print page (Ctrl+P, Cmd+P)
      if (isCtrlOrMeta && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setSecurityNotice("Printing is disabled for media protection.");
        setTimeout(() => setSecurityNotice(null), 2500);
        return;
      }

      // Screenshot keys (PrintScreen, Ctrl+Shift+S)
      if (
        e.key === "PrintScreen" ||
        (isCtrlOrMeta && e.shiftKey && (e.key === "S" || e.key === "s"))
      ) {
        setSecurityNotice("Screenshots are restricted on protected media.");
        setTimeout(() => setSecurityNotice(null), 2500);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (_) {}
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#07080e] text-neutral-100 dark:bg-[#07080e] dark:text-neutral-100 font-sans selection:bg-pink-500/30">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Primary Dreamgirls Routes */}
            <Route path="/dreamgirls" element={<ExplorePersonas />} />
            <Route path="/dreamgirl/:slug" element={<PersonaDetail />} />
            <Route path="/call/:slug" element={<CallSession />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Legacy Redirects for backwards compatibility */}
            <Route path="/personas" element={<Navigate to="/dreamgirls" replace />} />
            <Route path="/explore" element={<Navigate to="/dreamgirls" replace />} />
            <Route path="/persona/:slug" element={<PersonaDetail />} />
          </Routes>

          <OnlinePopupToast />
          <AuthModal />
          <UserSettingsModal />

          {/* Media Protection Security Notice Toast */}
          {securityNotice && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-neutral-900/95 border border-pink-500/40 text-pink-200 text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="font-medium">{securityNotice}</span>
            </div>
          )}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
