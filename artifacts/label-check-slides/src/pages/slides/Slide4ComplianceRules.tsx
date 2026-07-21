export default function Slide4ComplianceRules() {
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
            width: "20vw", height: "3vh",
            backgroundColor: "#0A1628", opacity: 0.1, zIndex: 0,
          }} />
          <h2 style={{
            fontSize: "3.5vw", fontWeight: 900, color: "#0A1628",
            margin: 0, lineHeight: 1, letterSpacing: "-0.03em",
            position: "relative", zIndex: 1,
          }}>
            Five Compliance Rules
          </h2>
        </div>
        <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
      </div>

      <p style={{ fontSize: "1.5vw", fontWeight: 500, color: "#4A5568", lineHeight: 1.5, margin: "0 0 4vh 0", maxWidth: "60vw" }}>
        All verdicts are produced by deterministic TypeScript — the LLM supplies raw text only.
      </p>

      {/* Five rules grid */}
      <div style={{ display: "flex", gap: "2vw", flex: 1, alignItems: "flex-start" }}>
        <div style={{ flex: 1, paddingTop: "2vh", borderTop: "2px solid #0A1628" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>01</div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#0A1628", marginBottom: "1.5vh" }}>Government Warning</div>
          <div style={{ fontSize: "1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Word-for-word match to 27 CFR Part 16. Lead-in must be ALL CAPS.
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: "2vh", borderTop: "2px solid #0A1628" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>02</div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#0A1628", marginBottom: "1.5vh" }}>Brand Name</div>
          <div style={{ fontSize: "1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Normalized Levenshtein similarity. Pass threshold: 85%. Case-insensitive.
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: "2vh", borderTop: "2px solid #0A1628" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>03</div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#0A1628", marginBottom: "1.5vh" }}>Class / Type</div>
          <div style={{ fontSize: "1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Same normalization as brand name. Must match application data exactly after normalization.
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: "2vh", borderTop: "2px solid #0A1628" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>04</div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#0A1628", marginBottom: "1.5vh" }}>Alcohol Content</div>
          <div style={{ fontSize: "1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Numeric parse with proof/ABV cross-check. Tolerance: 0.01%. Catches internal label inconsistency.
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: "2vh", borderTop: "2px solid #0A1628" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>05</div>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#0A1628", marginBottom: "1.5vh" }}>Net Contents</div>
          <div style={{ fontSize: "1vw", color: "#4A5568", lineHeight: 1.5 }}>
            Unit-aware conversion: mL, L, fl oz. Tolerance: 1.5 mL to absorb rounding errors.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: "5vh", left: "5vw", right: "5vw",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid #E2E8F0", paddingTop: "2vh",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#A0AEC0" }}>
          Rules / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#0A1628", fontWeight: 600 }}>
          04
        </div>
      </div>
    </div>
  );
}
