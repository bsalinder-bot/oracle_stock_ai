export default function Dashboard() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b0f19",
      color: "white",
      fontFamily: "Arial, sans-serif",
      display: "flex"
    }}>
      
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        background: "#111827",
        padding: "30px 20px",
        borderRight: "1px solid #1f2937"
      }}>
        <h1 style={{
          fontSize: "32px",
          marginBottom: "40px",
          fontWeight: "bold"
        }}>
          OracleStock AI
        </h1>

        {[
          "Dashboard",
          "Forecasting",
          "Inventory",
          "Suppliers",
          "Analytics",
          "Reports",
          "Billing",
          "Settings"
        ].map((item, i) => (
          <div key={i} style={{
            padding: "14px 18px",
            marginBottom: "12px",
            borderRadius: "12px",
            background: i === 0 ? "linear-gradient(90deg,#2563eb,#06b6d4)" : "transparent",
            cursor: "pointer",
            fontSize: "18px"
          }}>
            {item}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <section style={{
        flex: 1,
        padding: "40px"
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <div>
            <h2 style={{ fontSize: "46px", marginBottom: "10px" }}>
              OracleStock AI V4
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "20px" }}>
              Billion-Dollar Supply Chain Intelligence Platform
            </p>
          </div>

          <button style={{
            padding: "18px 28px",
            border: "none",
            borderRadius: "14px",
            background: "linear-gradient(90deg,#2563eb,#06b6d4)",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            + Generate AI Report
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {[
            ["Revenue Protected", "$18.2M", "+32%"],
            ["Stockout Risk", "5%", "-18%"],
            ["Inventory Accuracy", "99.1%", "+6%"],
            ["Supplier Health", "97/100", "+12%"]
          ].map((card, i) => (
            <div key={i} style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "18px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)"
            }}>
              <p style={{ color: "#94a3b8", marginBottom: "12px" }}>{card[0]}</p>
              <h3 style={{ fontSize: "42px", marginBottom: "8px" }}>{card[1]}</h3>
              <span style={{ color: "#22c55e", fontSize: "18px" }}>{card[2]}</span>
            </div>
          ))}
        </div>

        {/* Middle Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "25px",
          marginBottom: "30px"
        }}>

          {/* Forecast Chart */}
          <div style={{
            background: "#111827",
            borderRadius: "18px",
            padding: "25px"
          }}>
            <h3 style={{ fontSize: "28px", marginBottom: "20px" }}>
              AI Demand Forecast
            </h3>

            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "16px",
              height: "260px",
              marginTop: "20px"
            }}>
              {[80,110,95,140,170,130,210,240].map((h,i)=>(
                <div key={i} style={{
                  flex:1,
                  height:`${h}px`,
                  borderRadius:"10px",
                  background:"linear-gradient(180deg,#06b6d4,#2563eb)"
                }} />
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div style={{
            background:"#111827",
            borderRadius:"18px",
            padding:"25px"
          }}>
            <h3 style={{ fontSize:"28px", marginBottom:"18px" }}>
              Live AI Alerts
            </h3>

            {[
              "⚠ Taiwan shipment delay detected",
              "📈 Demand spike for AI Chips",
              "📦 London warehouse near capacity",
              "🤖 Reorder 4,200 units recommended",
              "🚚 Route optimization saved £120k"
            ].map((item,i)=>(
              <div key={i} style={{
                padding:"14px",
                background:"#1f2937",
                borderRadius:"12px",
                marginBottom:"12px"
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Cards */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(3,1fr)",
          gap:"20px"
        }}>
          {[
            ["AI Prediction", "Demand +28% in Germany next week"],
            ["Cost Savings", "£1.8M saved this quarter"],
            ["Automation Score", "94% processes automated"]
          ].map((box,i)=>(
            <div key={i} style={{
              background:"#111827",
              padding:"24px",
              borderRadius:"18px"
            }}>
              <h4 style={{ fontSize:"24px", marginBottom:"12px" }}>
                {box[0]}
              </h4>
              <p style={{ color:"#94a3b8", fontSize:"18px" }}>
                {box[1]}
              </p>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
