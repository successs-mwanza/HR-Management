import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">

      {/* Left side */}
      <h2 className="logo">
        <i className="bi bi-people-fill"></i> HR Dashboard
      </h2>

      {/* Right side */}
      <div className="nav-right">

        <i className="bi bi-search"></i>

        <i className="bi bi-bell"></i>

        <i className="bi bi-person-circle"></i>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <i className="bi bi-list"></i>
        </div>

      </div>

    </nav>
  );
}

export default Navbar;