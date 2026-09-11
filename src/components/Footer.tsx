import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#05060a] border-t border-white/[0.07] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e1147a] via-[#ec4899] to-[#9333ea] flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Dream Girl
              </span>
            </Link>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Discover verified creators and personalities worldwide. Connect on live 1-on-1 video calls, direct chat, and explore exclusive photo stories.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-neutral-400">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">Explore</span>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/dreamgirls" className="hover:text-white transition-colors">
                    Explore Dreamgirls
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home & Discover
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">Safety & Trust</span>
              <ul className="space-y-1.5">
                <li className="text-neutral-500">Verified Profiles</li>
                <li className="text-neutral-500">Encrypted Messaging</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Dream Girl. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span>Verified Profiles</span>
            <span>•</span>
            <span>1-on-1 Video Connection</span>
            <span>•</span>
            <span>Direct Messaging</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
