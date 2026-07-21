import type { VerificationResult, BatchRowResult } from "@/lib/api";

type Verdict = VerificationResult["overall"] | BatchRowResult["overall"];

const CONFIG: Record<Verdict, { label: string; bg: string; text: string; border: string; stamp: string }> = {
  PASS: {
    label: "PASS",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-600",
    stamp: "text-green-700",
  },
  NEEDS_REVIEW: {
    label: "NEEDS REVIEW",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-500",
    stamp: "text-amber-600",
  },
  REJECT: {
    label: "REJECT",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-600",
    stamp: "text-red-700",
  },
  ERROR: {
    label: "ERROR",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-400",
    stamp: "text-gray-600",
  },
};

export function VerdictBadge({ verdict, size = "lg" }: { verdict: Verdict; size?: "sm" | "lg" }) {
  const cfg = CONFIG[verdict];

  if (size === "sm") {
    return (
      <span
        className={`inline-block px-3 py-0.5 rounded border-2 font-bold tracking-widest text-xs uppercase ${cfg.bg} ${cfg.text} ${cfg.border}`}
      >
        {cfg.label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center rounded-lg border-4 px-10 py-5 ${cfg.bg} ${cfg.border}`}>
      <span
        className={`font-black tracking-[0.25em] text-4xl uppercase select-none ${cfg.stamp}`}
        style={{ fontFamily: "serif", textShadow: "1px 1px 0 rgba(0,0,0,0.08)" }}
      >
        {cfg.label}
      </span>
    </div>
  );
}
