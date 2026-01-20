import "../styles/Navbar.css";

export default function Navbar() {
  // Read username from backend login 
  const username = localStorage.getItem("username") || "A";

  return (
    <div className="navbar">
      <input type="search" placeholder="Search..." />

      {/* User Initial */}
      <div className="user-circle">
        {username.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
