import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { batchVerify, getSampleCsvUrl, type BatchResult, type BatchRowResult, type VerificationResult } from "@/lib/api";
import { VerdictBadge } from "./VerdictBadge";
import { FieldResultsTable } from "./FieldResultsTable";

export function BatchCheck() {
  const [manifest, setManifest] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const manifestRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  function handleManifestChange(e: ChangeEvent<HTMLInputElement>) {
    setManifest(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  }

  function handleImagesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImages(files);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!manifest) { setError("Please upload a CSV manifest."); return; }
    if (images.length === 0) { setError("Please upload at least one label image."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedRow(null);
    try {
      const res = await batchVerify(manifest, images);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-base text-blue-900 font-medium mb-1">How batch verification works</p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Upload a CSV manifest with columns: <code className="font-mono bg-blue-100 px-1 rounded">filename, brand_name, class_type, abv, net_contents</code></li>
          <li>Upload all label image files referenced in the manifest</li>
          <li>Each label is checked against its row in the CSV — up to 5 at a time</li>
        </ol>
        <a
          href={getSampleCsvUrl()}
          download="label-check-sample.csv"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
        >
          <DownloadIcon /> Download sample CSV
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Manifest upload */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">CSV Manifest</p>
            <UploadZone
              label={manifest?.name ?? "Select CSV file"}
              hint=".csv · must match the required columns"
              onClick={() => manifestRef.current?.click()}
              selected={!!manifest}
            />
            <input
              ref={manifestRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleManifestChange}
            />
          </div>

          {/* Image upload */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Label Images</p>
            <UploadZone
              label={images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} selected` : "Select label images"}
              hint="JPEG · PNG · WebP · filenames must match CSV"
              onClick={() => imagesRef.current?.click()}
              selected={images.length > 0}
            />
            <input
              ref={imagesRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImagesChange}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0f2d5e] px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#1a3d7a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Spinner />
              Verifying batch…
            </>
          ) : (
            "Run Batch Check"
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <section className="space-y-6 pt-4 border-t-2 border-gray-100">
          <BatchSummaryBar summary={result.summary} />
          <div className="space-y-3">
            {result.rows.map((row) => (
              <BatchRow
                key={row.row_index}
                row={row}
                expanded={expandedRow === row.row_index}
                onToggle={() => setExpandedRow(expandedRow === row.row_index ? null : row.row_index)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BatchSummaryBar({ summary }: { summary: BatchResult["summary"] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <SummaryCard label="Passed" count={summary.passed} color="bg-green-50 border-green-200 text-green-800" />
      <SummaryCard label="Need Review" count={summary.review} color="bg-amber-50 border-amber-200 text-amber-800" />
      <SummaryCard label="Rejected" count={summary.rejected} color="bg-red-50 border-red-200 text-red-800" />
      <SummaryCard label="Errors" count={summary.errors} color="bg-gray-50 border-gray-200 text-gray-700" />
    </div>
  );
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-xl border px-4 py-4 text-center ${color}`}>
      <p className="text-3xl font-black">{count}</p>
      <p className="text-sm font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function BatchRow({ row, expanded, onToggle }: { row: BatchRowResult; expanded: boolean; onToggle: () => void }) {
  const hasDetail = row.overall !== "ERROR" && row.result;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${hasDetail ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
      >
        <VerdictBadge verdict={row.overall} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{row.filename}</p>
          {row.brand_name && <p className="text-sm text-gray-500">{row.brand_name}</p>}
          {row.error_message && <p className="text-sm text-red-600 mt-0.5">{row.error_message}</p>}
        </div>
        {hasDetail && (
          <ChevronIcon open={expanded} />
        )}
        {row.result && (
          <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
            {row.result.latency_ms.toLocaleString()} ms · {Math.round(row.result.extraction.confidence * 100)}% conf.
          </span>
        )}
      </button>

      {expanded && row.result && (
        <div className="border-t border-gray-100 px-5 py-5 bg-gray-50 space-y-4">
          {row.result.extraction.legibility_issues && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              Legibility: {row.result.extraction.legibility_issues}
            </div>
          )}
          <FieldResultsTable fields={row.result.fields} />
        </div>
      )}
    </div>
  );
}

function UploadZone({ label, hint, onClick, selected }: { label: string; hint: string; onClick: () => void; selected: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 transition-colors
        ${selected ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}
    >
      <p className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-gray-700"}`}>{label}</p>
      <p className="text-xs text-gray-400">{hint}</p>
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
