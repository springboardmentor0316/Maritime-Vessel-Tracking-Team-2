import "../styles/Topbar.css";

export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1>Vessel Tracking</h1>
        <p>Real-time maritime intelligence</p>
      </div>

      <div className="topbar-right">
        <div className="notification">
          🔔
          <span className="badge">3</span>
        </div>
      </div>
    </header>
  );
}
