export default function Slide6DesignDecisions() {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6vh" }}>
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
            Key Design Decisions
          </h2>
        </div>
        <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
      </div>

      {/* Content — two columns of decisions */}
      <div style={{ display: "flex", gap: "5vw", flex: 1 }}>
        {/* Left column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5vh" }}>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>01</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>LLM transcribes only</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                All verdicts are deterministic code, never the model. Every outcome can be audited without re-running inference.
              </p>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>02</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Bold yields NEEDS REVIEW</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Vision models are unreliable for font weight. Bold detection returns a soft verdict, not a hard REJECT, to avoid false positives.
              </p>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>03</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Case sensitivity is intentional</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Brand and class comparison is case-insensitive. Warning body is case-sensitive — 27 CFR Part 16 specifies the exact text.
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5vh" }}>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>04</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Stateless by design</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                No database, no stored images. Every request is self-contained — safe for prototype review and straightforward to harden for production.
              </p>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>05</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Configurable model</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                The OpenRouter model is set via environment variable — swap to any vision-capable model with no code changes.
              </p>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ backgroundColor: "#F7FAFC", border: "1px solid #E2E8F0", padding: "2.5vh 2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "1vh" }}>TRADEOFF NOTE</div>
            <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
              Levenshtein similarity (85% threshold) handles minor OCR noise and abbreviations. A stricter exact-match approach would produce false rejections on common label variations.
            </p>
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
          Decisions / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#0A1628", fontWeight: 600 }}>
          06
        </div>
      </div>
    </div>
  );
}
