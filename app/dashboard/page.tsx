export default function Dashboard() {
  const metrics = [
    { title: "Revenue Saved", value: "$28.4M", change: "+31%" },
    { title: "Demand Accuracy", value: "99.1%", change: "+7%" },
    { title: "Stockout Risk", value: "5%", change: "-18%" },
    { title: "Supplier Score", value: "96/100", change: "+9%" },
  ];

  const alerts = [
    "⚠ Supplier delay risk in China",
    "📈 GPU demand spike forecasted +42%",
    "📦 London warehouse at 92% capacity",
    "🤖 AI suggests reorder 8,500 units",
    "🚢 Shipping lane disruption detected",
  ];

  const products = [
    { name: "AI Chips", demand: "+42%", stock: "Low", score: "High Profit" },
    { name: "Cloud Servers", demand: "+18%", stock: "Healthy", score: "Stable" },
    { name: "Sensors", demand: "+57%", stock: "Critical", score: "Urgent" },
    { name: "Storage Units", demand: "+11%", stock: "Healthy", score: "Stable" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right,#1e3a8a,#020617,#000)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "grid",
        gridTemplateColumns: "250px 1fr 340px",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          padding: "28px 20px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h1 style={{ fontSize: "34px", marginBottom: "40px" }}>
          OracleStock AI
        </h1>

        {[
          "Dashboard",
          "Forecasting",
          "Inventory",
          "Suppliers",
          "Analytics",
          "AI Reports",
          "Billing",
          "Settings",
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "14px 18px",
              marginBottom: "12px",
              borderRadius: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background:
                i === 0
                  ? "linear-gradient(90deg,#2563eb,#06b6d4)"
                  : "rgba(255,255,255,0.03)",
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main */}
      <section style={{ padding: "28px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "44px", margin: 0 }}>
              Billion Dollar Command Center
            </h2>
            <p style={{ color: "#94a3b8" }}>
              Real-time AI forecasting, logistics & revenue optimization
            </p>
          </div>

          <button
            style={{
              padding: "14px 24px",
              border: "none",
              borderRadius: "14px",
              fontWeight: 700,
              color: "white",
              cursor: "pointer",
              background:
                "linear-gradient(90deg,#8b5cf6,#06b6d4)",
            }}
          >
            + Generate Investor Report
          </button>
        </div>

        {/* Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                padding: "22px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ color: "#94a3b8" }}>{m.title}</p>
              <h3 style={{ fontSize: "36px", margin: "10px 0" }}>
                {m.value}
              </h3>
              <span style={{ color: "#22c55e" }}>{m.change}</span>
            </div>
          ))}
        </div>

        {/* Chart + Map */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "18px",
            marginBottom: "22px",
          }}
        >
          {/* Chart */}
          <div
            style={{
              padding: "22px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <h3>Demand Prediction Engine</h3>

            <div
              style={{
                height: "260px",
                display: "flex",
                alignItems: "flex-end",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              {[90, 120, 110, 180, 210, 170, 260, 300].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}px`,
                    borderRadius: "14px 14px 0 0",
                    background:
                      "linear-gradient(180deg,#22d3ee,#2563eb)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Global Risk */}
          <div
            style={{
              padding: "22px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <h3>Global Risk Map</h3>

            <div
              style={{
                marginTop: "20px",
                height: "260px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg,#0f172a,#1e293b)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#38bdf8",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              🌍 LIVE SUPPLY NETWORK
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            padding: "22px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h3>AI Inventory Decisions</h3>

          {products.map((p, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "14px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>{p.name}</div>
              <div>{p.demand}</div>
              <div>{p.stock}</div>
              <div style={{ color: "#22c55e" }}>{p.score}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Panel */}
      <aside
        style={{
          padding: "28px 20px",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {/* Alerts */}
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
            marginBottom: "18px",
          }}
        >
          <h3>AI Alerts</h3>

          {alerts.map((a, i) => (
            <div
              key={i}
              style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {a}
            </div>
          ))}
        </div>

        {/* AI Assistant */}
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg,#1e293b,#0f172a)",
          }}
        >
          <h3>Oracle AI Assistant</h3>

          <p style={{ color: "#94a3b8" }}>
            Ask for stock risks, demand forecasts, suppliers or profits.
          </p>

          <input
            placeholder="Ask Oracle AI..."
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              outline: "none",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              background:
                "linear-gradient(90deg,#2563eb,#06b6d4)",
            }}
          >
            Run AI Analysis
          </button>
        </div>
      </aside>
    </main>
  );
}
