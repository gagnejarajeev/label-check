import type { FieldResult } from "@/lib/api";

const STATUS_ICON: Record<FieldResult["status"], { icon: string; color: string; bg: string }> = {
  PASS: { icon: "✓", color: "text-green-700", bg: "bg-green-100" },
  NEEDS_REVIEW: { icon: "⚠", color: "text-amber-700", bg: "bg-amber-100" },
  FAIL: { icon: "✗", color: "text-red-700", bg: "bg-red-100" },
};

export function FieldResultsTable({ fields }: { fields: FieldResult[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">
            <th className="px-4 py-3 border-b border-gray-200 w-8"></th>
            <th className="px-4 py-3 border-b border-gray-200">Field</th>
            <th className="px-4 py-3 border-b border-gray-200 hidden md:table-cell">Label Value</th>
            <th className="px-4 py-3 border-b border-gray-200">Assessment</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => {
            const s = STATUS_ICON[field.status];
            const isLast = i === fields.length - 1;
            return (
              <tr
                key={field.field}
                className={`${!isLast ? "border-b border-gray-100" : ""} align-top`}
              >
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${s.bg} ${s.color}`}
                  >
                    {s.icon}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900">{field.field}</div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell max-w-xs">
                  {field.label_value ? (
                    <p className="text-sm text-gray-700 font-mono break-words leading-relaxed">
                      {field.label_value.length > 120
                        ? `${field.label_value.slice(0, 120)}…`
                        : field.label_value}
                    </p>
                  ) : (
                    <span className="text-sm text-gray-400 italic">not found</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{field.explanation}</p>
                  {field.diff && (
                    <p className="mt-1 text-xs text-red-600 font-mono bg-red-50 rounded px-2 py-1 break-all">
                      {field.diff}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
