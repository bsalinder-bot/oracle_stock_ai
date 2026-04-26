"use client";

import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { role: "ai", text: "Hello. I am OracleStock Copilot. Ask about stock, demand, suppliers, or risk." },
  ]);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const chartBars = useMemo(
    () => [42, 58, 55, 74, 88, 79, 104, 118],
    []
  );

  const menu = [
    "Dashboard",
    "Forecasting",
    "Inventory",
    "Suppliers",
    "Analytics",
    "Settings",
  ];

  const stats = [
    { title: "Revenue Protected", value: "$24.8M", change: "+41%" },
    { title: "Stockout Risk", value: "4%", change: "-33%" },
    { title: "Inventory Accuracy", value: "99.6%", change: "+9%" },
    { title: "Supplier Health", value: "98/100", change: "+16%" },
  ];

  const inventory = [
    { item: "AI Chips", stock: 8420, status: "Healthy" },
    { item: "Sensors", stock: 940, status: "Low" },
    { item: "Storage Units", stock: 6110, status: "Healthy" },
    { item: "Cooling Fans", stock: 210, status: "Critical" },
  ];

  const suppliers = [
    { name: "Taiwan Foundry", score: "97%" },
    { name: "Berlin Components", score: "93%" },
    { name: "London Logistics", score: "91%" },
    { name: "Tokyo Sensors", score: "96%" },
  ];

  const alerts = [
    "AI predicts 18% demand surge next month",
    "Cooling Fans low stock detected",
    "Supplier route delay risk in Asia",
    "Auto reorder created for 5,400 units",
  ];

  function askAI() {
    if (!message.trim()) return;

    const userText = message;
    const lower = userText.toLowerCase();

    let reply =
      "Based on current supply signals, maintain safety stock and monitor demand weekly.";

    if (lower.includes("stock")) {
      reply =
        "Current stock health is strong overall. Cooling Fans are critical and Sensors are low.";
    } else if (lower.includes("supplier")) {
      reply =
        "Top supplier reliability is Taiwan Foundry at 97%. Asia route delay risk needs monitoring.";
    } else if (lower.includes("demand")) {
      reply =
        "Demand forecast shows strong upward momentum over the next 8 months.";
    } else if (lower.includes("revenue")) {
      reply =
        "Revenue protected increased to $24.8M with stronger forecasting accuracy.";
    }

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "ai", text: reply },
    ]);
    setMessage("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right,#17315f 0%,#0b1020 35%,#070b16 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "270px",
          padding: "28px 20px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            marginBottom: "35px",
            lineHeight: 1.1,
          }}
        >
          OracleStock AI
        </h1>

        {menu.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            style={{
              width: "100%",
              textAlign: "left",
              marginBottom: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "17px",
              background:
                active === item
                  ? "linear-gradient(90deg,#2563eb,#22d3ee)"
                  : "rgba(255,255,255,0.03)",
              boxShadow:
                active === item
                  ? "0 0 18px rgba(34,211,238,0.35)"
                  : "none",
            }}
          >
            {item}
          </button>
        ))}

        <div
          style={{
            marginTop: "30px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ opacity: 0.7, fontSize: "14px" }}>Live System Time</div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>
            {time}
          </div>
        </div>
      </aside>

      {/* Main */}
      <section style={{ flex: 1, padding: "28px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "54px", margin: 0, fontWeight: 900 }}>
              Global Supply Intelligence
            </h2>
            <p style={{ opacity: 0.75, marginTop: "10px", fontSize: "18px" }}>
              Billion-dollar AI inventory operating system
            </p>
          </div>

          <button
            style={{
              border: "none",
              color: "white",
              padding: "18px 24px",
              borderRadius: "16px",
              fontWeight: 700,
              cursor: "pointer",
              background: "linear-gradient(90deg,#2563eb,#22d3ee)",
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
            marginTop: "28px",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.title}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "20px",
                padding: "24px",
              }}
            >
              <div style={{ opacity: 0.7 }}>{s.title}</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px" }}>
                {s.value}
              </div>
              <div style={{ color: "#4ade80", marginTop: "8px" }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            marginTop: "22px",
          }}
        >
          {/* Chart */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "22px",
              padding: "24px",
            }}
          >
            <h3 style={{ fontSize: "34px", marginTop: 0 }}>Demand Forecast</h3>
            <p style={{ opacity: 0.7 }}>Projected next 8 months</p>

            <div
              style={{
                height: "320px",
                display: "flex",
                alignItems: "flex-end",
                gap: "14px",
                marginTop: "24px",
              }}
            >
              {chartBars.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${bar}%`,
                    borderRadius: "14px 14px 0 0",
                    background:
                      "linear-gradient(180deg,#22d3ee 0%,#2563eb 100%)",
                    boxShadow: "0 0 20px rgba(34,211,238,0.3)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Alerts */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: "32px" }}>AI Alerts</h3>

              {alerts.map((a) => (
                <div
                  key={a}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.04)",
                    marginBottom: "10px",
                  }}
                >
                  {a}
                </div>
              ))}
            </div>

            {/* AI Copilot */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: "30px" }}>AI Copilot</h3>

              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  marginBottom: "12px",
                }}
              >
                {chat.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "12px",
                      background:
                        m.role === "ai"
                          ? "rgba(34,211,238,0.10)"
                          : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <strong>{m.role === "ai" ? "AI" : "You"}:</strong> {m.text}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask AI..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    outline: "none",
                  }}
                />
                <button
                  onClick={askAI}
                  style={{
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    background: "linear-gradient(90deg,#2563eb,#22d3ee)",
                    color: "white",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "22px",
          }}
        >
          {/* Inventory */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "22px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: "30px" }}>Inventory</h3>

            {inventory.map((row) => (
              <div
                key={row.item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span>{row.item}</span>
                <span>{row.stock}</span>
                <span>{row.status}</span>
              </div>
            ))}
          </div>

          {/* Suppliers */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "22px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: "30px" }}>Suppliers</h3>

            {suppliers.map((row) => (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span>{row.name}</span>
                <span style={{ color: "#4ade80" }}>{row.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
