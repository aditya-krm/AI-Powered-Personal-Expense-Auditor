import { Github } from "lucide-react";

export function CommandBar() {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 flex justify-between items-center pointer-events-none">
      <div className="noir-pill bg-obsidian/40 backdrop-blur-md px-6 py-3 pointer-events-auto flex items-center gap-3">
        <div className="relative flex items-center justify-center w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
        </div>
        <span className="font-mono text-xs text-silver/80 tracking-widest uppercase">System: Operational</span>
      </div>

      <button className="noir-pill bg-obsidian/40 backdrop-blur-md px-6 py-3 pointer-events-auto group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-shadow duration-500 flex items-center gap-3 cursor-pointer">
        <Github className="w-4 h-4 text-silver group-hover:text-emerald transition-colors" />
        <span className="font-mono text-xs text-silver font-semibold tracking-wide">Connect GitHub</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald/50 group-hover:bg-emerald transition-colors"></div>
      </button>
    </div>
  );
}
