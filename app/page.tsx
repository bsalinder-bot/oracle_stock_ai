export default function Home() {
  return (
    <main style={{fontFamily:"Arial", padding:"40px", maxWidth:"1100px", margin:"auto"}}>
      <section style={{textAlign:"center", padding:"80px 20px"}}>
        <h1 style={{fontSize:"56px", marginBottom:"20px"}}>
          OracleStock AI
        </h1>
        <p style={{fontSize:"22px", color:"#555", marginBottom:"30px"}}>
          AI-Powered Supply Chain Forecasting & Inventory Intelligence
        </p>
        <button style={{
          padding:"14px 28px",
          fontSize:"18px",
          background:"#111",
          color:"#fff",
          border:"none",
          borderRadius:"8px"
        }}>
          Start Free Trial
        </button>
      </section>

      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"20px"}}>
        <div><h3>📈 Forecast Demand</h3><p>Predict future stock needs using AI.</p></div>
        <div><h3>📦 Optimize Inventory</h3><p>Reduce waste and prevent shortages.</p></div>
        <div><h3>⚠️ Supplier Risk Alerts</h3><p>Detect disruptions before they happen.</p></div>
        <div><h3>📊 Live Analytics</h3><p>Track operations in real time.</p></div>
      </section>

      <footer style={{marginTop:"80px", padding:"30px 0", color:"#666"}}>
        © 2026 OracleStock AI
      </footer>
    </main>
  );
}
