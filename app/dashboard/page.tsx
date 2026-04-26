export default function Dashboard() {
  const stats = [
    { title: "Revenue Protected", value: "$12.8M", change: "+24%" },
    { title: "Stockout Risk", value: "8%", change: "-12%" },
    { title: "Inventory Accuracy", value: "98.2%", change: "+5%" },
    { title: "Supplier Health", value: "94/100", change: "+11%" },
  ];

  const alerts = [
    "⚠ Taiwan supplier delay detected",
    "📈 Demand surge predicted for AI Chips",
    "📦 Warehouse London nearing capacity",
    "🤖 AI recommends reorder of 4,200 units",
  ];

  const products = [
    { name: "Oracle CPU Chips", demand: "+34%", stock: "Healthy" },
    { name: "Cloud Servers", demand: "+21%", stock: "Low" },
    { name: "AI Sensors", demand: "+54%", stock: "Critical" },
    { name: "Storage Units", demand: "+12%", stock: "Healthy" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#050816,#0f172a,#111827,#020617)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "grid",
        gridTemplateColumns: "260px 1fr 340px",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          padding: "30px 22px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
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
          "Reports",
          "Settings",
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "14px 18px",
              marginBottom: "12px",
              borderRadius: "14px",
              background:
                i === 0
                  ? "linear-gradient(90deg,#2563eb,#06b6d4)"
                  : "rgba(255,255,255,0.03)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Center */}
      <section style={{ padding: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "42px", margin: 0 }}>
              Global Supply Dashboard
            </h2>
            <p style={{ color: "#94a3b8" }}>
              AI-powered forecasting & inventory intelligence
            </p>
          </div>

          <button
            style={{
              padding: "14px 22px",
              borderRadius: "14px",
              border: "none",
              color: "white",
              fontWeight: 700,
              background:
                "linear-gradient(90deg,#8b5cf6,#06b6d4)",
              cursor: "pointer",
            }}
          >
            + Generate AI Report
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          {stats.map((card, i) => (
            <div
              key={i}
              style={{
                padding: "22px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ color: "#94a3b8", marginBottom: "8px" }}>
                {card.title}
              </p>
              <h3 style={{ fontSize: "36px", margin: "0 0 8px 0" }}>
                {card.value}
              </h3>
              <span style={{ color: "#22c55e" }}>{card.change}</span>
            </div>
          ))}
        </div>

        {/* Forecast Chart */}
        <div
          style={{
            padding: "24px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.04)",
            marginBottom: "25px",
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Demand Forecast</h3>

          <div
            style={{
              height: "260px",
              display: "flex",
              alignItems: "flex-end",
              gap: "14px",
            }}
          >
            {[70, 90, 80, 130, 160, 120, 210, 240].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}px`,
                  borderRadius: "12px 12px 0 0",
                  background:
                    "linear-gradient(180deg,#22d3ee,#2563eb)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div
          style={{
            padding: "24px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h3 style={{ marginBottom: "18px" }}>Inventory Intelligence</h3>

          {products.map((p, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "14px 0",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>{p.name}</div>
              <div>{p.demand}</div>
              <div
                style={{
                  color:
                    p.stock === "Critical"
                      ? "#ef4444"
                      : p.stock === "Low"
                      ? "#f59e0b"
                      : "#22c55e",
                }}
              >
                {p.stock}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right Panel */}
      <aside
        style={{
          padding: "30px 22px",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            padding: "22px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.05)",
            marginBottom: "20px",
          }}
        >
          <h3>AI Alerts</h3>

          {alerts.map((a, i) => (
            <div
              key={i}
              style={{
                marginTop: "14px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {a}
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "22px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg,#1e293b,#0f172a)",
          }}
        >
          <h3>Oracle AI Assistant</h3>
          <p style={{ color: "#94a3b8" }}>
            Ask anything about supply chain, stock risk,
            forecasting or revenue.
          </p>

          <input
            placeholder="Ask Oracle AI..."
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "14px",
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
              borderRadius: "12px",
              border: "none",
              background:
                "linear-gradient(90deg,#2563eb,#06b6d4)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Run AI Analysis
          </button>
        </div>
      </aside>
    </main>
  );
}
