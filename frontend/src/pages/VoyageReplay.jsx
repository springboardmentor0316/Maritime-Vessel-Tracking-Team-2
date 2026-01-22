import Sidebar from "../components/Sidebar";

export default function VoyageReplay() {
  return (
    <div style={{ display: "flex", height: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ padding: "40px" }}>
        <h1>Voyage Replay</h1>
        <p>Replay past vessel journeys here.</p>
      </div>
    </div>
  );
}
