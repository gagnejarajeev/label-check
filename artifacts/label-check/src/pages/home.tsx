import { useState } from "react";
import { SingleCheck } from "@/components/SingleCheck";
import { BatchCheck } from "@/components/BatchCheck";

type Tab = "single" | "batch";

export default function Home() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0f2d5e] shadow-md">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ShieldIcon />
              <h1 className="text-2xl font-bold text-white tracking-tight">Label Check</h1>
            </div>
            <p className="mt-0.5 text-sm text-blue-200 ml-10">
              TTB Alcohol Label Compliance Verification
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Prototype</p>
            <p className="text-xs text-blue-400">27 CFR Part 16</p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex gap-0" role="tablist">
            <TabButton
              label="Single Check"
              active={tab === "single"}
              onClick={() => setTab("single")}
            />
            <TabButton
              label="Batch"
              active={tab === "batch"}
              onClick={() => setTab("batch")}
            />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {tab === "single" ? <SingleCheck /> : <BatchCheck />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-gray-400">
          Label Check verifies TTB alcohol labels against 27 CFR Part 16. Results are for internal review only and do not constitute official regulatory determinations.
        </div>
      </footer>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-6 py-4 text-base font-semibold border-b-2 transition-colors focus:outline-none
        ${active
          ? "border-[#0f2d5e] text-[#0f2d5e]"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
    >
      {label}
    </button>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-8 w-8 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
