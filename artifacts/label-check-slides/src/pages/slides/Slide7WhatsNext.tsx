export default function Slide7WhatsNext() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#0A1628",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        padding: "5vh 5vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8vh" }}>
        <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
          label-check
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.9vw", color: "#A0AEC0",
          display: "flex", gap: "3vw",
        }}>
          <div>Treasury Assessment</div>
          <div>July 2026</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex", gap: "6vw", flex: 1 }}>
        {/* Left: hero title */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: "-2vw", top: "2vh",
              width: "20vw", height: "6vh",
              backgroundColor: "#FFFFFF", opacity: 0.05, zIndex: 0,
            }} />
            <h2 style={{
              fontSize: "5.5vw", fontWeight: 900, color: "#FFFFFF",
              margin: "0 0 3vh 0", lineHeight: 1, letterSpacing: "-0.04em",
              position: "relative", zIndex: 1,
            }}>
              What's Next
            </h2>
          </div>
          <p style={{ fontSize: "1.6vw", color: "#A0AEC0", lineHeight: 1.5, margin: 0, maxWidth: "30vw" }}>
            The prototype demonstrates the core verification loop. A production system extends these foundations.
          </p>
        </div>

        {/* Right: four next steps */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#4A5568", fontWeight: 600, flexShrink: 0 }}>01</div>
            <div>
              <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>COLA Registry Integration</div>
              <div style={{ fontSize: "1vw", color: "#A0AEC0", lineHeight: 1.5 }}>
                Connect to the TTB COLA Registry API for automatic application data lookup — no manual entry.
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#4A5568", fontWeight: 600, flexShrink: 0 }}>02</div>
            <div>
              <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Expanded Rule Coverage</div>
              <div style={{ fontSize: "1vw", color: "#A0AEC0", lineHeight: 1.5 }}>
                Net contents format, alcohol type eligibility, and appellation requirements under 27 CFR Part 4 and 5.
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#4A5568", fontWeight: 600, flexShrink: 0 }}>03</div>
            <div>
              <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Human-in-the-Loop Queue</div>
              <div style={{ fontSize: "1vw", color: "#A0AEC0", lineHeight: 1.5 }}>
                Route NEEDS REVIEW verdicts to a reviewer queue with inline annotation and override tracking.
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#4A5568", fontWeight: 600, flexShrink: 0 }}>04</div>
            <div>
              <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>Access Control &amp; Audit Trail</div>
              <div style={{ fontSize: "1vw", color: "#A0AEC0", lineHeight: 1.5 }}>
                Role-based access and immutable audit log for every verdict — required for regulatory accountability.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: "5vh", left: "5vw", right: "5vw",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "2vh",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#4A5568" }}>
          Next Steps / Label Check
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#FFFFFF", fontWeight: 600 }}>
          07
        </div>
      </div>
    </div>
  );
}
