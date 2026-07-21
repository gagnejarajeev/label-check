export default function Slide3HowItWorks() {
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
            width: "13vw", height: "3vh",
            backgroundColor: "#0A1628", opacity: 0.1, zIndex: 0,
          }} />
          <h2 style={{
            fontSize: "3.5vw", fontWeight: 900, color: "#0A1628",
            margin: 0, lineHeight: 1, letterSpacing: "-0.03em",
            position: "relative", zIndex: 1,
          }}>
            How It Works
          </h2>
        </div>
        <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", gap: "5vw", flex: 1 }}>
        {/* Left: numbered steps */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
          <p style={{ fontSize: "1.6vw", fontWeight: 500, color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
            The LLM acts as a transcription service only. All compliance decisions are made by deterministic TypeScript on the server.
          </p>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>01</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.6vh 0" }}>Upload</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                User uploads a label image and provides application data (brand, class, ABV, net contents).
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>02</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.6vh 0" }}>Transcribe</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Gemini 2.5 Flash via OpenRouter reads the image and returns structured text — no judgments, transcription only.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>03</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.6vh 0" }}>Verify</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Deterministic TypeScript runs all five compliance checks — every verdict is explainable and reproducible.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>04</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.6vh 0" }}>Report</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Field-by-field breakdown with label value, application value, and plain-language assessment is returned instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Right: callout */}
        <div style={{
          flex: 1, backgroundColor: "#F7FAFC", border: "1px solid #E2E8F0",
          padding: "4vh 3vw", display: "flex", flexDirection: "column",
        }}>
          <h4 style={{
            fontSize: "1vw", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#718096", margin: "0 0 3vh 0",
          }}>
            Design Principle
          </h4>
          <p style={{ fontSize: "1.9vw", fontWeight: 800, color: "#0A1628", lineHeight: 1.2, margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>
            "The LLM is a witness. The code is the judge."
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", marginTop: "auto" }}>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "0.5vh" }}>Model</div>
                <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0A1628" }}>Gemini 2.5 Flash</div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "0.5vh" }}>Mode</div>
                <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0A1628" }}>Batch / Single</div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AEC0", marginBottom: "0.5vh" }}>Storage</div>
                <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0A1628" }}>Stateless</div>
              </div>
            </div>
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
          Architecture / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#0A1628", fontWeight: 600 }}>
          03
        </div>
      </div>
    </div>
  );
}
