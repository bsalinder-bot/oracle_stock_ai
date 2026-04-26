export default function Dashboard() {
  const cards = [
    { title: "Revenue Protected", value: "$4.8M", change: "+18%" },
    { title: "Stockout Risk", value: "12%", change: "-6%" },
    { title: "Inventory Accuracy", value: "96.4%", change: "+3%" },
    { title: "Supplier Health", value: "89/100", change: "+7%" },
  ];

  const alerts = [
    "⚠ Supplier shipment delay detected in Asia region",
    "📈 Demand spike predicted for Product A in 7 days",
    "📦 Overstock risk for Warehouse 3",
    "🤖 AI recommends reorder of 1,250 units",
  ];

  const products = [
    { name: "Oracle CPU Chips", demand: "+34%", stock: "Healthy" },
    { name: "Server Boards", demand: "+19%", stock: "Low" },
    { name: "Cloud Modules", demand: "+51%", stock: "Critical" },
    { name: "AI Sensors", demand: "+12%", stock: "Healthy" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          padding: "30px 20px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "40px", fontSize: "28px" }}>
          OracleStock AI
        </h2>

        {[
          "Dashboard",
          "Forecasting",
          "Inventory",
          "Suppliers",
          "Analytics",
          "Settings",
        ].map((item) => (
          <div
            key={item}
            style={{
              padding: "14px",
              marginBottom: "10px",
              borderRadius: "10px",
              background:
                item === "Dashboard"
                  ? "linear-gradient(90deg,#4f46e5,#06b6d4)"
                  : "transparent",
              cursor: "pointer",
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main */}
      <section style={{ flex: 1, padding: "30px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "36px", margin: 0 }}>
              Global Supply Dashboard
            </h1>
            <p style={{ color: "#94a3b8" }}>
              Real-time AI forecasting & inventory intelligence
            </p>
          </div>

          <button
            style={{
              padding: "12px 18px",
              background: "linear-gradient(90deg,#4f46e5,#06b6d4)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            + Generate AI Report
          </button>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                background: "#111827",
                padding: "22px",
                borderRadius: "16px",
              }}
            >
              <p style={{ color: "#94a3b8" }}>{card.title}</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>
                {card.value}
              </h2>
              <span style={{ color: "#22c55e" }}>{card.change}</span>
            </div>
          ))}
        </div>

        {/* Chart + Alerts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Fake Chart */}
          <div
            style={{
              background: "#111827",
              padding: "25px",
              borderRadius: "16px",
            }}
          >
            <h3>Demand Forecast</h3>

            <div
              style={{
                marginTop: "25px",
                height: "260px",
                display: "flex",
                alignItems: "end",
                gap: "12px",
              }}
            >
              {[60, 80, 70, 110, 130, 100, 160, 180].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}px`,
                    borderRadius: "10px 10px 0 0",
                    background:
                      "linear-gradient(180deg,#06b6d4,#4f46e5)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div
            style={{
              background: "#111827",
              padding: "25px",
              borderRadius: "16px",
            }}
          >
            <h3>AI Alerts</h3>

            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  marginTop: "12px",
                  background: "#1e293b",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                {alert}
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div
          style={{
            background: "#111827",
            padding: "25px",
            borderRadius: "16px",
          }}
        >
          <h3>Top Product Intelligence</h3>

          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Product</th>
                <th style={{ padding: "12px" }}>Demand</th>
                <th style={{ padding: "12px" }}>Stock Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.name}>
                  <td style={{ padding: "12px" }}>{item.name}</td>
                  <td style={{ padding: "12px", color: "#22c55e" }}>
                    {item.demand}
                  </td>
                  <td style={{ padding: "12px" }}>{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
