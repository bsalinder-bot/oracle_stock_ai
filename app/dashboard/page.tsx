"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [time, setTime] = useState("");
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString());
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const menu = [
    "Dashboard",
    "Forecasting",
    "Inventory",
    "Suppliers",
    "Analytics",
    "Settings",
  ];

  const stats = [
    { title: "Revenue Protected", value: "$18.4M", growth: "+34%" },
    { title: "Stockout Risk", value: "6%", growth: "-21%" },
    { title: "Inventory Accuracy", value: "99.2%", growth: "+8%" },
    { title: "Supplier Health", value: "97/100", growth: "+14%" },
  ];

  const alerts = [
    "AI predicts demand surge in AI Chips",
    "London warehouse nearing capacity",
    "Supplier delay risk in Taiwan",
    "Auto reorder triggered for 5,400 units",
  ];

  const bars = [90, 120, 110, 160, 190, 170, 230, 260];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#050816,#0d1326,#111827,#0f172a)",
        color: "white",
        display: "flex",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          padding: 30,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: 34,
            marginBottom: 40,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          OracleStock AI
        </h1>

        {menu.map((item) => (
          <div
            key={item}
            onClick={() => setActive(item)}
            style={{
              padding: "14px 18px",
              marginBottom: 14,
              borderRadius: 14,
              cursor: "pointer",
              background:
                active === item
                  ? "linear-gradient(90deg,#2563eb,#06b6d4)"
                  : "transparent",
              fontWeight: active === item ? 700 : 500,
              transition: "0.3s",
            }}
          >
            {item}
          </div>
        ))}

        <div
          style={{
            marginTop: 40,
            padding: 18,
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7 }}>Live System Time</div>
          <div style={{ fontSize: 22, marginTop: 6, fontWeight: 700 }}>
            {time}
          </div>
        </div>
      </aside>

      {/* Main */}
      <section style={{ flex: 1, padding: 35 }}>
        {/* Top */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div>
            <h2 style={{ fontSize: 48, margin: 0, fontWeight: 800 }}>
              Global Supply Intelligence
            </h2>
            <p style={{ opacity: 0.7, marginTop: 8 }}>
              Billion-dollar AI inventory operating system
            </p>
          </div>

          <button
            style={{
              border: "none",
              color: "white",
              padding: "16px 24px",
              borderRadius: 16,
              fontWeight: 700,
              cursor: "pointer",
              background: "linear-gradient(90deg,#2563eb,#06b6d4)",
              boxShadow: "0 10px 30px rgba(37,99,235,.35)",
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
            gap: 20,
            marginBottom: 24,
          }}
        >
          {stats.map((card) => (
            <div
              key={card.title}
              style={{
                padding: 24,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ opacity: 0.75 }}>{card.title}</div>
              <div
                style={{
                  fontSize: 42,
                  marginTop: 12,
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  color: card.growth.includes("-") ? "#f87171" : "#4ade80",
                  marginTop: 10,
                  fontWeight: 700,
                }}
              >
                {card.growth}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
          }}
        >
          {/* Chart */}
          <div
            style={{
              padding: 26,
              borderRadius: 22,
              background: "rgba(255,255,255,0.04)",
              minHeight: 420,
            }}
          >
            <h3 style={{ fontSize: 28, marginTop: 0 }}>Demand Forecast</h3>
            <p style={{ opacity: 0.7 }}>Projected next 8 months</p>

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: 14,
                height: 280,
                marginTop: 30,
              }}
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: h,
                    borderRadius: 14,
                    background:
                      "linear-gradient(180deg,#22d3ee,#2563eb,#1d4ed8)",
                    boxShadow: "0 10px 30px rgba(37,99,235,.25)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right */}
          <div
            style={{
              display: "grid",
              gap: 24,
            }}
          >
            {/* Alerts */}
            <div
              style={{
                padding: 24,
                borderRadius: 22,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: 26 }}>AI Alerts</h3>

              {alerts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.05)",
                    marginBottom: 12,
                    fontSize: 15,
                  }}
                >
                  {a}
                </div>
              ))}
            </div>

            {/* Copilot */}
            <div
              style={{
                padding: 24,
                borderRadius: 22,
                background:
                  "linear-gradient(135deg,rgba(37,99,235,.18),rgba(6,182,212,.18))",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: 26 }}>AI Copilot</h3>
              <p style={{ opacity: 0.8 }}>
                Recommendation: Shift 18% stock from London to Berlin to avoid
                projected shortage.
              </p>

              <button
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "linear-gradient(90deg,#2563eb,#06b6d4)",
                }}
              >
                Execute Smart Transfer
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
