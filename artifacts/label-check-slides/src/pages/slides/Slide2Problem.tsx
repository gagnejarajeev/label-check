export default function Slide2Problem() {
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
            width: "10vw", height: "3vh",
            backgroundColor: "#0A1628", opacity: 0.1, zIndex: 0,
          }} />
          <h2 style={{
            fontSize: "3.5vw", fontWeight: 900, color: "#0A1628",
            margin: 0, lineHeight: 1, letterSpacing: "-0.03em",
            position: "relative", zIndex: 1,
          }}>
            The Problem
          </h2>
        </div>
        <div style={{ fontSize: "1.2vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", gap: "5vw", flex: 1 }}>
        {/* Left: bullets */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5vh" }}>
          <p style={{ fontSize: "1.6vw", fontWeight: 500, color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
            TTB label review is a high-volume, high-stakes manual process with no consistent enforcement tooling.
          </p>
          <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0" }} />
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>01</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Volume</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                TTB receives thousands of label applications annually — manual review cannot scale to match demand.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>02</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Consistency</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                Manual review is slow, labour-intensive, and inconsistent — the same label may pass or fail depending on the reviewer.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#A0AEC0", fontWeight: 600, flexShrink: 0 }}>03</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, color: "#0A1628", margin: "0 0 0.8vh 0" }}>Cost of Error</h3>
              <p style={{ fontSize: "1.1vw", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>
                A single missed violation — wrong warning casing, mismatched ABV — can delay an approval by weeks and expose the agency to regulatory liability.
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
            The Regulatory Scope
          </h4>
          <p style={{ fontSize: "1.8vw", fontWeight: 800, color: "#0A1628", lineHeight: 1.2, margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>
            "Reviewers must verify five regulatory fields per label against 27 CFR Part 4, 5, 7 &amp; 16."
          </p>
          <div style={{ marginTop: "auto" }}>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#E2E8F0", marginBottom: "2vh" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#718096" }}>
              27 CFR Part 16 — Alcohol Beverage Health Warning Statement
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
          Problem / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#0A1628", fontWeight: 600 }}>
          02
        </div>
      </div>
    </div>
  );
}
