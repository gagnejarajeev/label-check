export default function Slide5Verdicts() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        padding: "5vh 5vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5vh" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", left: "-1vw", top: "1.5vh",
            width: "18vw", height: "3vh",
            backgroundColor: "#0A1628", opacity: 0.1, zIndex: 0,
          }} />
          <h2 style={{
            fontSize: "3.5vw", fontWeight: 900, color: "#0A1628",
            margin: 0, lineHeight: 1, letterSpacing: "-0.03em",
            position: "relative", zIndex: 1,
          }}>
            Verdicts &amp; Confidence
          </h2>
        </div>
        <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
      </div>

      {/* Three verdict cards */}
      <div style={{ display: "flex", gap: "2vw", marginBottom: "4vh" }}>
        <div style={{ flex: 1, backgroundColor: "#0A1628", color: "#FFFFFF", padding: "3.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1.5vh" }}>VERDICT</div>
          <div style={{ fontSize: "2.8vw", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "2vh" }}>PASS</div>
          <div style={{ fontSize: "1.1vw", color: "#E2E8F0", lineHeight: 1.5 }}>
            All five fields clear with no deviations. The label is compliant as submitted.
          </div>
        </div>
        <div style={{ flex: 1, border: "2px solid #E2E8F0", padding: "3.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1.5vh" }}>VERDICT</div>
          <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#0A1628", letterSpacing: "-0.03em", marginBottom: "2vh" }}>NEEDS REVIEW</div>
          <div style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Text is similar but not identical, or bold type on the warning cannot be confirmed by the vision model.
          </div>
        </div>
        <div style={{ flex: 1, border: "2px solid #0A1628", padding: "3.5vh 2.5vw", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1.5vh" }}>VERDICT</div>
          <div style={{ fontSize: "2.8vw", fontWeight: 900, color: "#0A1628", letterSpacing: "-0.03em", marginBottom: "2vh" }}>REJECT</div>
          <div style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5 }}>
            One or more fields fail a hard rule. The label cannot proceed without correction.
          </div>
        </div>
      </div>

      {/* Supporting detail */}
      <div style={{ display: "flex", gap: "5vw" }}>
        <div style={{ flex: 1 }}>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0", marginBottom: "2.5vh" }} />
          <h4 style={{ fontSize: "1vw", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#718096", margin: "0 0 1.5vh 0" }}>
            Per-Field Breakdown
          </h4>
          <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.6, margin: 0 }}>
            Every result includes field name, status, the raw label value, the application value, and a plain-language explanation. Mismatches show a word-level diff.
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0", marginBottom: "2.5vh" }} />
          <h4 style={{ fontSize: "1vw", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#718096", margin: "0 0 1.5vh 0" }}>
            Batch Mode
          </h4>
          <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.6, margin: 0 }}>
            Upload a CSV manifest and up to 500 images. Results include summary counts and expandable rows with full field detail per label.
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0", marginBottom: "2.5vh" }} />
          <h4 style={{ fontSize: "1vw", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#718096", margin: "0 0 1.5vh 0" }}>
            LLM Confidence
          </h4>
          <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.6, margin: 0 }}>
            Every result includes the model's 0–1 confidence score and any legibility issues detected, so reviewers know when to trust the extraction.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: "5vh", left: "5vw", right: "5vw",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid #E2E8F0", paddingTop: "2vh",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#A0AEC0" }}>
          Verdicts / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#0A1628", fontWeight: 600 }}>
          05
        </div>
      </div>
    </div>
  );
}
