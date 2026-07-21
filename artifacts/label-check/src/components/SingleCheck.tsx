import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { verifyLabel, type VerificationResult } from "@/lib/api";
import { VerdictBadge } from "./VerdictBadge";
import { FieldResultsTable } from "./FieldResultsTable";

export function SingleCheck() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [classType, setClassType] = useState("");
  const [abv, setAbv] = useState("");
  const [netContents, setNetContents] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setResult(null);
    setError(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!image) { setError("Please upload a label image."); return; }
    if (!brandName.trim() || !classType.trim() || !abv.trim() || !netContents.trim()) {
      setError("Please fill in all application data fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await verifyLabel({ image, brand_name: brandName, class_type: classType, abv, net_contents: netContents });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1 — Upload */}
        <section>
          <h2 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
            <StepBadge n={1} /> Upload Label Image
          </h2>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors
              ${image ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}
          >
            {preview ? (
              <img src={preview} alt="Label preview" className="max-h-48 max-w-full rounded shadow object-contain" />
            ) : (
              <>
                <UploadIcon />
                <p className="text-base text-gray-600">Click to select a label image</p>
                <p className="text-sm text-gray-400">JPEG · PNG · WebP · max 8 MB</p>
              </>
            )}
            {image && (
              <p className="text-sm text-blue-700 font-medium">{image.name}</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </section>

        {/* Step 2 — Application Data */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <StepBadge n={2} /> Application Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Brand Name"
              placeholder={"e.g., \"Stone's Throw\""}
              value={brandName}
              onChange={setBrandName}
            />
            <Field
              label="Class / Type"
              placeholder='e.g., "Straight Rye Whiskey"'
              value={classType}
              onChange={setClassType}
            />
            <Field
              label="Alcohol by Volume (ABV)"
              placeholder='e.g., "45%" or "45"'
              value={abv}
              onChange={setAbv}
            />
            <Field
              label="Net Contents"
              placeholder='e.g., "750 mL" or "25.4 fl oz"'
              value={netContents}
              onChange={setNetContents}
            />
          </div>
        </section>

        {/* Step 3 — Submit */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <StepBadge n={3} /> Run Compliance Check
          </h2>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
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
                Verifying label…
              </>
            ) : (
              "Check Label"
            )}
          </button>
        </section>
      </form>

      {/* Results */}
      {result && (
        <section className="space-y-6 pt-4 border-t-2 border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <VerdictBadge verdict={result.overall} />
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Extraction confidence:{" "}
                <span className={`font-semibold ${result.extraction.confidence < 0.6 ? "text-amber-600" : "text-gray-800"}`}>
                  {Math.round(result.extraction.confidence * 100)}%
                </span>
              </p>
              <p>Processing time: <span className="font-semibold text-gray-800">{result.latency_ms.toLocaleString()} ms</span></p>
              {result.extraction.legibility_issues && (
                <p className="text-amber-700">
                  ⚠ Legibility: {result.extraction.legibility_issues}
                </p>
              )}
            </div>
          </div>

          <FieldResultsTable fields={result.fields} />
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
      />
    </label>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2d5e] text-sm font-bold text-white flex-shrink-0">
      {n}
    </span>
  );
}

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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
