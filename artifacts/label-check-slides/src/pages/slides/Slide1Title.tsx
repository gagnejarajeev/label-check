export default function Slide1Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        padding: "5vh 5vw",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: "1.5vw", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.02em" }}>
          label-check
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.9vw",
          color: "#4A5568",
          display: "flex",
          flexDirection: "column",
          gap: "1vh",
          textAlign: "right",
        }}>
          <div><span style={{ color: "#A0AEC0", marginRight: "1vw" }}>Project:</span>Label Check</div>
          <div><span style={{ color: "#A0AEC0", marginRight: "1vw" }}>Date:</span>July 2026</div>
          <div><span style={{ color: "#A0AEC0", marginRight: "1vw" }}>Lead:</span>Treasury Assessment</div>
          <div><span style={{ color: "#A0AEC0", marginRight: "1vw" }}>Status:</span>Prototype</div>
        </div>
      </div>

      {/* Hero title block */}
      <div style={{ position: "absolute", bottom: "15vh", left: "5vw", width: "90vw" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute",
            left: "-2vw",
            top: "2vh",
            width: "28vw",
            height: "5vh",
            backgroundColor: "#0A1628",
            opacity: 0.1,
            zIndex: 0,
          }} />
          <h1 style={{
            fontSize: "8vw",
            fontWeight: 900,
            color: "#0A1628",
            margin: 0,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            position: "relative",
            zIndex: 1,
          }}>
            Label Check
          </h1>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "6vh",
        }}>
          <p style={{
            fontSize: "1.8vw",
            fontWeight: 500,
            color: "#4A5568",
            margin: 0,
            maxWidth: "52vw",
            lineHeight: 1.4,
          }}>
            Automated TTB alcohol label compliance verification — take-home prototype.
          </p>
          <div style={{ width: "30vw", height: "1px", backgroundColor: "#E2E8F0" }} />
        </div>
      </div>
    </div>
  );
}
