export default function Home() {
  const features = [
    {
      icon: "📈",
      title: "Demand Forecasting",
      text: "Predict future product demand using AI models trained on real trends.",
    },
    {
      icon: "📦",
      title: "Inventory Optimization",
      text: "Reduce overstock, prevent shortages, and improve cash flow.",
    },
    {
      icon: "⚠️",
      title: "Risk Intelligence",
      text: "Detect supplier delays, disruptions, and weak points early.",
    },
    {
      icon: "📊",
      title: "Live Analytics",
      text: "See operational KPIs in real time across your supply chain.",
    },
    {
      icon: "🤖",
      title: "AI Recommendations",
      text: "Get suggested actions instead of just dashboards.",
    },
    {
      icon: "🌍",
      title: "Global Visibility",
      text: "Monitor performance across warehouses, vendors, and regions.",
    },
  ];

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#111",
        background: "#ffffff",
        margin: 0,
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 60px",
          borderBottom: "1px solid #eee",
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h2 style={{ margin: 0 }}>OracleStock AI</h2>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <span>Features</span>
          <span>Solutions</span>
          <span>Pricing</span>
          <span>Contact</span>

          <button
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "110px 24px",
          textAlign: "center",
          background:
            "linear-gradient(180deg, #f8fafc 0%, #ffffff 55%, #ffffff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#eef2ff",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            AI for Supply Chains & Inventory Teams
          </div>

          <h1
            style={{
              fontSize: "68px",
              lineHeight: 1.05,
              margin: "0 0 22px",
            }}
          >
            Predict Demand.
            <br />
            Prevent Waste.
            <br />
            Grow Smarter.
          </h1>

          <p
            style={{
              fontSize: "22px",
              color: "#555",
              maxWidth: "760px",
              margin: "0 auto 36px",
              lineHeight: 1.5,
            }}
          >
            OracleStock AI helps companies forecast inventory, reduce shortages,
            detect supplier risk, and make faster decisions with artificial
            intelligence.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                padding: "16px 28px",
                borderRadius: "12px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Start Free Trial
            </button>

            <button
              style={{
                background: "#f3f4f6",
                color: "#111",
                border: "none",
                padding: "16px 28px",
                borderRadius: "12px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Book Demo
            </button>
          </div>

          <p
            style={{
              marginTop: "18px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            No credit card required • Setup in minutes
          </p>
        </div>
      </section>

      {/* TRUST BAR */}
      <section
        style={{
          padding: "20px 24px 50px",
          textAlign: "center",
          color: "#777",
        }}
      >
        Trusted by modern operations teams worldwide
      </section>

      {/* FEATURES */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "22px",
        }}
      >
        {features.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              borderRadius: "18px",
              padding: "28px",
              background: "#fff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>
              {item.icon}
            </div>

            <h3 style={{ margin: "0 0 10px" }}>{item.title}</h3>

            <p style={{ color: "#666", lineHeight: 1.6, margin: 0 }}>
              {item.text}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section
        style={{
          margin: "0 24px 80px",
          borderRadius: "24px",
          background: "#111",
          color: "#fff",
          textAlign: "center",
          padding: "70px 24px",
        }}
      >
        <h2 style={{ fontSize: "44px", marginTop: 0 }}>
          Ready to modernize your supply chain?
        </h2>

        <p
          style={{
            color: "#ccc",
            fontSize: "20px",
            maxWidth: "700px",
            margin: "0 auto 28px",
          }}
        >
          Join companies using AI to improve planning, inventory, and growth.
        </p>

        <button
          style={{
            background: "#fff",
            color: "#111",
            border: "none",
            padding: "16px 28px",
            borderRadius: "12px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Get Started Today
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px",
          color: "#777",
          borderTop: "1px solid #eee",
        }}
      >
        © 2026 OracleStock AI • Built for the future of operations
      </footer>
    </main>
  );
}
