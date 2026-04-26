export default function Dashboard() {
  return (
    <main
      style={{
        margin: 0,
        padding: 0,
        fontFamily: "Inter, Arial, sans-serif",
        background: "#0b0f19",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "#111827",
          padding: "30px 20px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "40px" }}>
          OracleStock AI
        </h1>

        {[
          "Dashboard",
          "AI Signals",
          "Portfolio",
          "Watchlist",
          "Risk Radar",
          "News AI",
          "Settings",
        ].map((item) => (
          <div
            key={item}
            style={{
              padding: "14px 16px",
              marginBottom: "10px",
              borderRadius: "12px",
              background:
                item === "Dashboard"
                  ? "linear-gradient(90deg,#2563eb,#06b6d4)"
                  : "transparent",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <section
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Welcome Back</h2>
            <p style={{ color: "#94a3b8" }}>
              AI-powered market intelligence dashboard
            </p>
          </div>

          <button
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(90deg,#2563eb,#06b6d4)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Upgrade Pro
          </button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {[
            ["Portfolio Value", "$128,450"],
            ["Today Profit", "+$2,145"],
            ["AI Confidence", "92%"],
            ["Risk Score", "Low"],
          ].map(([title, value]) => (
            <div
              key={title}
              style={{
                background: "#111827",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p style={{ color: "#94a3b8", marginBottom: "10px" }}>{title}</p>
              <h3 style={{ margin: 0, fontSize: "28px" }}>{value}</h3>
            </div>
          ))}
        </div>

        {/* Chart + Signals */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
          }}
        >
          {/* Chart */}
          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "18px",
              minHeight: "340px",
            }}
          >
            <h3 style={{ marginBottom: "20px" }}>Market Forecast</h3>

            <div
              style={{
                height: "250px",
                borderRadius: "16px",
                background:
                  "linear-gradient(180deg, rgba(37,99,235,0.3), rgba(6,182,212,0.05))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
              }}
            >
              Live AI Chart Here
            </div>
          </div>

          {/* Signals */}
          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "18px",
            }}
          >
            <h3 style={{ marginBottom: "20px" }}>AI Signals</h3>

            {[
              "BUY NVIDIA +8%",
              "SELL META -4%",
              "WATCH TESLA volatility",
              "BUY APPLE rebound",
            ].map((signal) => (
              <div
                key={signal}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#1e293b",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                {signal}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* News */}
          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "18px",
            }}
          >
            <h3>Breaking News</h3>
            <p style={{ color: "#94a3b8" }}>
              Fed rate cuts expected. Tech sector rising.
            </p>
            <p style={{ color: "#94a3b8" }}>
              AI chip demand boosts semiconductor stocks.
            </p>
          </div>

          {/* AI Assistant */}
          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "18px",
            }}
          >
            <h3>AI Assistant</h3>
            <p style={{ color: "#94a3b8" }}>
              Ask: Should I buy Amazon now?
            </p>

            <input
              placeholder="Type your question..."
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "14px",
                borderRadius: "12px",
                border: "none",
                outline: "none",
                background: "#1e293b",
                color: "#fff",
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
